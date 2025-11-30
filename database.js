const sqlite3 = require('sqlite3').verbose();

const DBSOURCE = 'db.sqlite';

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if(err){
        console.log(err.message);
        throw err;
    }else{
        console.log('Connected to the SQLite database.')

        db.run(`CREATE TABLE users (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name text,
                last_name text,
                email text UNIQUE,
                password text,
                salt text,
                session_token text,
                CONSTRAINT email_unique UNIQUE (email)
            )`, (err) => {
                if(err){
                    console.log('Users table already created');
                }else{
                    console.log('Users table created');
                }
            }
        );

        
        db.run(`CREATE TABLE items (
                item_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                description TEXT,
                starting_bid INTEGER,
                start_date INTEGER,
                end_date INTEGER,
                creator_id INTEGER,
                FOREIGN KEY(creator_id) REFERENCES users(user_id)
            )`, (err) => {
                if(err){
                    console.log('Items table already created');
                }else{
                    console.log('Items table created');
                }
            }
        );

        db.run(`CREATE TABLE bids (
                item_id INTEGER,
                user_id INTEGER,
                amount INTEGER,
                timestamp INTEGER,
                PRIMARY KEY (item_id, user_id, amount),
                FOREIGN KEY (item_id) REFERENCES items(item_id),
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )`, (err) => {
                if(err){
                    // console.log(err)
                    console.log('Bid table already created');
                }else{
                    console.log('Bid table created');
                }
            }
        );

        db.run(`CREATE TABLE questions (
                question_id INTEGER PRIMARY KEY AUTOINCREMENT,
                question TEXT,
                answer TEXT,
                asked_by INTEGER,
                item_id INTEGER,
                FOREIGN KEY (asked_by) REFERENCES users(user_id),
                FOREIGN KEY (item_id) REFERENCES items(item_id)
            )`, (err) => {
                if(err){
                    console.log('Questions table already created');
                }else{
                    console.log('Questions table created');
                }
            }
        );

        db.run(`CREATE TABLE categories (
                category_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL
            )`, (err) => {
                if(err){
                    console.log('Categories table already created');
                }else{
                    console.log('Categories table created');
                }
            }
        );

        db.run(`CREATE TABLE item_categories (
                item_id INTEGER,
                category_id INTEGER,
                PRIMARY KEY (item_id, category_id),
                FOREIGN KEY (item_id) REFERENCES items(item_id),
                FOREIGN KEY (category_id) REFERENCES categories(category_id)
            )`, (err) => {
                if(err){
                    console.log('Item categories table already created');
                }else{
                    console.log('Item categories table created');
                }
            }
        );
    }
});

module.exports = db;
