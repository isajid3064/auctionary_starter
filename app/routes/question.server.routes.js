const express = require('express');

module.exports = function(app) {
    app.get('/questions', (req, res) => {
        res.json({ message: 'List of questions' });
    });

}