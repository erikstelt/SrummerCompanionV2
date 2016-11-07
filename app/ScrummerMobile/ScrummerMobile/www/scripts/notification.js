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

function SetNotifyPanelPosition () {
	if (document.querySelector("#widget-template").offsetHeight < 130)
		document.querySelector("#notify-area").style.top = "88px";
	else
		document.querySelector("#notify-area").style.top = "137px";
}

function ShowHideNotifyPanel () {
	SetNotifyPanelPosition();
	if (document.querySelector("#notify-area").style.height != "350px")
		document.querySelector("#notify-area").style.height = "350px";
	else
	    document.querySelector("#notify-area").style.height = "0px";
}