const db = require('../../database');

const createQuestion = (questionData, done) => {
    const sqlCheckItem = 'SELECT creator_id FROM items WHERE item_id = ?';
    db.get(sqlCheckItem, [questionData.item_id], (err, item) => {
        if (err) return done({ status: 500, error: err });
        if (!item) return done({ status: 404, error: "Item not found" });

        if (item.creator_id === questionData.asked_by) {
            return done({ status: 403, error: "Cannot ask question on your own item" });
        }

        const sqlInsert = `
            INSERT INTO questions (question, asked_by, item_id)
            VALUES (?, ?, ?)
        `;
        const values = [
            questionData.question,
            questionData.asked_by,
            questionData.item_id
        ];

        db.run(sqlInsert, values, function(err) {
            if (err) return done({ status: 500, error: err });
            return done(null, this.lastID);
        });
    });
};

module.exports = {
    createQuestion
};
