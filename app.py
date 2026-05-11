from dotenv import load_dotenv
load_dotenv()  # loads .env before anything else reads os.environ

from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_mail import Mail, Message as MailMessage
import os
import json
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
from models import db, Account, Post, Message, User, Admin, Report
import random

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'change_me_in_production')


class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)


app.json_encoder = DateTimeEncoder

app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = os.environ.get("MAIL_USERNAME", "")
app.config["MAIL_PASSWORD"] = os.environ.get("MAIL_PASSWORD", "")
app.config["MAIL_DEFAULT_SENDER"] = os.environ.get("MAIL_USERNAME", "")

mail = Mail(app)

app.config['UPLOAD_FOLDER'] = 'static/images'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# PostgreSQL via DATABASE_URL env var; falls back to SQLite for local dev
db_url = os.environ.get('DATABASE_URL', 'sqlite:///lostandfound.db')
# Heroku/Railway use postgres:// but SQLAlchemy requires postgresql://
if db_url.startswith('postgres://'):
    db_url = db_url.replace('postgres://', 'postgresql://', 1)
app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)


# UI HTML ROUTES

@app.route("/")
def login():
    return render_template("login.html")


@app.route("/register")
def register():
    return render_template("register.html")


@app.route("/forgot-password")
def forgot_password():
    return render_template("forgotpassword.html")


@app.route("/dashboard")
def dashboard():
    posts = Post.query.order_by(Post.post_date.desc()).all()
    user_name = session.get('user_name', '')
    parts = user_name.split()
    if len(parts) >= 2:
        initials = parts[0][0].upper() + parts[-1][0].upper()
    elif parts:
        initials = parts[0][:2].upper()
    else:
        initials = 'ME'
    return render_template("dashboard.html", posts=posts, user_initials=initials, user_email=session.get('user_email', ''))


@app.route("/listing-info")
def listing_info():
    post_id = request.args.get('id', 1, type=int)
    post = Post.query.get(post_id)
    if not post:
        return render_template("listing_info.html", post=None)
    return render_template("listing_info.html", post=post)


@app.route("/createlisting")
def create_listing():
    return render_template("createlisting.html")


@app.route("/my_listings")
def my_listings():
    if 'user_id' not in session:
        return redirect("/")
    current_user_id = session['user_id']
    user_posts = Post.query.filter_by(
        user_id=current_user_id).order_by(Post.post_date.desc()).all()
    return render_template("my_listings.html", listings=user_posts)


@app.route("/edit_listing")
def edit_listing():
    if 'user_id' not in session:
        return redirect("/")
    post_id = request.args.get('edit', type=int)
    post_to_edit = Post.query.get(post_id)
    if not post_to_edit or post_to_edit.user_id != session['user_id']:
        return redirect("/my_listings")
    return render_template("edit_listing.html", post=post_to_edit)


@app.route("/messages")
def messages():
    if 'user_id' not in session:
        return redirect("/")
    return render_template("messages.html")

@app.route("/feedback")
def feedback():
    return render_template("feedback.html")


# API ROUTES

@app.route("/api/register", methods=["POST"])
def api_register():
    data = request.get_json()

    existing_user = Account.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({"success": False, "message": "Email already registered."})

    hashed_password = generate_password_hash(data['password'])
    new_account = Account(name=data['name'], email=data['email'], password=hashed_password)

    try:
        db.session.add(new_account)
        db.session.commit()

        new_user = User(account_id=new_account.id, username=data['name'])
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"success": True, "message": "Account created!"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Server Error: {str(e)}"})


@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required."})

    if not email.endswith("@southernct.edu"):
        return jsonify({"success": False, "message": "Please use your SouthernCT email."})

    user_account = Account.query.filter_by(email=email).first()

    if not user_account:
        return jsonify({"success": False, "message": "Invalid email or password"})

    if user_account.is_banned:
        return jsonify({"success": False, "message": "Your account has been banned. Contact an admin."})

    password_matches = (
        user_account.password == password or
        check_password_hash(user_account.password, password)
    )

    if not password_matches:
        return jsonify({"success": False, "message": "Invalid email or password"})

    user_profile = User.query.filter_by(account_id=user_account.id).first()
    if not user_profile:
        user_profile = User(account_id=user_account.id, username=user_account.name)
        db.session.add(user_profile)
        db.session.commit()

    session["user_id"] = user_profile.id
    session["account_id"] = user_account.id
    session["user_email"] = user_account.email
    session["user_name"] = user_account.name

    admin = Admin.query.filter_by(user_id=user_profile.id).first()
    if admin:
        session["is_admin"] = True
        session["admin_id"] = admin.id
        return jsonify({"success": True, "message": "Admin login successful!", "redirect": "/admin"})

    session["is_admin"] = False
    return jsonify({"success": True, "message": "Login successful!", "redirect": "/dashboard"})


@app.route("/api/listings", methods=["POST"])
def api_create_listing():
    if 'user_id' not in session:
        return jsonify({"success": False, "message": "Please log in first."})

    user_id = session['user_id']
    image_url = None

    if 'image' in request.files:
        file = request.files['image']
        if file.filename != '':
            extension = file.filename.rsplit('.', 1)[1].lower()
            unique_name = str(uuid.uuid4()) + "." + extension
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_name)
            file.save(filepath)
            image_url = f"images/{unique_name}"

    new_post = Post(
        user_id=user_id,
        item_name=request.form.get('title'),
        description=request.form.get('description'),
        category=request.form.get('category'),
        location=request.form.get('location'),
        image_url=image_url
    )

    try:
        db.session.add(new_post)
        db.session.commit()
        return jsonify({"success": True})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)})


@app.route("/api/listings/claim/<int:post_id>", methods=["POST"])
def api_claim_listing(post_id):
    post = Post.query.get_or_404(post_id)
    post.is_claimed = True
    try:
        db.session.commit()
        return jsonify({"success": True})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)})


@app.route("/api/listings/unclaim/<int:post_id>", methods=["POST"])
def api_unclaim_listing(post_id):
    post = Post.query.get_or_404(post_id)
    post.is_claimed = False
    try:
        db.session.commit()
        return jsonify({"success": True})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)})


@app.route("/api/listings/update/<int:post_id>", methods=["POST"])
def api_update_listing(post_id):
    post = Post.query.get_or_404(post_id)
    post.item_name = request.form.get("item_name")
    post.location = request.form.get("location")
    post.category = request.form.get("category")
    db.session.commit()
    return redirect("/my_listings")


@app.route('/delete-listing/<int:id>', methods=['POST'])
def delete_listing(id):
    listing = Post.query.get_or_404(id)
    try:
        db.session.delete(listing)
        db.session.commit()
        return {"success": True}, 200
    except Exception as e:
        db.session.rollback() # This is the "key" to fixing OperationalErrors
        print(f"Error occurred: {e}")
        return {"success": False, "error": str(e)}, 500


# Messaging API

@app.route("/api/conversations", methods=["GET"])
def api_conversations():
    if 'user_id' not in session:
        return jsonify([])

    user_id = session['user_id']

    msgs = Message.query.filter(
        (Message.sender_id == user_id) | (Message.receiver_id == user_id)
    ).order_by(Message.timestamp.desc()).all()

    seen = set()
    conversations = []
    for msg in msgs:
        other_id = msg.receiver_id if msg.sender_id == user_id else msg.sender_id
        key = (msg.post_id, other_id)
        if key not in seen:
            seen.add(key)
            post = Post.query.get(msg.post_id) if msg.post_id else None
            other_user = User.query.get(other_id)
            other_account = Account.query.get(other_user.account_id) if other_user else None
            conversations.append({
                "post_id": msg.post_id,
                "post_name": post.item_name if post else "General",
                "other_user_id": other_id,
                "other_user_name": other_account.name if other_account else "Unknown",
                "last_message": msg.message_text,
                "timestamp": msg.timestamp.isoformat() if msg.timestamp else None
            })

    return jsonify(conversations)


@app.route("/api/messages/<int:post_id>", methods=["GET", "POST"])
def api_messages(post_id):
    if 'user_id' not in session:
        return jsonify({"success": False, "message": "Please log in."})

    user_id = session['user_id']

    if request.method == "POST":
        data = request.get_json()
        receiver_id = data.get('receiver_id')

        if not receiver_id:
            post = Post.query.get(post_id)
            receiver_id = post.user_id if post else None

        if not receiver_id:
            return jsonify({"success": False, "message": "No receiver specified."})

        new_msg = Message(
            message_text=data['text'],
            sender_id=user_id,
            receiver_id=int(receiver_id),
            post_id=post_id
        )
        db.session.add(new_msg)
        db.session.commit()
        return jsonify({"success": True})

    # GET
    other_user_id = request.args.get('other_user_id', type=int)
    if other_user_id:
        msgs = Message.query.filter(
            Message.post_id == post_id,
            (
                ((Message.sender_id == user_id) & (Message.receiver_id == other_user_id)) |
                ((Message.sender_id == other_user_id) & (Message.receiver_id == user_id))
            )
        ).order_by(Message.timestamp.asc()).all()
    else:
        msgs = Message.query.filter_by(post_id=post_id).order_by(Message.timestamp.asc()).all()

    return jsonify([{
        "id": m.id,
        "text": m.message_text,
        "sender_id": m.sender_id,
        "receiver_id": m.receiver_id,
        "timestamp": m.timestamp.isoformat() if m.timestamp else None,
        "is_mine": m.sender_id == user_id
    } for m in msgs])


reset_codes = {}


@app.route("/api/forgot-password", methods=["POST"])
def api_forgot_password():
    data = request.get_json()
    email = data.get("email")

    if not email or not email.endswith("@southernct.edu"):
        return jsonify({"success": False, "message": "Please enter a valid SouthernCT email."})

    user = Account.query.filter_by(email=email).first()
    if not user:
        return jsonify({"success": False, "message": "Account not found."})

    code = str(random.randint(100000, 999999))
    reset_codes[email] = code

    try:
        msg = MailMessage(
            subject="Lost and Found Password Reset Code",
            recipients=[email],
            body=f"Your password reset verification code is: {code}"
        )
        mail.send(msg)
        return jsonify({"success": True, "message": "Verification code sent to your email."})
    except Exception as e:
        return jsonify({"success": False, "message": f"Email failed to send: {str(e)}"})


@app.route("/api/verify-reset-code", methods=["POST"])
def api_verify_reset_code():
    data = request.get_json()
    email = data.get("email")
    code = data.get("code")

    if reset_codes.get(email) != code:
        return jsonify({"success": False, "message": "Invalid verification code."})

    return jsonify({"success": True, "message": "Code verified."})


@app.route("/api/reset-password", methods=["POST"])
def api_reset_password():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = Account.query.filter_by(email=email).first()
    if not user:
        return jsonify({"success": False, "message": "Account not found."})

    user.password = generate_password_hash(password)
    db.session.commit()

    if email in reset_codes:
        del reset_codes[email]

    return jsonify({"success": True, "message": "Password updated."})


@app.route("/api/report", methods=["POST"])
def api_report():
    if 'user_id' not in session:
        return jsonify({"success": False, "message": "You must be logged in to report."}), 401

    data = request.get_json()
    post_id = data.get("post_id")
    reason  = data.get("reason", "")

    post = Post.query.get(post_id)
    if not post:
        return jsonify({"success": False, "message": "Post not found."}), 404

    reporter_user = User.query.get(session['user_id'])
    reporter_account = Account.query.get(reporter_user.account_id) if reporter_user else None
    reporting_email = reporter_account.email if reporter_account else session.get('user_email', '')

    owner_user = User.query.get(post.user_id)
    owner_account = Account.query.get(owner_user.account_id) if owner_user else None
    reportee_email = owner_account.email if owner_account else ''

    report = Report(
        reporting_email=reporting_email,
        reportee_email=reportee_email,
        post_id=post_id,
        reason=reason,
        status='Pending'
    )
    db.session.add(report)
    db.session.commit()

    return jsonify({"success": True, "message": "Report submitted."})


def admin_required():
    return session.get("is_admin") == True


@app.route("/admin-login")
def admin_login_page():
    return render_template("admin_login.html")


@app.route("/admin-register")
def admin_register_page():
    return render_template("admin_register.html")


@app.route("/api/admin-login", methods=["POST"])
def api_admin_login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    admin = Admin.query.filter_by(admin_username=username).first()
    if not admin:
        return jsonify({"success": False, "message": "Invalid admin username or password."})

    password_matches = (
        admin.admin_password == password or
        check_password_hash(admin.admin_password, password)
    )

    if not password_matches:
        return jsonify({"success": False, "message": "Invalid admin username or password."})

    session["is_admin"] = True
    session["admin_id"] = admin.id
    return jsonify({"success": True, "message": "Admin login successful."})


@app.route("/api/admin-register", methods=["POST"])
def api_admin_register():
    data = request.get_json()

    setup_key = data.get("setup_key")
    expected_key = os.environ.get("ADMIN_SETUP_KEY", "change_this_before_deploying")

    if setup_key != expected_key:
        return jsonify({"success": False, "message": "Invalid setup key."})

    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return jsonify({"success": False, "message": "Username and password are required."})

    if Admin.query.filter_by(admin_username=username).first():
        return jsonify({"success": False, "message": "Username already taken."})

    new_admin = Admin(
        admin_username=username,
        admin_password=generate_password_hash(password)
    )
    db.session.add(new_admin)
    db.session.commit()

    return jsonify({"success": True, "message": f"Admin '{username}' created successfully."})


@app.route("/admin")
def admin_dashboard():
    if not admin_required():
        return redirect("/admin-login")

    users = Account.query.all()
    posts = Post.query.order_by(Post.post_date.desc()).all()
    reports = Report.query.order_by(Report.created_at.desc()).all()

    total_users = Account.query.count()
    total_posts = Post.query.count()
    total_reports = Report.query.count()
    banned_users = Account.query.filter_by(is_banned=True).count()

    return render_template(
        "admin.html",
        users=users,
        posts=posts,
        reports=reports,
        total_users=total_users,
        total_posts=total_posts,
        total_reports=total_reports,
        banned_users=banned_users
    )


@app.route("/api/admin/delete-post/<int:post_id>", methods=["POST"])
def admin_delete_post(post_id):
    if not admin_required():
        return jsonify({"success": False, "message": "Unauthorized"})
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"success": False, "message": "Post not found"})
    db.session.delete(post)
    db.session.commit()
    return jsonify({"success": True, "message": "Post deleted"})


@app.route("/api/admin/toggle-ban/<int:account_id>", methods=["POST"])
def admin_toggle_ban(account_id):
    if not admin_required():
        return jsonify({"success": False, "message": "Unauthorized"})
    account = Account.query.get(account_id)
    if not account:
        return jsonify({"success": False, "message": "Account not found"})
    account.is_banned = not account.is_banned
    db.session.commit()
    return jsonify({"success": True, "message": "User status updated"})


@app.route("/api/admin/toggle-claimed/<int:post_id>", methods=["POST"])
def admin_toggle_claimed(post_id):
    if not admin_required():
        return jsonify({"success": False, "message": "Unauthorized"})
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"success": False, "message": "Post not found"})
    post.is_claimed = not post.is_claimed
    db.session.commit()
    return jsonify({"success": True, "message": "Post claimed status updated"})


@app.route("/admin-logout")
def admin_logout():
    session.pop("is_admin", None)
    session.pop("admin_id", None)
    return redirect("/admin-login")


if __name__ == "__main__":
    app.run(debug=True)
