﻿(function () {
    'use strict';
    var powerNames = ['research', 'design', 'interaction', 'production', 'documentation', 'achievement'],
    data, intervalId;

    Template.data.trophies = function () {
        // Get profile
        return API.getProfile().then(function (profile) {
            // Get badges and perks. Also pass on profile
            return Promise.all([API.getBadges(profile.email), API.getPerks(profile.email), profile]);
        }).then(function (values) {
            var badges = values[0],
                perks = values[1],
                profile = values[2];

            // Merge badges and perks
            badges = _.keyBy(badges, 'id');
            perks = _.map(perks, function (perk) {
                if (perk.cooldown.left > 0) {
                    perk.cooldown.text = formatTime(perk.cooldown.left);
                } else {
                    perk.cooldown.text = false;
                }

                return Object.assign(perk, badges[perk.id], {
                    perkName: perk.name // Original name is overwritten by badge.name
                });
            });

            // Save data for later
            data = Promise.resolve([_.keyBy(perks, 'id'), profile]);

            var powers = _.groupBy(perks, 'power'),
                achievements = powers[6]; // Achievements are special

            delete powers[6];

            for (var power in powers) {
                if (!powers.hasOwnProperty(power)) continue;

                powers[power] = {
                    name: powerNames[power - 1],
                    points: profile['power' + power],
                    perks: _.orderBy(powers[power], 'tier')
                };
            }

            return {
                powers: _.toArray(powers),
                achievements: achievements
            };
        });
    };

    Template.callback.trophies = function (element) {
        // Construct a new Flickity slider for the achievements
        new Flickity(element.querySelector('.achievements'), {
            contain: true,
            freeScroll: true,
            prevNextButtons: false,
            pageDots: false
        });

        // Get the profile and the perks
        var teams = data.then(function (values) {
            return API.getTeams(values[1].email);
        }).then(function (teams) {
            return teams.map(function (team) {
                return _.pick(team, ['id', 'name']);
            });
        });

        delegate(element, '.badge', function () {
            var perkId = this.dataset.perkId;

            data.then(function (values) {
                return Promise.all([values[0], teams]);
            }).then(function (values) {
                var perks = values[0],
                    teams = values[1],
                    perk = perks[perkId];

                perk.power = powerNames[perk.power_id - 1];
                perk.can_buy = perk.status === 1;
                perk.has_teams = perk.id == 20; // Only Timebender has a team option

                if (perk.has_teams) {
                    perk.teams = teams;
                }

                return perk;
            }).then(function (perk) {
                return Template.render('modal', perk);
            }).then(function (modal) {
                modal.classList.add('visible');
            });
        });

        if (intervalId) {
            window.clearInterval(intervalId);
        }

        data.then(function (values) {
            var perks = values[0];

            intervalId = window.setInterval(function() {
                _.map(perks, function(perk) {
                    if (perk.cooldown.left <= 0) return;

                    perk.cooldown.left -= 1;
                    perk.cooldown.text = formatTime(perk.cooldown.left);

                    element.querySelector('[data-perk-id="' + perk.id + '"] .timeout span').textContent = perk.cooldown.
                        text;
                });
            }, 1000);
        });
    };

    Template.render('trophies');

    var modal = document.getElementById('modal-template');

    delegate(modal, '.cancel', function () {
        modal.classList.remove('visible');
    });

    delegate(modal, '.buy', function () {
        var perkId = this.dataset.perkId,
            team;

        if (perkId == 20) {
            team = modal.querySelector('select').value;
        }

        API.buyPerk(perkId, team).then(function (response) {
            if (response.result) {
                modal.classList.remove('visible');
            } else {
                Notification.show(response.message);
            }

            // Refresh trophies and profile
            Template.render('trophies');
            Template.render('profile');
        });
    });

    /**
     * Format seconds into hh:mm:ss
     *
     * @param seconds
     * @returns {string}
     */
    function formatTime(seconds) {
        var hour, minute, second;

        hour = Math.floor(seconds / 3600);
        seconds -= hour * 3600;
        minute = Math.floor(seconds / 60);
        minute = minute < 10 ? '0' + minute : minute;
        second = Math.floor(seconds % 60);
        second = second < 10 ? '0' + second : second;

        return [hour, minute, second].join(':');
    }
})();