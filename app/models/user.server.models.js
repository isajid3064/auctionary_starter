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

const GetUserById = (userId, done) => {
    const sql = 'SELECT * FROM users WHERE user_id = ?';
    const values = [userId];
    db.get(sql, values, (err, row) => {
        if(err) return done(err);
        if(!row) return done(new Error("User not found"));
        const user = {
            user_id: row.user_id,
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email
        };
        return done(null, user);
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
    const sql = 'UPDATE users SET session_token = NULL WHERE user_id = ?';

    db.run(sql, [token], (err) => {
        return done(err);
    });
};

const getHash = (password, salt) => {
    return crypto.pbkdf2Sync(password, salt, 10000, 256, 'sha256').toString('hex');
}

module.exports = {
    getAllUsers: getAllUsers,
    createUser: CreateUser,
    getUserById: GetUserById,
    authenticateUser: authenticateUser,
    setToken: setToken,
    getToken: getToken,
    removeToken: removeToken
};