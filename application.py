import os

from flask import Flask
from flask_socketio import SocketIO, emit

from flask import session,render_template, request, redirect, url_for, jsonify
from flask_session import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

import requests

from functools import wraps

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


@app.route("/")
def index():
    return "Project 2: TODO"


def login_required(test):
	@wraps(test)
	def wrap(*args, **kwargs):
		if 'logged_in' in session:
			return test(*args, **kwargs)
		else:
			flash('You need to login first.')
			return redirect(url_for('login'))
	return wrap



@app.route("/register", methods=["GET","POST"])
def register():

	if request.method == 'POST':
		name = request.form.get("name")
		email = request.form.get("email")
		passw = request.form.get("passw")
		repeatPass = request.form.get("repeatPass")
		db_name_check = db.execute("SELECT name FROM users WHERE name = :name",
	                             {"name": name}).fetchone()
		# print(db_name_check[0])
		# print(name)

		# not None mora biti jer ne mozes usporedjivati None type varijablu
		if db_name_check is not None and name == db_name_check[0]:
			message = "That user is already taken. Click 'back' and try again!"
			return render_template("error.html", message=message)
		elif passw != repeatPass:
			message = "Your password and repeated password did not match. Click 'back' and try again!"
			return render_template("error.html", message=message)
		else:
			try:
				db.execute("INSERT INTO users(name, email, passw) VALUES (:name, :email, :passw)",
					{"name": name, "email": email, "passw": passw})
				db.commit()
				return redirect(url_for('login'))
			except:
				message = "Your code has crashed!"
				return render_template("error.html", message=message)
	return render_template("register.html")




@app.route("/login", methods=["GET","POST"])
def login():
	if request.method == 'POST':
		session['name'] = request.form.get('username')
		# saved in a browser cookie - not good for password!? but do i have to transfer variable in render template? 
		session['password'] = request.form.get('pass')
		db_name = db.execute("SELECT name FROM users WHERE name = :name",
                             {"name": session["name"]}).fetchone()
		db_password = db.execute("SELECT passw FROM users WHERE name = :name",
                             {"name": session["name"]}).fetchone()
		db_user_id = db.execute("SELECT id FROM users WHERE name = :name",
                             {"name": session["name"]}).fetchone()
		db_names = db.execute("SELECT name FROM users").fetchall()

		if db_name is None or \
		session['name'] != db_name[0]  or \
		session['password'] != db_password[0]:
			message = "Wrong username or password, please try again!"
			session['name']= None
			return render_template("error.html", message=message)
		else:
			session['logged_in'] = True
			session['name']= db_name[0]
			session['user_id']= db_user_id[0]
			return redirect(url_for('main'))
	return render_template("login.html")