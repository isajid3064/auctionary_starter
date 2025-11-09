const db = require('../../database');
const crypto = require('crypto');

const getAllUsers = (done) => {
    const sql = 'SELECT * FROM users'
    const error = [];
    const results = [];

    db.each(
        sql,
        [],
        (err, row) => {
            if(err) error.push(err);
            results.push({
                user_id: row.user_id,
                first_name: row.first_name,
                last_name: row.last_name,
                email: row.email
            });
        },
        (err, num_rows) => {
            if(err) return done(err, null);
            return done(null, results , num_rows);
        }
    );
}

const CreateUser = (userData, done) => {
    const sql = 'INSERT INTO users (first_name, last_name, email, password, salt) VALUES (?,?,?,?,?)';

    const salt = crypto.randomBytes(64);
    const hash = getHash(userData.password, salt);

    let values = [userData.first_name, userData.last_name, userData.email, hash,salt.toString('hex')];

    db.run(sql, values, function(err) {
        if(err) return done(err);
        return done(null, this.lastID);
    });
};

const getUserById = (userId, done) => {
    const sqlUser = 'SELECT user_id, first_name, last_name FROM users WHERE user_id = ?';
    db.get(sqlUser, [userId], (err, user) => {
        if (err) return done({ status: 500, error: err });
        if (!user) return done({ status: 404, error: "User not found" });
        const sqlSelling = `
            SELECT 
                i.item_id,
                i.name,
                i.description,
                i.end_date,
                i.creator_id,
                u.first_name,
                u.last_name
            FROM items i
            JOIN users u ON i.creator_id = u.user_id
            WHERE i.creator_id = ?
        `;

        db.all(sqlSelling, [userId], (err, selling) => {
            if (err) return done({ status: 500, error: err });
            const sqlBidding = `
                SELECT 
                    i.item_id,
                    i.name,
                    i.description,
                    i.end_date,
                    i.creator_id,
                    u.first_name,
                    u.last_name
                FROM bids b
                JOIN items i ON b.item_id = i.item_id
                JOIN users u ON i.creator_id = u.user_id
                WHERE b.user_id = ?
                GROUP BY i.item_id
            `;

            db.all(sqlBidding, [userId], (err, biddingOn) => {
                if (err) return done({ status: 500, error: err });
                const currentTime = Math.floor(Date.now() / 1000);
                const sqlEnded = `
                    SELECT 
                        i.item_id,
                        i.name,
                        i.description,
                        i.end_date,
                        i.creator_id,
                        u.first_name,
                        u.last_name
                    FROM items i
                    JOIN users u ON i.creator_id = u.user_id
                    WHERE i.creator_id = ?
                    AND i.end_date < ?
                `;

                db.all(sqlEnded, [userId, currentTime], (err, auctionsEnded) => {
                    if (err) return done({ status: 500, error: err });
                    const result = {
                        user_id: user.user_id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        selling: selling || [],
                        bidding_on: biddingOn || [],
                        auctions_ended: auctionsEnded || []
                    };

                    return done(null, result);
                });
            });
        });
    });
};

const authenticateUser = (email, password, done) => {
    const sql = 'SELECT user_id, password, salt FROM users WHERE email = ?';

    db.get(sql, email, (err, row) => {
        if(err) return done(err);
        if(!row) return done(404);

        if (row.salt === null) row.salt = '';
        let salt = Buffer.from(row.salt, 'hex');

        if(row.password === getHash(password, salt)) {
            return done(null, row.user_id);
        }
        else
        {
            return done(404) //wrong passrod
        }
    });
};

const getToken = function(id, done){
    db.get(
        'SELECT session_token FROM users WHERE user_id=?',
        [id],
        function(err, row){
          if (row && row.session_token){
            return done(null, row.session_token);
          }else{
            return done(null, null);
          } 
        }
    );
};

const setToken = (id,done) => {
    const token = crypto.randomBytes(16).toString('hex');
    const sql = 'UPDATE users SET session_token = ? WHERE user_id = ?';

    db.run(sql, [token, id], (err) => {
        return done(err, token);
    });
};

const removeToken = (token, done) => {
    const sql = 'UPDATE users SET session_token = NULL WHERE session_token = ?';
    
    db.run(sql, [token], function(err) {
        if (err) return done(err);
        if (this.changes === 0) return done(new Error("Invalid token"));
        return done(null);
    });
};

const getIdFromToken = (token, done) => {
    const sql = 'SELECT user_id FROM users WHERE session_token = ?';

    db.get(sql, [token], (err, row) => {
        if (err) return done(err);
        if (!row) return done(null, null);
        return done(null, row.user_id);
    });
};

const getHash = (password, salt) => {
    return crypto.pbkdf2Sync(password, salt, 10000, 256, 'sha256').toString('hex');
}

module.exports = {
    getAllUsers: getAllUsers,
    createUser: CreateUser,
    getUserById: getUserById,
    authenticateUser: authenticateUser,
    setToken: setToken,
    getToken: getToken,
    removeToken: removeToken,
    getIdFromToken: getIdFromToken
};