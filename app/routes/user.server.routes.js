const express = require('express');

const users = require('../controllers/user.server.controllers'),
        auth = require('../lib/middleware');

module.exports = function(app) {
    app.get('/user', (req, res) => {
        res.json({ message: 'User Endpoints are live' });
    });

    app.route('/users')
        .get(users.getAllUsers)
        .post(users.createUser);

    app.route('/users/:user_id')
        .get(users.getUserById);    
    
    app.route('/login')
        .post(users.login);

    app.route('/logout')
        .post(auth.isAuthenticated,users.logout);
};