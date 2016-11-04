(function() {
    'use strict';

    // if token
    //      if check profile
    //          go to index
    //      else
    //          try get new token
    //  else
    //      show login screen

    document.addEventListener('deviceready', function() {
        var token = localStorage.getItem('token'),
            expires = localStorage.getItem('token_expires');

        if (token && expires) {
            // check age of token
            if (Date.now() < expires) {
                window.location.replace('index.html');
            } else {
                login();
            }
        }
    
        document.querySelector('.login-button').addEventListener('click', function (e) {
            login();
        });

        function login() {
            // Login and fetch the token
            API.login().then(function (data) {
                // Store the token and expiry date
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('token_expires', new Date(Date.now() + parseInt(data['expires_in'], 10) * 1000).getTime());

                // Navigate to the main page
                window.location.replace('index.html');
            })
            .catch(Notification.show);
        }
    }.bind(this), false);
})();