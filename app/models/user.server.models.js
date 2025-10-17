const db = require('../../database');

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
    const sql = 'INSERT INTO users (first_name, last_name, email, password) VALUES (?,?,?,?)';
    let values = [userData.first_name, userData.last_name, userData.email, userData.password];
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

module.exports = {
    getAllUsers: getAllUsers,
    createUser: CreateUser,
    getUserById: GetUserById
};