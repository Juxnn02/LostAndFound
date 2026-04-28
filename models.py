from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


# DATABASE MODELS (TABLES)


class Account(db.Model):
    __tablename__ = 'account'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    is_banned = db.Column(db.Boolean, default=False)
    
    # Relationship to User
    user_profile = db.relationship('User', backref='account', uselist=False, cascade="all, delete-orphan")

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=False)
    username = db.Column(db.String(255), nullable=False)
    student_id = db.Column(db.Integer, unique=True)
    
    # Relationships
    posts = db.relationship('Post', backref='author', cascade="all, delete-orphan")

class Admin(db.Model):
    __tablename__ = 'admin'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    admin_username = db.Column(db.String(255), unique=True, nullable=False)
    admin_password = db.Column(db.String(255), nullable=False)

class Post(db.Model):
    __tablename__ = 'post'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_date = db.Column(db.DateTime, default=datetime.utcnow)
    item_name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100))
    location = db.Column(db.String(255))
    image_url = db.Column(db.String(500))
    is_claimed = db.Column(db.Boolean, default=False)
    
    # Relationships
    reports = db.relationship('Report', backref='post', cascade="all, delete-orphan")

class Message(db.Model):
    __tablename__ = 'message'
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    message_text = db.Column(db.Text, nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class Report(db.Model):
    __tablename__ = 'report'
    id = db.Column(db.Integer, primary_key=True)
    reporting_email = db.Column(db.String(255), nullable=False)
    reportee_email = db.Column(db.String(255), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    status = db.Column(db.String(50), default='Pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
