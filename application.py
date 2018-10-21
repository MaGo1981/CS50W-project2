# THIS PART OF THE CODE IS RUNNING ON THE SERVER

import os

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
# app = Flask(__name__, instance_relative_config=True)
app.config.from_object('config')
# app.config.from_pyfile('config.py')

# app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


# 'MaGo1981' temporarily taken for testing
display_names = ['MaGo1981']


@app.route('/')
def index():
        return render_template('index.html') 


@app.route('/names')
def names():
    return '{}'.format(display_names)


# Check if username exists
@socketio.on('serverName check') # 2. when the socket detects this event called 'serverName check' emited from index.js - line 41
def name_check(data):
    result = {}
    name_req = str(data['name']) # first take the data, and get out the name, save it inside variable called name_req
    result['name'] = name_req    # save the data into result (check out JSON for result)

    if (name_req not in display_names):
        result['result'] = True # index.js - line 54
        display_names.append(name_req) # delete line 16?
        emit('serverName result', result)
    else:
        result['result'] = False
        emit('serverName result', result)