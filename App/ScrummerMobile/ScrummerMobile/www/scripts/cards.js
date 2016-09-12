(function () {
    'use strict';

    var powerIcons = ['ton-li-chart-7', 'ton-li-eye', 'ton-li-speech-buble-3', 'ton-li-gear-1', 'ton-li-pen'],
        powerNames = ['research', 'design', 'interaction', 'production', 'documentation', 'achievement'];

    Template.data.cards = function () {
        // Get profile
        return API.getProfile()
            .then(function (profile) {
                return profile.email;
            })
            .then(function (email) {
                return API.getCards(email, 'verify');
            })
            .then(function (cards) {
                cards = cards.map(function (card) {
                    card.icon = powerIcons[card.power - 1];
                    card.power = powerNames[card.power - 1];
                    // Sets the class of the status part in the card (verified / denied) and status text
                    if (card.is_verified === 1) {
                        card.statusclass = 'accepted';
                        card.statustext = 'accepted';
                    } else if (card.is_verified === 2) {
                        card.statusclass = 'denied';
                        card.statustext = 'denied';
                    } else {
                        card.statusclass = '';
                    }
                    card.description = card.description || 'No description given.';
                    card.deadline.class = card.deadline.class.replace('/\w/g', '');

                    return card;
                }).sort(function (a, b) {
                    // Sort by deadline from early to later
                    return a.deadline.timestamp - b.deadline.timestamp;
                });

                return {
                    cards: cards
                };
            });
    };

    Template.render('cards');

    // Once the content is loaded we start the card events for verify / deny
    document.addEventListener('DOMContentLoaded', function () {
        delegate(document.querySelector('.cards'), '.deny, .accept', function() {
            var cardId = this.dataset.cardId,
                status = this.classList.contains('accept');

            // Alter card status
            // Change classes and text for correct display
            var newStatus = document.querySelector('.card[data-card-id="' + cardId + '"] .status');
            newStatus.classList.remove('accepted', 'denied');
            newStatus.classList.add(status ? 'accepted' : 'denied');
            newStatus.querySelector('.statustext').textContent = status ? 'accepted' : 'denied';

            // Start the verify card function and change the status
            API.verifyCard(cardId, status).then(function(response) {
                if (!response.result) {
                    return Promise.reject('Card could not be changed');
                }
            }).catch(function(error) {
                Notification.show(error);
            });
        });
    });
})();