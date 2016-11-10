(function () {
    document.addEventListener('DOMContentLoaded', function (e) {
        document.getElementById('widget-template').addEventListener('change', function (e) {
            localStorage.setItem('widget_expanded', e.target.checked);
        });

        document.getElementById('widget-toggle').checked = localStorage.getItem('widget_expanded') === 'true' || false;
    });

    /**
     * @returns {Promise}
     */
    Template.data.widget = function () {
        return API.getProfile(API.userId).then(function (data) {
            var level = Math.floor(Math.pow(data.userprofile.exp / 2, 1 / 3)),
                checked = (localStorage.getItem('widget_expanded') === 'true') ? 'checked="checked"' : '',
                avatar = md5(data.email.toLowerCase().trim());

            return {
                avatar: "http://scrummer.space/static/avatars/" + 2  + '.png',
                name: data.first_name + ' ' + data.last_name,
                class: data.class,
                power1: data.userprofile.power1,
                power2: data.userprofile.power2,
                power3: data.userprofile.power3,
                power4: data.userprofile.power4,
                power5: data.userprofile.power5,
                level: level,
                checked: checked
            }
        });
    };

    Template.render('widget');
})();