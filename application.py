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
channels = {'About this app': ['[19:23:56] Marko: Hello world! Check out my new app!! ', '[19:27:07] Joe: Hi Marko! What is this app? Tell me about it.', '[19:35:51] Marko: Hi Joe! This is a messinger application! You can create a channel for a particular topic that you are interested in and discuss it with other interested users.', '[19:49:34] Joe: How did you create it?', '[19:52:45] Marko: I created it using a combination of Flask and Java Script. Flask is used for the server side part of application and Java Script is used for the user side of the application.', '[19:56:58] Joe: How does it work?', '[19:57:50] Marko: On the client side I have html, css and js files. HTML is used to lay out the structure of the webpage. CSS is a language for interaction with and styling of HTML. In I write the code that is run by the client inside the web browser in JS file. On the serves side I have Flask code in application.py file. Users are connecting trough the server. With messinger I need full duplex (real time) communication. That is why I use Websockets protocol. I want to get information from the server without needing to reload an entirely new page. That is why I use Ajax.', '[20:15:46] Joe: How does data travel from one user to another?', '[20:20:09] Marko: Data must travel form client side to the serves side and than from the server side to another client. There is a special language for representing information in human and computer readable way that we use for this kind of comunication. It is called JSON.', '[20:25:54] Joe: Do you not need some kind of database to store messages data on the server?', '[20:32:13] Marko: I could use a database, but for this application I use simple dictionaries on the server side that stores messages and user information. User information is also stored on the client side. LocalStorage is a variable in JavaScript where information can be either loaded from or saved to.'], 'In General': ['[11:12:49] Marko: Hello World!!', '[11:12:57] People of the World: Hello Marko!!']}
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
    # print('add name event - input objekt data = ',data)
    result = {}
    name_req = str(data['name']) # first take the data, and get out the name, save it inside variable called name_req
    result['name'] = name_req    # save the data into result (check out JSON for result)
    print('add name event - objekt result - to check = ',result)

    if (name_req not in display_names):
        result['result'] = True # index.js - line 54
        display_names.append(name_req) # delete line 16?
        emit('name result', result)
        print('add name event - objekt result - now appended to list =' ,name_req)
        print('display_names list updated = ',display_names)
    else:
        result['result'] = False
        emit('name result', result)
        print('add name event - objekt result - already on the list =' ,name_req)



@socketio.on('add channel')
def add_channel(data):
    '''
    Add channel if it's new, emit result and new channels
    '''
    result = {}
    c = str(data)
    result['channel'] = c # channel je key, c je value
    print (result)
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
    emit('update channels', list(channels.keys()), broadcast=True) # brodcast = True mora biti kada svim userima saljemo sa servera

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
