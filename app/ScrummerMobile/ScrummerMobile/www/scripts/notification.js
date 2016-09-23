(function() {
    'use strict';

    var Notification = {
        /**
         * @type {HTMLElement}
         */
        element: null,
        /**
         * @type {Number}
         */
        timeout: null,
        /**
         * Show a message to the user
         *
         * @param {string} message
         */
        show: function (message) {
            Notification.hide();

            Notification.element.textContent = message;

            Notification.element.classList.add('show');

            Notification.timeout = window.setTimeout(Notification.hide, 5000);
        },
        /**
         * Hide the message
         */
        hide: function() {
            Notification.element.classList.remove('show');

            window.clearTimeout(Notification.timeout);
        }
    };

    Notification.element = document.querySelector('.notification');
    Notification.element.addEventListener('click', function () {
        Notification.hide();
    });

    window.Notification = Notification;
})();