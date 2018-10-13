import os

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
# app = Flask(__name__, instance_relative_config=True)
app.config.from_object('config')
# app.config.from_pyfile('config.py')

# app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


@app.route('/')
def index():
	return render_template('index.html') 
