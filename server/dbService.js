const mysql = require("mysql");
const dotenv = require('dotenv');
let instance = null;
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT,
    multipleStatements: true
})

connection.connect((err) => {
    if(err){
        console.log(err.message);
    }
    
    console.log('db ' + connection.state);
})

 class DbService {
    static getDbServiceInstance(){
        return instance ? instance : new DbService();
    }

    async getAllData(){
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM movies;";

                connection.query(query, (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results);
                });
            });

            // console.log(response);
            return response;

        } catch (err){
            console.log(err);
        }
    }

    async insertRecord(name, year, rating){
        try {
            const insertId = await new Promise((resolve, reject) => {
                const query = "INSERT INTO movies (name, year, rating) VALUES (?, ?, ?);";

                connection.query(query, [name, year, rating], (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results.insertId);
                });
            });

            // console.log(insertId);
            return {
                movie_id: insertId,
                name: name,
                year: year,
                rating: rating
            }

        } catch(err){
            console.log(err);
        }
    }

    async deleteRowById(id){
        try{
            id = parseInt(id, 10);
            const response = await new Promise((resolve, reject) => {
                const query = "DELETE FROM movies WHERE movie_id = ?; ALTER TABLE movies AUTO_INCREMENT = 1;";
    
                connection.query(query, [id], (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results[0].affectedRows);
                });
            });

             console.log(response);
            return response === 1 ? true : false;
        }catch(err){
            console.log(err)
            return false;
        }
    }
 }

 module.exports = DbService;