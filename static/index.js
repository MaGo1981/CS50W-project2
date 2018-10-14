
// DOMContentLoaded (DOM = Document Object Model)- događaj kojeg pokreće završetak učitavanja stranice u web browser!
// element.addEventListener(event, function, useCapture)
document.addEventListener('DOMContentLoaded', () => {
    /*form tag selected - radi onsubmit?*/
    const form = document.querySelector('form');
    /*id displayname selected*/
    const displayName = document.querySelector('#displayName');
    /*id greeting selected*/
    const greeting = document.querySelector('#greeting');

    form.onsubmit = () => {
        // Save chosen displayName 
        localStorage.setItem('displayName', displayName.value);

        // Add a greeting
        // greeting.append('Hi there, ' + displayName.value + '!');
        // document.querySelector('#greeting').innerHTML = 'Hello there, ' + displayName.value + '!';
        document.querySelector('#greeting').innerHTML = 'Hello there, ' + localStorage.getItem('displayName') + '!';
        
        // Stop form from submitting to some other page, or reloading the same page
        return false;
    };
});