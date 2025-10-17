const express = require('express');
const Joi = require('joi');
const db = require('../../database');

module.exports = function(app) {
    app.get('/user', (req, res) => {
        res.json({ message: 'List of list of users' });
    });

    let users = [];

app.post('/users', (req, res) => {
    const schema = Joi.object({
        first_name: Joi.string().min(1).required(),
        last_name: Joi.string().min(1).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required()
            .pattern(new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])'))
            .required()
            .messages({'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character',
                'string.min': 'Password must be at least 8 characters long'})
    });
    
    const {error} = schema.validate(req.body);
    if(error){
        return res.status(400).send(error.details[0].message);
    }
    const user = {
        id: users.length + 1,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password
    };

    users.push(user);
    return res.status(201).send(user);
});

app.get('/users', (req, res) => {

    let results = [];

    db.each(
        "SELECT * FROM users",
        [],
        (err, row) => {
            if(err)return res.status(400).send("Couldnt retrieve any users");

                results.push({
                    user_id: row.user_id,
                    first_name: row.first_name,
                    last_name: row.last_name,
                    email: row.email
                });
            },
        (err, num_rows) => {
                if(err){ return res.status(400).send("Couldnt retrieve any users"); }
                return res.send(results);
            })
        }
    )
}