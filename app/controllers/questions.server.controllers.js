const questions = require('../models/questions.server.models');
const users = require('../models/user.server.models');
const Joi = require('joi');

const createQuestion = (req, res) => {
    const token = req.get('X-Authorization');
    if (!token) {
        return res.status(401).json({ error_message: "Missing token" });
    }

    users.getIdFromToken(token, (err, userId) => {
        if (err || !userId) {
            return res.status(401).json({ error_message: "Invalid token" });
        }

        const schema = Joi.object({
            question_text: Joi.string().min(1).max(500).required()
        });

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error_message: error.details[0].message });
        }

        const questionToCreate = {
            question: req.body.question_text,
            asked_by: userId,
            item_id: parseInt(req.params.item_id)
        };

        questions.createQuestion(questionToCreate, (err, questionId) => {
            if (err) {
                return res.status(err.status || 500).json({ error_message: err.error });
            }
            return res.status(200).json({ question_id: questionId });
        });
    });
};


module.exports = {
    createQuestion,
};
