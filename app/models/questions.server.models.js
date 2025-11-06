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

const answerQuestion = (answerData, done) => {
   const sqlCheckQuestion = 'SELECT item_id FROM questions WHERE question_id = ?';
   db.get(sqlCheckQuestion, [answerData.question_id], (err, question) => {
       if (err) return done({ status: 500, error: err });
       if (!question) return done({ status: 404, error: "Question not found" });

       const sqlCheckItemOwner = 'SELECT creator_id FROM items WHERE item_id = ?';
       db.get(sqlCheckItemOwner, [question.item_id], (err, item) => {
           if (err) return done({ status: 500, error: err });
           if (item.creator_id !== answerData.answered_by) {
               return done({ status: 403, error: "Only the item owner can answer this question" });
           }

           if (!answerData.answer || answerData.answer.trim() === "") {
               return done({ status: 400, error: "Answer cannot be empty" });
           }

           const sqlUpdate = `
               UPDATE questions
               SET answer = ?
               WHERE question_id = ?
           `;
           const values = [
               answerData.answer,
               answerData.question_id
           ];

           db.run(sqlUpdate, values, function(err) {
               if (err) return done({ status: 500, error: err });
               return done(null);
           });
       });
   });
};

module.exports = {
    createQuestion,
    answerQuestion
};
