const Joi = require('joi');
const core = require('../models/core.server.models');
const users = require('../models/user.server.models');

const createItem = (req, res) => {
    const token = req.get('X-Authorization');
    if (!token) {
        return res.status(401).json({ error_message: "Missing token" });
    }

    users.getIdFromToken(token, (err, userId) => {
        if (err || !userId) {
            return res.status(401).json({ error_message: "Invalid token" });
        }

        const schema = Joi.object({
            name: Joi.string().min(3).max(100).required(),
            description: Joi.string().min(5).max(500).required(),
            starting_bid: Joi.number().positive().required(),
            end_date: Joi.number().greater(Date.now()).required()
        });

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error_message: error.details[0].message });
        }

        let itemToCreate = {
            name: req.body.name,
            description: req.body.description,
            starting_bid: req.body.starting_bid,
            end_date: req.body.end_date,
            creator_id: userId
        };

        core.CreateItem(itemToCreate, (err, itemId) => {
            if (err) {
                return res.status(400).json({ error_message: "Couldn't create item" });
            }
            return res.status(201).json({ item_id: itemId });
        });
    });
};

const bidOnItem = (req, res) => {
    const token = req.get('X-Authorization');
    if (!token) {
        return res.status(401).json({ error_message: "Missing token" });
    }

    users.getIdFromToken(token, (err, userId) => {
        if (err || !userId) {
            return res.status(401).json({ error_message: "Invalid token" });
        }

        const schema = Joi.object({
            amount: Joi.number().positive().required()
        });

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error_message: error.details[0].message });
        }

        let bid = {
            item_id: parseInt(req.params.item_id),
            user_id: userId,
            amount: req.body.amount,
            timestamp: Date.now()
        };

        core.bidOnItem(bid, (err, bidId) => {
            if (err) {
                if (err.status === 404) {
                    return res.status(404).json({ error_message: err.error });
                }
                if (err.status === 403) {
                    return res.status(403).json({ error_message: err.error });
                }
                if (err.status === 400) {
                    return res.status(400).json({ error_message: err.error });
                }
                return res.status(500).json({ error_message: "Server error" });
            }

            return res.status(201).json({ bid_id: bidId });
        });
    });
};

const getItemBidHistory = (req, res) => {
    const itemId = parseInt(req.params.item_id);

    core.getItemBidHistory(itemId, (err, result) => {
        if (err) {
            if (err.status === 404) {
                return res.status(404).json({ error_message: err.error });
            }
            return res.status(500).json({ error_message: "Server error" });
        }
        return res.status(200).json(result);
    });
};

const getItemDetails = (req, res) => {
    const itemId = req.params.item_id;

    core.getItemDetails(itemId, (err, item) => {
        if (err) return res.status(500).json({ error: err });

        if (!item) {
            return res.status(404).send();
        }

        return res.status(200).json(item);
    });
};


module.exports = {
    createItem: createItem,
    bidOnItem:bidOnItem,
    getItemBidHistory: getItemBidHistory,
    getItemDetails: getItemDetails
};
