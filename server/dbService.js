const mysql = require("mysql");
const dotenv = require('dotenv');
let instance = null;
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.HOST1,
    user: process.env.USER1,
    password: process.env.PASSWORD1,
    database: process.env.DATABASE1,
    port: process.env.DB_PORT1,
    multipleStatements: true
})

const connection2 = mysql.createConnection({
    host: process.env.HOST2,
    user: process.env.USER2,
    password: process.env.PASSWORD2,
    database: process.env.DATABASE2,
    port: process.env.DB_PORT2,
    multipleStatements: true
})

const connection3 = mysql.createConnection({
    host: process.env.HOST3,
    user: process.env.USER3,
    password: process.env.PASSWORD3,
    database: process.env.DATABASE3,
    port: process.env.DB_PORT3,
    multipleStatements: true
})

connection.connect((err) => {
    if(err){
        console.log(err.message);
    }
    
    console.log('db ' + connection.state);
})

connection2.connect((err) => {
    if(err){
        console.log(err.message);
    }
    
    console.log('db ' + connection.state);
})

connection3.connect((err) => {
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
        // console.log(connection.state)
        // console.log(connection2.state)
        // console.log(connection3.state)
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

    async insertRecord(id, name, year, rating){
        try {
            const insertId = await new Promise((resolve, reject) => {
                const query = "INSERT INTO movies (id, name, year, rating) VALUES (?, ?, ?, ?);";

                connection.query(query, [id, name, year, rating], (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results.insertId);
                });
            });

            if(year < 1980){
                const node2Insert = await new Promise((resolve, reject) => {
                    const query = "INSERT INTO movies (id, name, year, rating) VALUES (?, ?, ?, ?);";
    
                    connection2.query(query, [id, name, year, rating], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results.insertId);
                    });
                });
            }
            else{
                const node3Insert = await new Promise((resolve, reject) => {
                    const query = "INSERT INTO movies (id, name, year, rating) VALUES (?, ?, ?, ?);";
    
                    connection3.query(query, [id, name, year, rating], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results.insertId);
                    });
                });
            }

            // console.log(insertId);
            return {
                id: insertId,
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
                const query = "DELETE FROM movies WHERE id = ?; ALTER TABLE movies AUTO_INCREMENT = 1;";
    
                connection.query(query, [id], (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results[0].affectedRows);
                });
            });

            //  console.log(response);
            return response === 1 ? true : false;
        }catch(err){
            console.log(err)
            return false;
        }
    }

    async updateRatingById(id, rating){
        try{
            id = parseInt(id, 10);
            rating = parseFloat(rating)
            const response = await new Promise((resolve, reject) => {
                const query = "UPDATE movies SET rating = ? WHERE id = ?";
    
                connection.query(query, [rating, id], (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results);
                });
            });

            const year = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM movies WHERE id = ?";

                connection.query(query, [id], (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results);
                });
            });

            //console.log(year[0].year)

            if(year[0].year < 1980){
                const nodeUpdate  = await new Promise((resolve, reject) => {
                    const query = "UPDATE movies SET rating = ? WHERE id = ?";
        
                    connection2.query(query, [rating, id], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    });
                });
            }

            else{
                const nodeUpdate  = await new Promise((resolve, reject) => {
                    const query = "SET autocommit = 0; UPDATE movies SET rating = ? WHERE id = ?";
        
                    connection3.query(query, [rating, id], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results[1]);
                    });
                });
            }

            // console.log(response);
            return response.affectedRows === 1 ? true : false;
        }catch(err){
            console.log(err)
            return false;
        }
    }

    async searchByName(name, year){
        try {

            if(year < 1980){
                const response = await new Promise((resolve, reject) => {
                    const query = "SET autocommit = 0; SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED; START TRANSACTION; DO SLEEP(1); SELECT * FROM movies WHERE name = ? AND year = ?; COMMIT;";

                    connection2.query(query, [name, year], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    });
                });

                console.log(response[4][0].year);
                return response[4];

            } 

            else{
                const response = await new Promise((resolve, reject) => {
                    const query = "SET autocommit = 0; SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED; START TRANSACTION; DO SLEEP(1); SELECT * FROM movies WHERE name = ? AND year = ?; COMMIT;";

                    connection3.query(query, [name, year], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    });
                });

                console.log(response[4][0].year);
                return response[4];
            }
        }catch (err){
            console.log(err);
        }
    }


    async getReport(){
        // console.log(connection.state)
        // console.log(connection2.state)
        // console.log(connection3.state)
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT year, ROUND(AVG(rating), 2) AS rating FROM movies GROUP BY year ORDER BY year DESC;";

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
 }

 module.exports = DbService;