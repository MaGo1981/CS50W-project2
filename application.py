# THIS PART OF THE CODE IS RUNNING ON THE SERVER

import os

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
# app = Flask(__name__, instance_relative_config=True)
# app.config.from_object('config')
# app.config.from_pyfile('config.py')

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


# 'MaGo1981' temporarily taken for testing
display_names = ['MaGo1981']
channels = {'hello': ['Hello, world'], 'howdoyoudo': ['howdoyoudo world', 'Second']}
"""
channels = {'channel1': ['one', 'two']}
for (channel in channels):
    for (message in channel):
        print(message)
"""


@app.route('/')
def index():
    return render_template('index.html') 


@app.route('/names')
def view_names():
    return '{}'.format(display_names)

@app.route('/channels')
def view_channels():
    return '{}'.format(list(channels.keys()))

@app.route('/messages/<channel>')
def show_messages(channel):
    return '{}'.format(channels[channel])


# Check if username exists
@socketio.on('add name') # 2. when the socket detects this event called 'serverName check' emited from index.js - line 41
def add_name(data):
    '''
    Check if username exists.
    '''
    result = {}
    name_req = str(data['name']) # first take the data, and get out the name, save it inside variable called name_req
    result['name'] = name_req    # save the data into result (check out JSON for result)

    if (name_req not in display_names):
        result['result'] = True # index.js - line 54
        display_names.append(name_req) # delete line 16?
        emit('name result', result)
    else:
        result['result'] = False
        emit('name result', result)



@socketio.on('add channel')
def add_channel(data):
    '''
    Add channel if it's new, emit result and new channels
    '''
    result = {}
    c = str(data)
    result['channel'] = c # channel je key, c je value
    print (reuslt.channel)
    print (result['channel'])
    print (result)
    if (c not in channels): # channels je dict kanala, key je ime kanala c, a value su liste poruka
        result['result'] = True
        channels[c] = []
        emit('add channel result', result)
        emit_channels()
    else:
        result['result'] = False
        emit('add channel result', result)


@socketio.on('channels')
def emit_channels(): # nema data parametra, jer je data server primio sa add channel eventom
    '''
    Emit list of current channels to all users.
    '''
    emit('update channels', list(channels.keys()), broadcast=True)

@socketio.on('add message')
def add_message(data):
    ''' 
    Append message to channel up to 100 messages 
    '''
    c = str(data['channel'])
    m = str(data['message'])
    if (c in channels):
        if (len(channels[c]) < 100):
            channels[c].append(m)
        else:
           channels[c].pop(0)
           channels[c].append(m)
        emit_messages(c)


@socketio.on('messages')
def emit_messages(c):
    '''
    Emit list of messages to all users for channel 'c' 
    '''
    emit('update messages', {'channel': c, 'messages': channels[c]}, broadcast=True)