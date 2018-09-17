import os

from flask import Flask, render_template, jsonify, request, flash, redirect, session, url_for
from flask_session import Session
from models import *
from functools import wraps

from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

import requests


app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)

# Check for environment variable
if not os.getenv("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL is not set")

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)


# Set up database
# engine = create_engine(os.getenv("DATABASE_URL"))
# db = scoped_session(sessionmaker(bind=engine))


def login_required(test):
    @wraps(test)
    def wrap(*args, **kwargs):
        if 'logged_in' in session:
            return test(*args, **kwargs)
        else:
            flash('You need to login first.')
            return redirect(url_for('login'))
    return wrap



@app.route("/")
def index():
    return render_template("index.html")


@app.route("/register", methods=["GET","POST"])
def register():
    name = request.form.get("name")
    print(name)
    email = request.form.get("email")
    print(email)
    passw = request.form.get("passw")
    print(passw)
    repeatPass = request.form.get("repeatPass")
    if request.method == 'POST':
        if passw == repeatPass:
            new_user = User(name=name, email=email, passw=passw)
            print(new_user)
            db.session.add(new_user)
            db.session.commit()
            return redirect(url_for('login'))
        else:
            message = "Passwords do not match, please try again!"
            return render_template("error.html", message=message)
    return render_template("register.html")



@app.route("/login", methods=["GET","POST"])
def login():
    session['logged_in']=False
    session['user_id'] = None
    session['name'] = None
    if request.method == 'POST':
        user = User.query.filter_by(name=request.form.get('username')).first() # returns all columns; for specific column use user.column!
        print(user)
        print(user.passw)
        print(request.form.get('pass'))

        if user is not None and user.passw == request.form.get('pass'):
            session['logged_in'] = True #RuntimeError: The session is unavailable because no secret key was set. Set the secret_key on the application to something unique and secret.
            session['user_id'] = user.id
            session['name'] = user.name
            return redirect(url_for('main'))
        else:
            message = "Wrong username or password, please try again!"
            return render_template("error.html", message=message)
    return render_template("login.html")

@app.route("/logout", methods=["GET","POST"])
def logout():
    session.pop('logged_in', None)
    session.pop('name', None)
    session.pop('user_id', None)    
    return render_template("login.html")


@app.route("/main")
def main():
    return render_template("main.html")