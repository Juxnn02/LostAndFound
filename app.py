from flask import Flask, render_template, request, jsonify, url_for, redirect
import os
from werkzeug.utils import secure_filename
from models import db, Account, Post, Message 
from flask_mail import Mail, Message 
from itsdangerous import URLSafeTimedSerializer


app = Flask(__name__)

# Configuration for image uploads
app.config['UPLOAD_FOLDER'] = 'static/images'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# DATABASE CONFIGURATION
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///lostandfound.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['MAIL_SERVER'] = 'smtp.office365.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = 'yourusername@southernct.edu'  
app.config['MAIL_PASSWORD'] = 'your_email_password'         
app.config['MAIL_DEFAULT_SENDER'] = 'yourusername@southernct.edu'

 mail = Mail(app)

def generate_token(email):
    s = URLSafeTimedSerializer(app.secret_key)
    return s.dump(email)

def confrim_token(token, expiration=30):
    s = URLSafeTimedSerializer(app.secret_key)
    try:
        email = s.loads(token, max_age expiration)
        return email
    except:
        return None

def send_verification_email(user_email):
    token = generate_token(user_email)
    verification_link = url_for('verify_email', token=token, _external=True)
    msg = Message('Verify your email', recipients=[user_email])
    msg.body = f''Please verify your email by clicking the link: {verification_link}
    If you did not register, ignore this email.'''

        mail.seng(msg)

@app.route('/verify/<token>'):
email = confim_token(token)
if email: 
    user = Account.query.filter_by(email=email).frist()
    if user:
        return"Email verified successfully."
    else:
        return "User not found."
else: 
    return "Invalid or Expired link."

@app.route('/reset/<token>', methods={'GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        data = request. get_json()
        email = data.get('email')
        user = Account.query.filter_by(email=email).frist()
        if user:
            send_password_reset_email(email)
            return "If your email exists in our system, a reset link has been sent."
    return render_template('forgot_password.html')

@app.route('/reset/<token>', methods=['GET', 'POST'])                                      
def rest_password(token):
    email = confrim_token(token)
if not email:
    return "Invalid or expired link."
if request.method == 'POST':
    data = request.get_json()
    new_password = data.get('password')
    user = Account.query.filter_by(email=email).first()
    if user:
        user.password = new_password
        db.session.commit()
        return "Your password has been reset successfully."
    return "user not found."
return render_template('reset_password.html')


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
        db.session.rollback() # Undo if something goes wrong
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
    messages = Message.query.all() # In production, filter by sender_id/receiver_id
    return jsonify([{"text": m.message_text, "sender_id": m.sender_id} for m in messages])


if __name__ == "__main__":
    app.run(debug=True)
