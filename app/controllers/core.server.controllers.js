const Joi = require('joi');
const core = require('../models/core.server.models');

const createItem = (req, res) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(100).required(),
        description: Joi.string().min(5).max(500).required(),
        starting_bid: Joi.number().positive().required(),
        end_date: Joi.number().greater(Date.now()).required()
    });

    const {error} = schema.validate(req.body);
    if(error){
        return res.status(400).json({error_message: error.details[0].message});
    }

    let itemToCreate = Object.assign({}, req.body);
    
    core.CreateItem(itemToCreate, (err, itemId) => {
        if(err) return  res.status(400).json({error_message:"Couldnt create item"});
        return res.status(201).json({ item_id: itemId });
    });
};

module.exports = {
    createItem: createItem
    };