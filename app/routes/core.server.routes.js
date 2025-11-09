const core = require('../controllers/core.server.controllers'),
        auth = require('../lib/middleware');

module.exports = function(app) {
    app.get('/item', (req, res) => {
        res.json({ message: 'List of core functionality' });
    });

    app.route('/item')
        .post(auth.isAuthenticated,core.createItem);

    app.route('/item/:item_id')
        .get(core.getItemDetails);
    
    app.route('/item/:item_id/bid')
        .get(core.getItemBidHistory)
        .post(auth.isAuthenticated,core.bidOnItem);
        
    app.route('/search')
        .get(core.searchItems);
};