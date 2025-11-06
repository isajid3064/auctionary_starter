const auth = require('../lib/middleware');
const questions = require('../controllers/questions.server.controllers');

module.exports = function(app) {
    app.get('/questions', (req, res) => {
        res.json({ message: 'List of questions' });
    });

    app.route('/item/:item_id/question')
        .post(auth.isAuthenticated, questions.createQuestion)

}; 