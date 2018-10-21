// THIS PART OF THE CODE IS RUNNING LOCALLY ON OUR PC

// DOMContentLoaded (DOM = Document Object Model)- događaj kojeg pokreće završetak učitavanja stranice u web browser!
// element.addEventListener(event, function, useCapture) - secound event is a function (higher order functions)
document.addEventListener('DOMContentLoaded', () => { 
	/*id status selected*/
	const currentStatus = document.querySelector('#status');
	var nameForm = ``;
	var nameField = ``;
	var nameError = ``;
	var currentName = localStorage.getItem('displayName');

	// Connect to websocket
	var socket = io.connect(location.protocol + '//' + document.domain + ':'
						    + location.port);

	// If no display name stored, ask to submit one
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
		socket.emit('serverName check', {'name': nameReq}); // 1. WE EMIT EVENT 'serverName check' to the webserver, by passing in data assosiated with this event (JSON OBJECT)

		// Clear submission box, stop form from submitting
		nameField.value = '';
		//form.reset();
		return false;  // do not load new page
	};

	// Save displayName if check succeeded 
	// Socket listen to particular events
	socket.on('serverName result', data => { // arrow function that takes as input variable data that is emited by socket
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
});