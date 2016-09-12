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
        return API.getProfile().then(function (data) {
            var level = Math.floor(Math.pow(data.exp / 2, 1 / 3)),
                checked = (localStorage.getItem('widget_expanded') === 'true') ? 'checked="checked"' : '',
                avatar = md5(data.email.toLowerCase().trim());

            return {
                avatar: "http://scrummer.space/static/avatars/" + avatar  + '.png',
                name: data.first_name + ' ' + data.last_name,
                class: data.class,
                power1: data.power1,
                power2: data.power2,
                power3: data.power3,
                power4: data.power4,
                power5: data.power5,
                level: level,
                checked: checked
            }
        });
    };

    Template.render('widget');
})();