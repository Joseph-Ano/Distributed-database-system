const mysql = require("mysql");
const dotenv = require('dotenv');
const { response } = require("express");
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

const recovery1 = mysql.createConnection({
    host: process.env.RECOVERY_HOST1,
    user: process.env.RECOVERY_USER1,
    password: process.env.RECOVERY_PASSWORD1,
    database: process.env.RECOVERY_DATABASE1,
    port: process.env.RECOVERY_DB_PORT1,
    multipleStatements: true
})

const recovery2 = mysql.createConnection({
    host: process.env.RECOVERY_HOST2,
    user: process.env.RECOVERY_USER2,
    password: process.env.RECOVERY_PASSWORD2,
    database: process.env.RECOVERY_DATABASE2,
    port: process.env.RECOVERY_DB_PORT2,
    multipleStatements: true
})

const recovery3 = mysql.createConnection({
    host: process.env.RECOVERY_HOST3,
    user: process.env.RECOVERY_USER3,
    password: process.env.RECOVERY_PASSWORD3,
    database: process.env.RECOVERY_DATABASE3,
    port: process.env.RECOVERY_DB_PORT3,
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

recovery1.connect((err) => {
    if(err){
        console.log(err.message);
    }
    
    console.log('recovery1 ' + connection.state);
})

recovery2.connect((err) => {
    if(err){
        console.log(err.message);
    }
    
    console.log('recovery2 ' + connection.state);
})

recovery3.connect((err) => {
    if(err){
        console.log(err.message);
    }
    console.log('recovery3 ' + connection.state);
})



 class DbService {
    static getDbServiceInstance(){
        return instance ? instance : new DbService();
    }

    async getAllData(){
        const query = "SELECT * FROM movies;"
        let response = null
        try {
            response = await new Promise((resolve, reject) => {
                connection.query(query, (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results);
                });
            });
            
            return response;
        } catch (err){
            //console.log(err);
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

            response = node3.concat(node2)
            return response
        }
    }

    async insertRecord(id, name, year, rating){
        const query = "INSERT INTO movies (id, name, year, rating) VALUES (?, ?, ?, ?);";
        const recovery_query = `INSERT INTO recovery (transaction_no, movie_id, operation, name_old_val, 
            name_new_val, year_old_val, year_new_val, rating_old_val, rating_new_val) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`
        const transaction_no = Math.floor(Math.random() * 100);

        try {
            const insertId = await new Promise((resolve, reject) => {
                connection.query(query, [id, name, year, rating], (err, results) => {
                    if(err) reject(new Error(err.message));
                    else resolve(results.insertId);
                });
            });

            if(year < 1980){
                try{
                    const node2Insert = await new Promise((resolve, reject) => {
                        connection2.query(query, [id, name, year, rating], (err, results) => {
                            if(err)reject(new Error(err.message));
                            else resolve(results);
                        });
                    });
                }
                catch(err){
                    const recovery_two = await new Promise((resolve, reject) => {
                        recovery2.query(recovery_query, [transaction_no, id, "insert", null, name, null, year, null, rating], (err, results) => {
                            if(err) reject(new Error(err.message));
                            else resolve(results);
                        });
                    });   
                }
            }
            else{
                try{
                    const node3Insert = await new Promise((resolve, reject) => {
                        connection3.query(query, [id, name, year, rating], (err, results) => {
                            if(err) reject(new Error(err.message));
                            else resolve(results);
                        });
                    });
                }
                catch(err){
                    const recovery_three = await new Promise((resolve, reject) => {
                        recovery3.query(recovery_query, [transaction_no, id, "insert", null, name, null, year, null, rating], (err, results) => {
                            if(err) reject(new Error(err.message));
                            else resolve(results);
                        });
                    });
                }
            }

            return {
                id: insertId,
                name: name,
                year: year,
                rating: rating
            }

        } catch(err){
            let insertId = null

            if(year < 1980){
                insertId = await new Promise((resolve, reject) => {
                    connection2.query(query, [id, name, year, rating], (err, results) => {
                        if(err) reject(new Error(err.message));
                        else resolve(results.insertId);
                    });
                });
            }
            else{
                insertId = await new Promise((resolve, reject) => {
                    connection3.query(query, [id, name, year, rating], (err, results) => {
                        if(err) reject(new Error(err.message));
                        else resolve(results);
                    });
                });
            }

            const recovery_one = await new Promise((resolve, reject) => {
                recovery1.query(recovery_query, [transaction_no, id, "insert", null, name, null, year, null, rating], (err, results) => {
                    if(err) reject(new Error(err.message));
                    else resolve(results);
                });
            });
            
            return {
                id: insertId,
                name: name,
                year: year,
                rating: rating
            }
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
        let response = null;
        const query = `SET autocommit = 0; 
                        SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED; 
                        START TRANSACTION; DO SLEEP(1); 
                        SELECT * FROM movies WHERE name = ? AND year = ?; 
                        COMMIT;`;

        if(year < 1980){
            try{
                response = await new Promise((resolve, reject) => {
                    connection2.query(query, [name, year], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    });
                });
            }
            catch(err){
                //console.log(err)
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
            try{
                response = await new Promise((resolve, reject) => {
                    connection3.query(query, [name, year], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    });
                });
            }
            catch(err){
                //console.log(err)
                response = await new Promise((resolve, reject) => {
                    connection.query(query, [name, year], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    });
                });
            }
            return response[4];
        } 
    }

    async getReport(){
        const query = `SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
                START TRANSACTION;
                WITH subquery1 as (SELECT \`year\`, MAX(rating) as rating FROM movies GROUP BY \`year\`)
                SELECT m.\`year\`, m.\`name\`, m.rating FROM movies m JOIN subquery1 s ON  m.\`year\`=s.\`year\` AND m.rating=s.rating ORDER BY m.\`year\` DESC;
                DO SLEEP(5);
                WITH subquery1 as (SELECT \`year\`, MAX(rating) as rating FROM movies GROUP BY \`year\`)
                SELECT m.\`year\`, m.\`name\`, m.rating FROM movies m JOIN subquery1 s ON  m.\`year\`=s.\`year\` AND m.rating=s.rating ORDER BY m.\`year\` DESC;
                COMMIT;`;
        let response = null;

        try {
            response = await new Promise((resolve, reject) => {
                connection.query(query, (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results);
                });
            });
            
            return response[4];

        } catch (err){
            //console.log(err);
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
            return response;
        }
    }

    async perform_recover(db){
        let query = `SELECT * FROM recovery WHERE operation = "insert"`
        let recovery_db = null;
        let actual_db = null;

        if(db == "node1"){
            recovery_db = recovery1
            actual_db = connection
        }
        else if(db == "node2"){
            recovery_db = recovery2
            actual_db = connection2
        }
        else{
            recovery_db = recovery3
            actual_db = connection3
        }
        
        let response = await new Promise((resolve, reject) => {
            recovery_db.query(query, (err, results) => {
                if(err) reject(new Error(err.message));
                resolve(results);
            });
        });

        query = `INSERT INTO movies (id, name, year, rating) 
            VALUES (?, ?, ?, ? );`

        response.forEach((element, index, array) => {
            actual_db.query(query, [element.movie_id, element.name_new_val, element.year_new_val, element.rating_new_val], (err, results) => {
                if(err) console.log(err);
                else{
                    recovery_db.query("DELETE FROM recovery WHERE id = ?", [element.id], (err, results) => {
                        if(err) console.log(err);
                        else console.log("success");
                    })
                }
            });
        }); 

        //TODO check for commits and non-commits
    }
 }

 module.exports = DbService;