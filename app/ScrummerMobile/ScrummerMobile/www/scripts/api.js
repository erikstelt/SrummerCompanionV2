(function () {
    'use strict';

    var API = {
        userId: localStorage.getItem('user_id'),
        /**
         * The token to authenticate with
         *
         * @type {string}
         */
        token: null,
        /**
         * API endpoints
         *
         * @type {Object<string, string>}
         */
        urls: {
            base: 'http://api.dev.scrummer.space/',
            login: 'auth/login/',
            refresh: 'auth/refresh',
            profile: 'accounts/{id}/',
            avatar: 'accounts/{id}/avatars/',
            badgeTitles: '/perks/',
            badgeDetails: 'accounts/{id}/badges/',
            projects: 'accounts/{id}/projects/',
            cards: {
                list: 'accounts/{id}/cards/',        
                verify: 'cards/{cardId}/verify/'        // Moet nog een endpoint voor komen
            },
            perks: {
                list: 'accounts/{id}/perks/',
                buy: 'perks/{perk}/buy/'                // En hiervoor
            }
        },
        /**
         * Login to the API with given credentials
         *
         * If succesfull, redirects to index.html
         */
        login: function (email, password) {
            // Build URL and enclose the email and password in the POST request
            var url = this.buildURL(this.urls.login);
            var data = JSON.stringify({ "email": email, "password": password });
            // Set date for token expiry date
            var dateNow = new Date();

            // Create new POST request which will process the authentication of the user
            var xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onreadystatechange = function () {
                var data = JSON.parse(xhr.responseText);
                // Succes
                if (xhr.readyState == 4 && xhr.status == 201) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('token_expires', dateNow.setMinutes(dateNow.getMinutes() + 10));
                    localStorage.setItem('user_id', data.id);
                    // Redirect to index if login is succesfull
                    window.location.replace('index.html');
                }
                // Failed status
                else if (xhr.readyState == 4 && xhr.status == 400) {
                    document.getElementById('errors').innerHTML = data[Object.keys(data)[0]];
                }
                // Server error
                else if (xhr.readyState != 4 && xhr.status != 201) {
                    document.getElementById('errors').innerHTML = 'Server error';
                }
            }
            xhr.send(data);
        },
        /**
         * Refresh the users session (add new token)
         *
         * THIS FUNCTION NEEDS TO BE ADDED TO EVERY API REQUEST FUNCTION
         */
        refresh: function () {
            // Only run if token is expired
            if (Date.now() > localStorage.getItem('token_expires')) {
                var url = this.buildURL(this.urls.refresh);
                var data = JSON.stringify({ "token": localStorage.getItem('token') });
                var dateNow = new Date();

                // Create new POST request which will add a new token to the local storage
                var xhr = new XMLHttpRequest();
                xhr.open("POST", url, true);
                xhr.setRequestHeader('Content-Type', 'application/json');

                xhr.onreadystatechange = function () {
                    var data = JSON.parse(xhr.responseText);
                    // Succes
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('token_expires', dateNow.setMinutes(dateNow.getMinutes() + 10));
                        return true;
                    }
                    else {
                        // Token invalid, redirect to login.html
                        this.logout();
                    }
                }
                xhr.send(data);
            }
        },
        /**
         * End the user session
         *
         * @returns {Promise}
         */
        logout: function () {
            localStorage.clear();
            window.location.replace('login.html');
        },
        /**
         * Get the user profile
         *
         * @returns {Promise}
         */
        getProfile: function (id) {
            var url = this.buildURL(this.urls.profile, {
                id: id
            });

            return this.get(url);
        },
        /**
        * Get the badge details
        *
        * @param {string} id
        * @returns {Promise}
        */
        getBadges: function (id) {
            var url = this.buildURL(this.urls.badgeDetails, {
                id: id
            });

            return this.get(url);
        },
        /**
         * Get the perks
         *
         * @param {string} email
         * @returns {Promise}
         */
        getPerks: function (id) {
            var url = this.buildURL(this.urls.perks.list, {
                id: id
            });

            return this.get(url);
        },
        /**
         * Buy a single perk
         *
         * @param {number} perk
         * @param {team} [team]
         */
        buyPerk: function (perk, team) {
            var url = this.buildURL(this.urls.perks.buy, {
                perk: perk
            });

            if (team !== undefined) {
                return this.get(url, 'PUT', {
                    project: team
                });
            }

            return this.get(url, 'PUT');
        },
        getTeams: function (id) {
            var url = this.buildURL(this.urls.projects, {
                id: id
            });

            return this.get(url);
        },
        /**
         * Get the cards of the given type
         *
         * @param {string} email
         * @param {string} [type] Defaults to verify
         * @returns {Promise}
         */
        getCards: function (id, type) {
            var url = this.buildURL(this.urls.cards.list, {
                    id: id
                }),
                data = {
                    type: type || 'verify'
                };

            return this.get(url, 'GET', data);
        },
        /**
         * Change the status of a card
         *
         * @param {string} cardId
         *
         **/
        verifyCard: function (cardId, status) {
            var url = this.buildURL(this.urls.cards.verify, {
                cardId: cardId
            });

            return this.get(url, 'PUT', {
                verified: status
            });
        },
        /**
         *
         * @param {string} url
         * @param {string} [method] Method of the request. Defaults to GET
         * @param {Object<string, *>} [data] Data of the request.
         * @returns {Promise}
         */
        get: function (url, method, data) {
            // Always use refresh function before get / post / put data
            this.refresh();

            method = method && method.toUpperCase() || 'GET';

            var request = {
                method: method,
                headers: {
                    'Authorization': 'Token ' + this.token
                }
            };

            if (data) {
                if (method === 'GET') {
                    url += this.buildQueryString(data);
                } else {
                    request.body = JSON.stringify(data);
                }
            }

            return fetch(url, request).then(function (response) {
                if (response.ok) {
                    return response.json();
                }
                else {
                    return Promise.reject('There was a network error.');
                }
            });
        },
        /**
         *
         *
         * @param {string} query
         * @returns {Object<string, string>}
         */
        parseQueryString: function (query) {
            var data = {};

            query.split('&').forEach(function (pair) {
                pair = pair.split('=');

                data[pair[0]] = decodeURIComponent(pair[1]);
            });

            return data;
        },
        /**
         *
         * @param {Object} data
         * @returns {string}
         */
        buildQueryString: function (data) {
            var query = [];

            for (var key in data) {
                if (!data.hasOwnProperty(key)) continue;

                query.push(key + '=' + encodeURIComponent(data[key]));
            }

            return '?' + query.join('&');
        },
        /**
         * Construct an url from and endpoint and data
         *
         * @param endpoint The endpoint
         * @param {object} [params]
         * @returns {string} The fully qualified url
         */
        buildURL: function (endpoint, params) {
            for (var key in params) {
                if (!params.hasOwnProperty(key)) continue;

                endpoint = endpoint.replace('{' + key + '}', params[key]);
            }

            return this.urls.base + endpoint;
        }
    };

    window.API = API;
})();