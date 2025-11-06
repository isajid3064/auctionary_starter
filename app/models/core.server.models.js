const db = require('../../database');

const CreateItem = (itemData, done) => {
    const sql = 'INSERT INTO items (name, description, starting_bid, end_date, creator_id) VALUES (?,?,?,?,?)';
    let values = [itemData.name, itemData.description, itemData.starting_bid, itemData.end_date, itemData.creator_id];
    db.run(sql, values, function(err) {
        if(err) return done(err);
        return done(null, this.lastID);
    });
};


const bidOnItem = (bidData, done) => {
    const sqlCheck = 'SELECT creator_id, starting_bid FROM items WHERE item_id = ?';

    db.get(sqlCheck, [bidData.item_id], (err, item) => {
        if (err) return done({ status: 500, error: err });
        if (!item) return done({ status: 404, error: "Item not found" });

        if (item.creator_id === bidData.user_id) {
            return done({ status: 403, error: "Cannot bid on your own item" });
        }

        const sqlHighestBid = 'SELECT MAX(amount) AS current_bid FROM bids WHERE item_id = ?';

        db.get(sqlHighestBid, [bidData.item_id], (err, row) => {
            if (err) return done({ status: 500, error: err });

            const highestBid = row?.current_bid || item.starting_bid;
            if (bidData.amount <= highestBid) {
                return done({ status: 400, error: "Bid must be higher than current bid" });
            }

            const sqlInsert = `
                INSERT INTO bids (item_id, user_id, amount, timestamp)
                VALUES (?, ?, ?, ?)
            `;
            const values = [
                bidData.item_id,
                bidData.user_id,
                bidData.amount,
                bidData.timestamp
            ];

            db.run(sqlInsert, values, function(err) {
                if (err) return done({ status: 500, error: err });
                return done(null, this.lastID);
            });
        });
    });
};


module.exports = {
    CreateItem: CreateItem,
    bidOnItem: bidOnItem
};