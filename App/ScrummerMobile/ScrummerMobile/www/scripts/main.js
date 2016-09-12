(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        // Initialize main slider
        var slider = new Flickity(document.querySelector('.main'), {
            initialIndex: 1,
            setGallerySize: false,
            pageDots: false,
            prevNextButtons: false
        });

        var mainNav = document.querySelector('.main-nav');

        // Update the button state after a swipe
        slider.on('cellSelect', function (e) {
            mainNav.querySelector('[data-slide-index="' + slider.selectedIndex + '"]').checked = true;
        });

        // Bind the main menu buttons to
        [].forEach.call(mainNav.querySelectorAll('input[type="radio"]'), function (input) {
            input.addEventListener('change', function () {
                if (this.checked) {
                    slider.select(this.dataset.slideIndex);
                }
            });
        });

        // TODO: Mustache the slides and widget

        // Find each element that requires a template
        [].forEach.call(document.querySelectorAll('[data-template]'), function (element) {
            var template = element.dataset.template;

            Template.parse(template);
        });

        document.querySelector('.logout').addEventListener('click', function () {
            API.logout();

            localStorage.removeItem('token');
            localStorage.removeItem('token_expires');
        });
    });
})();

