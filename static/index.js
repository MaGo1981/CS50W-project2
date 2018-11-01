// THIS PART OF THE CODE IS RUNNING LOCALLY ON OUR PC

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
	var channelForm = document.querySelector('#channelForm');
	var channelField = document.querySelector('#channelField');
	var channelError = document.querySelector('#channelError');
	var channelsBar = document.querySelector('#channelsBar');
	var channelsList = [];
	var loadChannel = document.querySelector('#loadChannel');
    
    // Chat related	
	var messagesArea = document.querySelector('#messages');
	var messageForm = document.querySelector('#messageForm');
	var messageField = document.querySelector('#messageField');

	// Connect to websocket
	var socket = io.connect(location.protocol + '//' + document.domain + ':'
						    + location.port);

 	// Handle any errors that occur
 	socket.onerror = function(error) {
		console.log('WebSocket Error: ' + error);
	};

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
			 id="nameField" autofocus autocomplete-"off" required>
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
	
	// Update channel list
	socket.on('update channels', channels => {
		if (channels) {
			channelsList = channels;
			channelsBar.innerHTML = ``;
			for (let channel of channelsList) {
				const li = document.createElement('li');
				li.innerHTML = `<a id="loadChannel" data-channel="${channel}" href="#">${channel}</a>`;
				channelsBar.appendChild(li);
			}
		}
	});
	 
	
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
		
// End channel bar ---------------------------------------------------------
  
  // Update channel messages if on that channel
  socket.on('update messages', data => {
    if (data.channel == currentChannel) {
      let newMessages = data.messages;
			messagesArea.innerHTML = ``;
			for (let m of newMessages) {
				const li = document.createElement('li');
				li.innerHTML = m;
				messagesArea.appendChild(li);
      }
    }
  });
  // Change channel
  loadChannel.onclick = () => {
    currentChannel = loadChannel.dataset.channel; 
    localStorage.setItem('channel', currentChannel);
    socket.on('messages', currentChannel); 
    return false;
  };
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
 
 	// Display message 
	messageForm.onsubmit = () => {
		// send message to server
		const message = messageField.value;
		socket.emit('add message', {'message': message, 'channel': currentChannel});
    
    // Add the message to the messages list.
		const li = document.createElement('li');
		li.innerHTML = message;
		messages.appendChild(li);
		// Clear, stop form from submitting
		messageField.value = '';
		return false;
	};
 
  // End chat window ---------------------------------------------------------
});