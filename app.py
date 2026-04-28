from flask import Flask, render_template, request, jsonify
from models import db, Account  # Make sure to import db and your Account model!

app = Flask(__name__)


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
    return render_template("dashboard.html")

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

if __name__ == "__main__":
    app.run(debug=True)