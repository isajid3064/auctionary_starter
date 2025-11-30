const Joi = require('joi');
const core = require('../models/core.server.models');
const users = require('../models/user.server.models');
const profanityFilter = require('../utils/profanityFilter');

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
            name: profanityFilter(req.body.name),
            description: profanityFilter(req.body.description),
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

const getAllCategories = (req, res) => {
    core.getAllCategories((err, categories) => {
        if (err) {
            return res.status(500).json({ error_message: "Server error" });
        }
        return res.status(200).json(categories);
    });
};

const addCategoryType = (req , res) => {

    const token = req.get('X-Authorization');
    if (!token) {
        return res.status(401).json({ error_message: "Missing token" });
    }
    
    users.getIdFromToken(token, (err, userId) => {
        if (err || !userId) {
            return res.status(401).json({ error_message: "Invalid token" });
        }

        const schema = Joi.object({
            type: Joi.string().min(3).max(50).required()
        });

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error_message: error.details[0].message });
        }

        let categoryType = {
            type: req.body.type
        };

        core.addCategoryType(categoryType, (err, typeId) => {
            if (err) {
                return res.status(400).json({ error_message: "Couldn't add category type" });
            }
            return res.status(201).json({ type_id: typeId });
        });
    });
};

const searchItems = (req, res) => {
    const token = req.get('X-Authorization');

    const schema = Joi.object({
        q: Joi.string().min(1).max(100).optional(),
        status: Joi.string().valid('BID', 'OPEN', 'ARCHIVE').optional(),
        limit: Joi.number().integer().min(1).max(100).default(20),
        offset: Joi.number().integer().min(0).default(0)
    });

    const { error, value } = schema.validate(req.query);
    if (error) {
        return res.status(400).json({ error_message: error.details[0].message });
    }

    const { q, status, limit, offset } = value;

    if (!token && !status) {
        return core.searchItems({ q, limit, offset }, (err, results) => {
            if (err) {
                return res.status(err.status || 500).json({ error_message: err.error });
            }
            return res.status(200).json(results);
        });
    }

    if (!token && status) {
        return res
            .status(400)
            .json({ error_message: "Authentication required for status filter" });
    }

    users.getIdFromToken(token, (err, userId) => {
        if (err || !userId) {
            return res.status(400).json({ error_message: "Invalid token" });
        }

        core.searchItems({ userId, q, status, limit, offset }, (err2, results) => {
            if (err2) {
                return res.status(err2.status || 500).json({ error_message: err2.error });
            }
            return res.status(200).json(results);
        });
    });
};


module.exports = {
    createItem: createItem,
    bidOnItem:bidOnItem,
    getItemBidHistory: getItemBidHistory,
    getItemDetails: getItemDetails,
    searchItems: searchItems,
    addCategoryType: addCategoryType,
    getAllCategories: getAllCategories
};
