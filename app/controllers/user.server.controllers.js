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
            first_name: Joi.string().min(2).max(60).required(),
            last_name: Joi.string().min(2).max(60).required(),
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

const getUserById = (req,res) => {
    const userId = req.params.user_id;
    users.getUserById(userId, (err, user) => {
        if(err) {
            return res.status(404).send("User not found");
        }
        return res.status(200).json(user);
    });
}; 

module.exports = {
    getAllUsers: getAllUsers,
    createUser: createUser,
    getUserById: getUserById
};