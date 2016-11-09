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
            expires = localStorage.getItem('token_expires'),
            userId = localStorage.getItem('user_id');

        if (token && expires) {
            // check age of token
            if (Date.now() < expires) {
                window.location.replace('index.html');
            } else {
                API.refresh();
            }
        }
    
        document.querySelector('.login-button').addEventListener('click', function (e) {
            var email = document.getElementById('username').value;
            var password = document.getElementById('password').value;
            API.login(email, password);
        });
    }.bind(this), false);
})();