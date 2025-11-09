const Joi = require('joi');
const users = require('../models/user.server.models');

const getAllUsers = (req,res) => {
    users.getAllUsers((err, users , num_rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        return res.status(200).json(users);
    });
};

const createUser = (req,res) => {
        const schema = Joi.object({
            first_name: Joi.string().required(),
            last_name: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(8).required()
                .pattern(new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])'))
                .required()
                .messages({'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character',
                    'string.min': 'Password must be at least 8 characters long'})
            });

        const {error} = schema.validate(req.body);
        if(error){
            return res.status(400).json({error_message: error.details[0].message});
        }
        
        let userToCreate = Object.assign({}, req.body);

        users.createUser(userToCreate, (err, userId) => {
            if(err) return  res.status(400).json({error_message:"Couldnt create user"});
            return res.status(201).json({ user_id: userId });
        });
};

const login = (req, res) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    const {error} = schema.validate(req.body);
    if(error){
        return res.status(400).json({error_message: error.details[0].message});
    }

    let email = req.body.email;
    let password = req.body.password;

    users.authenticateUser(email, password, (err, userId) => {
        if(err === 404){
            return res.status(400).json({error_message: "Invalid Email/Password supplied"});
        }if(err){
            return res.status(500);
        }
        users.getToken(userId, (err, token) => {
            if(err){
                return res.status(500);
            }
            if(token){
                return res.status(200).json({ user_id: userId, session_token: token });
            }else{
                users.setToken(userId, (err, newToken) => {
                    if(err){
                        return res.status(500);
                    }
                    return res.status(200).json({user_id:userId, session_token: newToken });
                });
            }
        });
    });
};

const logout = (req, res) => {
    const token = req.get('X-Authorization');
    if (!token) {
        return res.status(401).send("Missing token");
    }

    users.removeToken(token, function(err){
        if (err){
            return res.status(401).send("Invalid token");
        } else {
            return res.status(200).send("Successfully logged out");
        }
    });
};

const getUserById = (req, res) => {
    const userId = parseInt(req.params.user_id);

    users.getUserById(userId, (err, user) => {
        if (err) {
            return res.status(err.status || 500).json({ error_message: err.error });
        }
        return res.status(200).json(user);
    });
};

module.exports = {
    getAllUsers: getAllUsers,
    createUser: createUser,
    getUserById: getUserById,
    login: login,
    logout: logout
};