from flask import Flask, render_template, request, jsonify
from flask_mail import Mail, Message as MailMessage
import os
from werkzeug.utils import secure_filename
from models import db, Account, Post, Message
import random

app = Flask(__name__)


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


@app.route("/create-listing")
def create_listing():
    return render_template("createlisting.html")


@app.route("/listing-info")
def listing_info():
    return render_template("listing_info.html")


# API ROUTES (Backend logic for saving data)

@app.route("/api/register", methods=["POST"])
def api_register():
    # 1. Get the data sent from the JavaScript frontend
    data = request.get_json()

    # 2. Check if the email already exists in the database
    existing_user = Account.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({"success": False, "message": "Email already registered."})

    # 3. Create a new Account object using the data from the form
    new_account = Account(
        name=data['name'],
        email=data['email'],
        password=data['password']
    )

    # 4. Save it to the database!
    try:
        db.session.add(new_account)
        db.session.commit()
        return jsonify({"success": True, "message": "Account created!"})
    except Exception as e:
        db.session.rollback()  # Undo if something goes wrong
        return jsonify({"success": False, "message": f"Server Error: {str(e)}"})

# New API Route for Creating Listings with Images


@app.route("/api/listings", methods=["POST"])
def api_create_listing():
    # Note: In a real app, grab user_id from the logged-in session.
    # Hardcoding to 1 for this demonstration.

    user_id = 1

    image_url = None
    if 'image' in request.files:
        file = request.files['image']
        if file.filename != '':
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            image_url = f"images/{filename}"

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
    return jsonify([{"text": m.message_text, "sender_id": m.sender_id} for m in messages])


@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required."})

    if not email.endswith("@southernct.edu"):
        return jsonify({"success": False, "message": "Please use your SouthernCT email."})

    user = Account.query.filter_by(email=email).first()

    if not user:
        return jsonify({"success": False, "message": "Account not found."})

    if user.password != password:
        return jsonify({"success": False, "message": "Incorrect password."})

    return jsonify({
        "success": True,
        "message": "Login successful!",
        "user_id": user.id,
        "name": user.name
    })


reset_codes = {}


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

    user.password = password
    db.session.commit()

    if email in reset_codes:
        del reset_codes[email]

    return jsonify({"success": True, "message": "Password updated."})


if __name__ == "__main__":
    app.run(debug=True)
