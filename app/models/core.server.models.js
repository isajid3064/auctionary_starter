const db = require('../../database');

const CreateItem = (itemData, done) => {
    const sql = 'INSERT INTO items (name, description, starting_bid, end_date) VALUES (?,?,?,?)';
    let values = [itemData.name, itemData.description, itemData.starting_bid, itemData.end_date];
    db.run(sql, values, function(err) {
        if(err) return done(err);
        return done(null, this.lastID);
    });
};

module.exports = {
    CreateItem: CreateItem
};