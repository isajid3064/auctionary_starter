const express = require('express');
const Joi = require('joi');
const db = require('../../database');

module.exports = function(app) {
    app.get('/user', (req, res) => {
        res.json({ message: 'List of list of users' });
    });

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
    
        const sql = 'INSERT INTO users (first_name, last_name, email, password) VALUES (?,?,?,?)';

        const {error} = schema.validate(req.body);
        if(error){
            return res.status(400).send(error.details[0].message);
        }

        let values = [req.body.first_name, req.body.last_name, req.body.email, req.body.password];
        db.run(sql, values, function(err) {
            if(err)return res.status(400).send("Couldnt create user"); 
            return res.status(201).send(this.lastID.toString());
        });
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
                }
            )
        }
    );

    app.get('/users/:user_id', (req, res) => {

        const user_id = req.params.user_id;
        const sql = 'SELECT * FROM users WHERE user_id = ?';
        const values = [user_id];

        db.get(sql, values, (err, row) => {
            if(err){ return res.status(500).send("Couldnt retrieve user"); }
            if(!row){ return res.status(404).send("User not found"); }

            const user = {
                user_id: row.user_id,
                first_name: row.first_name,
                last_name: row.last_name,
                email: row.email
            };
            return res.status(200).send(user);
        });
    });

    app.post('/login', (req, res) => {
        // Login functionality to be implemented
        return res.status(501).send("Not implemented");
    });

    app.post('/logout', (req, res) => {
        // Logout functionality to be implemented
        return res.status(501).send("Not implemented");
    });
}

