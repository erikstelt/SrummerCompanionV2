(function () {
    'use strict';

    var profile = API.getProfile(API.userId);
    console.log(profile);
    profile.then(function (data) {
        console.log('works');
    }).catch(function () {
        console.log('error');
    });

    /**
     * @returns {Promise}
     */
    Template.data.profile = function () {
        return profile.then(function (data) {
            // Calculate skill percentages
            var mastery = Math.round(data.userprofile.mastery / 5000 * 100),
                teamwork = Math.round(data.userprofile.teamwork / 10 * 100),
                responsibility = data.userprofile.responsibility; // Max is 100

            mastery = mastery === 100 ? 'max' : mastery + '%';
            teamwork = teamwork === 100 ? 'max' : teamwork + '%';
            responsibility = responsibility === 100 ? 'max' : responsibility + '%';

            // We set the current exp in this level and the maximum
            var level = Math.floor(Math.pow(data.userprofile.exp / 2, 1 / 3)),
                curMaxExp = Math.pow(level + 1, 3) * 2,
                prevMaxExp = Math.pow(level, 3) * 2,
                maxExp = curMaxExp - prevMaxExp,
                currExp = data.userprofile.exp - prevMaxExp;

            return {
                exp: currExp,
                maxExp: maxExp,
                // Skills
                mastery: {
                    percent: mastery,
                    exp: data.userprofile.mastery
                },
                teamwork: {
                    percent: teamwork,
                    exp: data.userprofile.teamwork
                },
                responsibility: {
                    percent: responsibility,
                    exp: data.userprofile.responsibility
                },
                // Powers
                power1: data.userprofile.power1,
                power2: data.userprofile.power2,
                power3: data.userprofile.power3,
                power4: data.userprofile.power4,
                power5: data.userprofile.power5,
                // Contact
                email: data.email,
                phone: data.phone
            }
        });
    };

    Template.render('profile');

    document.addEventListener('DOMContentLoaded', function () {
        delegate(document.querySelector('.profile'), '.logout', function () {
            API.logout();
        });
    })
})();