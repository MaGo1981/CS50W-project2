// THIS PART OF THE CODE IS RUNNING LOCALLY ON OUR PC

// Connect to websocket
var socket = io.connect(location.protocol + '//' + document.domain + ':'
                        + location.port);
// Handle any errors that occur
socket.onerror = function(error) {
  console.log('WebSocket Error: ' + error);
};
 
// Load clicked channel 
function loadIt(c) {
  currentChannel = c; 
  localStorage.setItem('channel', currentChannel);
  // Bolden only selected channel's link 
  document.querySelector(`#${currentChannel}`).style.fontWeight = 'bold';
  socket.emit('messages', currentChannel); 
}
//returns the time HH:MM:SS in string format
function timePlease() {
  d = new Date();
  let hour = d.getHours();
  if (hour < 10) 
    hour = "0" + hour;
  let min = d.getMinutes();
  if (min < 10)
    min = "0" + min;
  let sec = d.getSeconds();
  if (sec < 10)
    sec = "0" + sec;
  return hour+":"+min+":"+sec;
}
var currentChannel = localStorage.getItem('channel');

// DOMContentLoaded (DOM = Document Object Model)- događaj kojeg pokreće završetak učitavanja stranice u web browser!
// element.addEventListener(event, function, useCapture) - secound event is a function (higher order functions)


document.addEventListener('DOMContentLoaded', () => { 
	// User related
	/*id status selected*/
	const currentStatus = document.querySelector('#status');
	var nameForm = ``;
	var nameField = ``;
	var nameError = ``;
	var currentName = localStorage.getItem('displayName');

	// Channel related
	var currentChannel = localStorage.getItem('channel');
	const sideColumn = document.querySelector('#sideColumn');
	const channelForm = document.querySelector('#channelForm');
	const channelField = document.querySelector('#channelField');
	const channelError = document.querySelector('#channelError');
	const channelsBar = document.querySelector('#channelsBar');
	var channelsList = [];
	const selectChannel = document.getElementsByClassName('selectChannel');
    
    // Chat related	
	const messagesArea = document.querySelector('#messages');
	const messageForm = document.querySelector('#messageForm');
	const messageField = document.querySelector('#messageField');


	// User related ------------------------------------------------------------

	// If no display name found, show input form 
	if (currentName) {
		var statusContent = `Logged in as ${currentName}`; // templated literal - like formated strings in Python (backtick simbol)   
		currentStatus.innerHTML = statusContent;
		// Update server's names list
		socket.emit('add name', {'name': currentName});
	} else {
		var statusContent = `
			<form id="nameForm">
			<input type="text" placeholder="Choose a display name" 
			 id="nameField" autofocus autocomplete="off" required>
			<button type="submit">Submit</button>'
			</form>
			<div id="nameError"></div>
		`;
		
		currentStatus.innerHTML = statusContent;

		nameForm = document.querySelector('#nameForm');
		nameField = document.querySelector('#nameField');
		nameError = document.querySelector('#nameError');
	}
	
	// Display name submission 
	nameForm.onsubmit = () => {
		// Check if inputted name exists on server
		const nameReq = nameField.value; /// nameReq is input form nameField. use getItem?
		socket.emit('add name', {'name': nameReq}); // 1. WE EMIT EVENT 'serverName check' to the webserver, by passing in data assosiated with this event (JSON OBJECT)

		// Clear submission box, stop form from submitting
		nameField.value = '';
		//form.reset();
		return false;  // do not load new page
	};

	// Save displayName if check succeeded 
	// Socket listen to particular events
	socket.on('serverName result', data => { 
		// arrow function that takes as input variable data that is emited by socket
		/// data is input from the server
		// if result key is True - application.py line 39
		// result object emited from the server becomes data object in .js so it is data.name here
		if (data.result) {
			localStorage.setItem('displayName', data.name);
			currentName = data.name; /// use setItem? search JSON or data.

			const statusContent = `Welcome ${currentName}`;
			currentStatus.innerHTML = statusContent;
		}
		// if result key is False - application.py line 43 (testiras s MaGo1981 ili nekim od ostalih imena s rute /names)
		else  
			nameError.innerHTML = `Sorry, please try another name.`;
	});

	// End user related --------------------------------------------------------
	
	// Channel bar -------------------------------------------------------------
	
	// Initialize channel list if empty
	socket.emit('channels');

	// Add channel 
	channelForm.onsubmit = () => {
		// Check if inputted name exists on server
		const channelReq = channelField.value;
		if (channelReq.length > 0)
			socket.emit('add channel', channelReq);

		// Clear submission box/error message, stop form from submitting
		channelField.value = '';
		channelError.innerHTML = ``;
		return false;
	};
	
	// Error message if channel not added
	socket.on('add channel result', data => {
		if (data.result) {
			currentChannel = data.channel;
			localStorage.setItem('channel', currentChannel);
		}
		else
			channelError.innerHTML = `<small>Sorry, invalid channel</small>`;	
	});
		
	
	// Update channel list
	socket.on('update channels', channels => {
    	if (channels) {
    		channelsList = channels;
    		channelsBar.innerHTML = ``;
    		for (let channel of channelsList) {
				const li = document.createElement('li');
				if (channel == currentChannel) 
					li.innerHTML = `<b><a href="#" class="selectChannel" id="${channel}" onclick="loadIt('${channel}');return false;">${channel}</a></b>`;
        		else
					li.innerHTML = `<a href="#" class="selectChannel" id="${channel}" onclick="loadIt('${channel}');return false;">${channel}</a>`;
				// when we want to associate additional data with html element, that is not displayed on the page, 
				// we can put it inside a data atribute with the name of our own choosing, as long as it begins with data-. 
				// To acces data atributes, we use .dataset!
				channelsBar.appendChild(li);
			}
		}
	});
	 
	

// End channel bar ---------------------------------------------------------

  // Chat window -------------------------------------------------------------

   // Initialize most recent channel/messages if available 
  if (currentChannel) {
    socket.emit('add channel', currentChannel);
    socket.emit('messages', currentChannel);
  }
  else {
    if (!(channelsList)) 
      socket.emit('channels');
    currentChannel = channelsList[0];
    socket.emit('messages', currentChannel);
  }
 
 	// Display new message 
  messageForm.onsubmit = () => {
    // send message to server
    const formatTime = '[' + timePlease() + '] ';
    const formatUser = currentName + ': ';
    const  message = formatTime + formatUser + messageField.value;
    const li = document.createElement('li');
    socket.emit('add message', {'message': message, 'channel': currentChannel});
    li.innerHTML = message;
    messagesArea.appendChild(li);
    
    // Clear, stop form from submitting
    messageField.value = '';
    return false;
  };
  // End chat window ---------------------------------------------------------

  // Clear when connection lost
  socket.on('disconnect', () => {
    sideColumn.innerHTML = 'Logged out';
    messagesArea.innerHTML = 'Connection Closed';
  });

});

  // Update channel messages if on that channel
  socket.on('update messages', data => {
    if (data.channel == localStorage.getItem('channel')) {
      let newMessages = data.messages;
      document.querySelector('#messages').innerHTML = ``;
      for (let m of newMessages) {
        const li = document.createElement('li');
        li.innerHTML = m;

        document.querySelector('#messages').appendChild(li);
      }
    }
});