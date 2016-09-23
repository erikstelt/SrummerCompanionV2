(function () {
    'use strict';

    var profile = API.getProfile();

    /**
     * @returns {Promise}
     */
    Template.data.profile = function () {
        return profile.then(function (data) {
            // Calculate skill percentages
            var mastery = Math.round(data.mastery / 5000 * 100),
                teamwork = Math.round(data.teamwork / 10 * 100),
                responsibility = data.responsibility; // Max is 100

            mastery = mastery === 100 ? 'max' : mastery + '%';
            teamwork = teamwork === 100 ? 'max' : teamwork + '%';
            responsibility = responsibility === 100 ? 'max' : responsibility + '%';

            // We set the current exp in this level and the maximum
            var level = Math.floor(Math.pow(data.exp / 2, 1 / 3)),
                curMaxExp = Math.pow(level + 1, 3) * 2,
                prevMaxExp = Math.pow(level, 3) * 2,
                maxExp = curMaxExp - prevMaxExp,
                currExp = data.exp - prevMaxExp;

            return {
                exp: currExp,
                maxExp: maxExp,
                // Skills
                mastery: {
                    percent: mastery,
                    exp: data.mastery
                },
                teamwork: {
                    percent: teamwork,
                    exp: data.teamwork
                },
                responsibility: {
                    percent: responsibility,
                    exp: data.responsibility
                },
                // Powers
                power1: data.power1,
                power2: data.power2,
                power3: data.power3,
                power4: data.power4,
                power5: data.power5,
                // Contact
                email: data.email,
                phone: data.phone
            }
        });
    };

    Template.render('profile');

    document.addEventListener('DOMContentLoaded', function () {
        delegate(document.querySelector('.profile'), '.logout', function () {
            profile.then(function (profile) {
                API.logout(profile.email);

                localStorage.clear();

                window.location.replace('login.html');
            });
        });
    })
})();