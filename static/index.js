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
		const statusContent = `Logged in as ${currentName}`; // templated literal - like formated strings in Python (backtick simbol)   
		currentStatus.innerHTML = statusContent;
	} else {
		const statusContent = `
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
	socket.on('name result', data => { // arrow function that takes as input variable data that is emited by socket
		/// data is input from the user?
		// if result key is True - application.py line 39
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
			channelsBar.innerHTML = ``;
			for (let channel of channels) {
				const li = document.createElement('li');
				// bolden current channel
				if (channel == currentChannel)
					li.innerHTML = channel.bold();
				else 
					li.innerHTML = channel;
				channelsBar.appendChild(li);
			}
		}
	});
	// Initialize channel, last one visited by default 
	//if (currentChannel) 
		// display that channel
	//else 
		// display any channel 
	
	// Add channel 
	channelForm.onsubmit = () => {
		// Check if inputted name exists on server
		const channelReq = channelField.value;
		if (channelReq.length > 0)
			socket.emit('add channel', {'channel': channelReq});
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
});