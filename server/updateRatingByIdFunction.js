async function updateRatingById(id, rating, node1_db, node2_db, node3_db, node1_recovery, node2_recovery, node3_recovery){
    const recoveryQuery = `INSERT INTO recovery (transaction_no, movie_id, operation, name_old_val, 
        name_new_val, year_old_val, year_new_val, rating_old_val, rating_new_val) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`
    const transaction_no = Math.floor(Math.random() * 100);

    id = parseInt(id, 10);
    rating = parseFloat(rating)

    try{
        const record = await new Promise((resolve, reject) => {
            const query = "SELECT * FROM movies WHERE id = ?";
            
            node1_db.query(query, [id], (err, results) => {
                if(err) reject(new Error(err.message));
                resolve(results);
            });
        });
        
        const response = await new Promise((resolve, reject) => {
            const query = `SET autocommit = 0; 
                LOCK TABLES movies WRITE; 
                UPDATE movies SET rating = ? WHERE id = ?;
                DO SLEEP(1); 
                COMMIT; 
                UNLOCK TABLES;`;

            node1_db.query(query, [rating, id], (err, results) => {
                if(err) reject(new Error(err.message));
                resolve(results);
            });
        });

        if(record[0].year < 1980){
            try{
                const updateNode2  = await new Promise((resolve, reject) => {
                    const query = "UPDATE movies SET rating = ? WHERE id = ?"
                    node2_db.query(query, [rating, id], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    });
                });
            }
            catch(err){
                console.log("updateRatingByIdFunction: node 2 is unavailable for update");

                const updateRecovery2 = await new Promise((resolve, reject) => {
                    node2_recovery.query(recoveryQuery, [transaction_no, id, "update", record[0].name, record[0].name, record[0].year, record[0].year, record[0].rating, rating], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    });
                });
                const commitQuery = await new Promise((resolve, reject) => {
                    node2_recovery.query(recoveryQuery, [transaction_no, id, "commit", record[0].name, record[0].name, record[0].year, record[0].year, record[0].rating, rating], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    });
                });
            }
        }
        else{
            try{
                const updateNode3  = await new Promise((resolve, reject) => {
                    const query = "UPDATE movies SET rating = ? WHERE id = ?";
                    node3_db.query(query, [rating, id], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    });
                });
            }
            catch(err){
                console.log("updateRatingByIdFunction: node 3 is unavailable for update");

                const updateRecovery3 = await new Promise((resolve, reject) => {
                    node3_recovery.query(recoveryQuery, [transaction_no, id, "update", record[0].name, record[0].name, record[0].year, record[0].year, record[0].rating, rating], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    });
                });

                const commitQuery = await new Promise((resolve, reject) => {
                    node3_recovery.query(recoveryQuery, [transaction_no, id, "commit", record[0].name, record[0].name, record[0].year, record[0].year, record[0].rating, rating], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    });
                });
            }
        }
        return response[2].affectedRows === 1 ? true : false;

    }catch(err){
        console.log("updateRatingByIdFunction: Central node is unavailable for update");
        const query = `SET autocommit = 0; 
                        LOCK TABLES movies WRITE; 
                        UPDATE movies SET rating = ? WHERE id = ?;
                        DO SLEEP(1); 
                        COMMIT; 
                        UNLOCK TABLES;`;
        let response = null;
        let record = null;

        record = await new Promise((resolve, reject) => {
            const query = "SELECT * FROM movies WHERE id = ?";
            
            node2_db.query(query, [id], (err, results) => {
                if(err) reject(new Error(err.message));
                resolve(results);
            });
        });

        if(record.length === 0){
            record = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM movies WHERE id = ?";
                
                node3_db.query(query, [id], (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results);
                });
            });

            response  = await new Promise((resolve, reject) => {
                node3_db.query(query, [rating, id], (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results);
                });
            });
        }
        else{
            response  = await new Promise((resolve, reject) => {
                node2_db.query(query, [rating, id], (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results);
                });
            });
        }
    
        const updateRecovery1 = await new Promise((resolve, reject) => {
            node1_recovery.query(recoveryQuery, [transaction_no, id, "update", record[0].name, record[0].name, record[0].year, record[0].year, record[0].rating, rating], (err, results) => {
                if(err) reject(new Error(err.message));
                resolve(results);
            });
        });

        const commitQuery = await new Promise((resolve, reject) => {
            node1_recovery.query(recoveryQuery, [transaction_no, id, "commit", record[0].name, record[0].name, record[0].year, record[0].year, record[0].rating, rating], (err, results) => {
                if(err) reject(new Error(err.message));
                resolve(results);
            });
        });

        return response[2].affectedRows === 1 ? true : false;
    }
}

module.exports.updateRatingById = updateRatingById;