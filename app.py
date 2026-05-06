from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_mail import Mail, Message as MailMessage
import os
import json
import uuid  # For unique image names
from datetime import datetime
from werkzeug.utils import secure_filename
from models import db, Account, Post, Message, User
import random

app = Flask(__name__)
app.secret_key = 'super_secret_key'  # Needed to keep users logged in
# Custom JSON Encoder to handle datetime objects


class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)


app.json_encoder = DateTimeEncoder


app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True

# Gmail account used by the app to SEND emails
app.config["MAIL_USERNAME"] = "josephofei24@gmail.com"

# Your Gmail App Password (16 characters, no spaces)
app.config["MAIL_PASSWORD"] = "yupdaoscykecqymb"

# Sender email
app.config["MAIL_DEFAULT_SENDER"] = "josephofei24@gmail.com"

mail = Mail(app)

# Configuration for image uploads
app.config['UPLOAD_FOLDER'] = 'static/images'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# DATABASE CONFIGURATION
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///lostandfound.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Bind the database to this app
db.init_app(app)


# UI HTML ROUTES (Pages users see)

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
    # Fetch all listings from the database, newest first
    posts = Post.query.order_by(Post.post_date.desc()).all()
    return render_template("dashboard.html", posts=posts)


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
    # Redirect to login if not logged in
    if 'user_id' not in session:
        return redirect("/")

    current_user_id = session['user_id']

    # Get only the posts made by this user
    user_posts = Post.query.filter_by(
        user_id=current_user_id).order_by(Post.post_date.desc()).all()

    return render_template("my_listings.html", listings=user_posts)


@app.route("/edit_listing")
def edit_listing():
    if 'user_id' not in session:
        return redirect("/")

    # Get the ID from the URL (e.g., /edit_listing?edit=5)
    post_id = request.args.get('edit', type=int)
    post_to_edit = Post.query.get(post_id)

    # Security check: Make sure this post belongs to the logged-in user
    if not post_to_edit or post_to_edit.user_id != session['user_id']:
        return redirect("/my_listings")

    return render_template("edit_listing.html", post=post_to_edit)


@app.route("/messages")
def messages():
    return render_template("messages.html")


# API ROUTES (Backend logic for saving data)

@app.route("/api/register", methods=["POST"])
def api_register():
    data = request.get_json()

    existing_user = Account.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({"success": False, "message": "Email already registered."})

    hashed_password = generate_password_hash(data['password'])

    # 1. Create the Account
    new_account = Account(
        name=data['name'],
        email=data['email'],
        password=hashed_password
    )

    try:
        db.session.add(new_account)
        db.session.commit()  # Save to generate the Account ID

        # 2. Automatically create the linked User profile
        new_user = User(
            account_id=new_account.id,
            username=data['name']
        )
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

    password_matches = (
        user_account.password == password or
        check_password_hash(user_account.password, password)
    )

    if not password_matches:
        return jsonify({"success": False, "message": "Invalid email or password"})

    user_profile = User.query.filter_by(account_id=user_account.id).first()

    if not user_profile:
        user_profile = User(
            account_id=user_account.id,
            username=user_account.name
        )
        db.session.add(user_profile)
        db.session.commit()

    session["user_id"] = user_profile.id

    return jsonify({"success": True, "message": "Login successful!"})

# New API Route for Creating Listings with Images


@app.route("/api/listings", methods=["POST"])
def api_create_listing():
    # Make sure they are logged in first
    if 'user_id' not in session:
        return jsonify({"success": False, "message": "Please log in first."})

    user_id = session['user_id']  # Get ID from the logged-in session

    image_url = None
    if 'image' in request.files:
        file = request.files['image']
        if file.filename != '':
            # Create a unique random name using uuid
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
    
    # Update the fields with the new data from the form
    post.item_name = request.form.get("item_name")
    post.location = request.form.get("location")
    post.category = request.form.get("category")
    # Add any other fields you want to edit here
    
    db.session.commit()
    return redirect("/my-listings") # Go back to the management page

@app.route("/api/listings/delete/<int:post_id>", methods=["DELETE"])
def api_delete_listing(post_id):
    post = Post.query.get_or_404(post_id)
    
    try:
        db.session.delete(post)
        db.session.commit()
        return jsonify({"success": True})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)})


# Real-time Messaging API scaffolding


@app.route("/api/messages/<int:post_id>", methods=["GET", "POST"])
def api_messages(post_id):
    if request.method == "POST":
        data = request.get_json()
        new_msg = Message(
            message_text=data['text'],
            sender_id=1,   # Mock sender ID
            receiver_id=2  # Mock receiver ID
        )
        db.session.add(new_msg)
        db.session.commit()
        return jsonify({"success": True})

    # GET method
    messages = Message.query.all()  # In production, filter by sender_id/receiver_id
    return jsonify([{
        "text": m.message_text,
        "sender_id": m.sender_id,
        "timestamp": m.timestamp.isoformat() if m.timestamp else None
    } for m in messages])


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

        return jsonify({
            "success": True,
            "message": "Verification code sent to your email."
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Email failed to send: {str(e)}"
        })


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


if __name__ == "__main__":
    app.run(debug=True)
