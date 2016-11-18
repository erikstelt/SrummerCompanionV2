(function () {
    'use strict';

    var powerIcons = ['ton-li-chart-7', 'ton-li-eye', 'ton-li-speech-buble-3', 'ton-li-gear-1', 'ton-li-pen'],
        powerNames = ['research', 'design', 'interaction', 'production', 'documentation', 'achievement'];

    // Counter for total cards
    var notificationCardCounter = 0;

    // Function for showing or hiding the notification counter if necessary
    function cardNotifications() {
        if (notificationCardCounter > 0) {
            if (notificationCardCounter > 99) { notificationCardCounter = '99+' };
            document.getElementById("cards-notification").innerHTML = notificationCardCounter;
            document.getElementById("cards-notification").style.display = 'flex';
        } else { document.getElementById("cards-notification").style.display = 'none'; }
    }

    console.log('test');

    Template.data.cards = function () {
        // Reset counter on reloading template
        notificationCardCounter = 0;
        // Get profile
        return API.getCards(API.userId, 'verify')
            .then(function (cards) {
                console.log('test');
                console.log(cards);
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
                        // Count the cards which need verifications
                        notificationCardCounter++;
                        card.statusclass = '';
                    }
                    card.description = card.description || 'No description given.';
                    card.deadline.class = card.deadline.class.replace('/\w/g', '');

                    return card;
                }).sort(function (a, b) {
                    // Sort by deadline from early to later
                    return a.deadline.timestamp - b.deadline.timestamp;
                });

                // Show or hide notifications popup if notificationCardCounter > 0
                cardNotifications();

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
            var removeNotification = false;

            // Alter card status
            // Change classes and text for correct display
            var newStatus = document.querySelector('.card[data-card-id="' + cardId + '"] .status');

            // If the card is not yet verified (denied || accepted) remove it from the notification
            if (!newStatus.classList.contains('accepted') && !newStatus.classList.contains('denied')) {
                removeNotification = true;
            }

            newStatus.classList.remove('accepted', 'denied');
            newStatus.classList.add(status ? 'accepted' : 'denied');
            newStatus.querySelector('.statustext').textContent = status ? 'accepted' : 'denied';

            // Start the verify card function and change the status
            API.verifyCard(cardId, status).then(function(response) {
                if (!response.result) {
                    return Promise.reject('Card could not be changed');
                } else {
                    // Remove the notification if promise can be completed
                    (removeNotification) ? notificationCardCounter += -1 : '';
                    cardNotifications();
                }
            }).catch(function(error) {
                Notification.show(error);
            });
        });

    });
})();