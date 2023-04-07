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
    
    console.log('db1 ' + connection.state);
})

connection2.connect((err) => {
    if(err){
        console.log(err.message);
    }
    
    console.log('db2 ' + connection.state);
})

connection3.connect((err) => {
    if(err){
        console.log(err.message);
    }
    
    console.log('db3 ' + connection.state);
})



 class DbService {
    static getDbServiceInstance(){
        return instance ? instance : new DbService();
    }

    async getAllData(){
        try {
            let response = null
            const query = "SELECT * FROM movies;"
            if(connection.state != "disconnected"){
                response = await new Promise((resolve, reject) => {
                    connection.query(query, (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    });
                });
            }
            else{
                let node2 = await new Promise((resolve, reject) => {
                    connection2.query(query, (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    });
                });

                let node3 = await new Promise((resolve, reject) => {
                    connection3.query(query, (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    });
                });

                response = node2.concat(node3)
            }
            return response;

        } catch (err){
            console.log(err);
        }
    }

    async insertRecord(id, name, year, rating){
        try {
            const query = "INSERT INTO movies (id, name, year, rating) VALUES (?, ?, ?, ?);";

            const insertId = await new Promise((resolve, reject) => {
                connection.query(query, [id, name, year, rating], (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results.insertId);
                });
            });

            if(year < 1980){
                const node2Insert = await new Promise((resolve, reject) => {
                    connection2.query(query, [id, name, year, rating], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results.insertId);
                    });
                });
            }
            else{
                const node3Insert = await new Promise((resolve, reject) => {
                    connection3.query(query, [id, name, year, rating], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results.insertId);
                    });
                });
            }

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

            const year = await new Promise((resolve, reject) => {
                const queryYear = "SELECT * FROM movies WHERE id = ?";

                connection.query(queryYear, [id], (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results);
                });
            });

            const query = "DELETE FROM movies WHERE id = ?; ALTER TABLE movies AUTO_INCREMENT = 1;";

            const response = await new Promise((resolve, reject) => {
                connection.query(query, [id], (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results[0].affectedRows);
                });
            });

            if(year[0].year < 1980){
                const nodeUpdate  = await new Promise((resolve, reject) => {       
                    connection2.query(query, [id], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    });
                });
            }

            else{
                const nodeUpdate2  = await new Promise((resolve, reject) => {
                    connection3.query(query, [id], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    });
                });
            }
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
                const nodeUpdate2  = await new Promise((resolve, reject) => {
                    const query = "UPDATE movies SET rating = ? WHERE id = ?";
        
                    connection3.query(query, [rating, id], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    });
                });
            }
            return response.affectedRows === 1 ? true : false;
        }catch(err){
            console.log(err)
            return false;
        }
    }

    async searchByName(name, year){
        try {
            let response = null;
            const query = `SET autocommit = 0; 
                            SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED; 
                            START TRANSACTION; DO SLEEP(1); 
                            SELECT * FROM movies WHERE name = ? AND year = ?; 
                            COMMIT;`;

            if(year < 1980){
                if(connection2.state != "disconnected"){
                     response = await new Promise((resolve, reject) => {

                        connection2.query(query, [name, year], (err, results) => {
                            if(err) reject(new Error(err.message));
                            resolve(results);
                        });
                    });
                }
                else{
                    response = await new Promise((resolve, reject) => {
                        connection.query(query, [name, year], (err, results) => {
                            if(err) reject(new Error(err.message));
                            resolve(results);
                        });
                    });
                }

                return response[4];
            } 

            else{
                if(connection3.state != "disconnected"){
                    response = await new Promise((resolve, reject) => {
                        connection3.query(query, [name, year], (err, results) => {
                            if(err) reject(new Error(err.message));
                            resolve(results);
                        });
                    });
                }
                else{
                    response = await new Promise((resolve, reject) => {
                        connection.query(query, [name, year], (err, results) => {
                            if(err) reject(new Error(err.message));
                            resolve(results);
                        });
                    });
                }
                return response[4];
            }
        }catch (err){
            console.log(err);
        }
    }


    async getReport(){
        try {
            const query = `SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
                START TRANSACTION;
                WITH subquery1 as (SELECT \`year\`, MAX(rating) as rating FROM movies GROUP BY \`year\`)
                SELECT m.\`year\`, m.\`name\`, m.rating FROM movies m JOIN subquery1 s ON  m.\`year\`=s.\`year\` AND m.rating=s.rating ORDER BY m.\`year\` DESC;
                DO SLEEP(5);
                WITH subquery1 as (SELECT \`year\`, MAX(rating) as rating FROM movies GROUP BY \`year\`)
                SELECT m.\`year\`, m.\`name\`, m.rating FROM movies m JOIN subquery1 s ON  m.\`year\`=s.\`year\` AND m.rating=s.rating ORDER BY m.\`year\` DESC;
                COMMIT;`;
            let response = null;
            
            if(connection.state != "disconnected"){
                response = await new Promise((resolve, reject) => {
                    connection.query(query, (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results[4]);
                    });
                });
            }

            else{
                const node2 = await new Promise((resolve, reject) => {
                    connection2.query(query, (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results[4]);
                    });
                });

                const node3 = await new Promise((resolve, reject) => {
                    connection3.query(query, (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results[4]);
                    });
                });

                response = node3.concat(node2)
            }
            return response;

        } catch (err){
            console.log(err);
        }
    }
 }

 module.exports = DbService;