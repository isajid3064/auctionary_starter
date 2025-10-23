const express = require('express');
const Joi = require('joi');
const db = require('../../database');
const users = require('../controllers/user.server.controllers');

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
};