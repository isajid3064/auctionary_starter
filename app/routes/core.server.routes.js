const express = require('express');
const core = require('../controllers/core.server.controllers');

module.exports = function(app) {
    app.get('/item', (req, res) => {
        res.json({ message: 'List of core functionality' });
    });

    app.route('/item')
        .post(core.createItem);

};