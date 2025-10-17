const express = require('express');

module.exports = function(app) {
    app.get('/core', (req, res) => {
        res.json({ message: 'List of core functionality' });
    });

}