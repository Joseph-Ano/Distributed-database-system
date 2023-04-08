async function updateRatingById(id, rating, connection1, connection2, connection3, recovery1, recovery2, recovery3){
    id = parseInt(id, 10);
    rating = parseFloat(rating)
    const recoveryQuery = `INSERT INTO recovery (transaction_no, movie_id, operation, name_old_val, 
        name_new_val, year_old_val, year_new_val, rating_old_val, rating_new_val) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`
    const transaction_no = Math.floor(Math.random() * 100);

    try{
        const record = await new Promise((resolve, reject) => {
            const query = "SELECT * FROM movies WHERE id = ?";
            
            connection1.query(query, [id], (err, results) => {
                if(err) reject(new Error(err.message));
                resolve(results);
            });
        });
        
        const response = await new Promise((resolve, reject) => {
            const query = "UPDATE movies SET rating = ? WHERE id = ?";

            connection1.query(query, [rating, id], (err, results) => {
                if(err) reject(new Error(err.message));
                resolve(results);
            });
        });

        if(record[0].year < 1980){
            try{
                const nodeUpdate2  = await new Promise((resolve, reject) => {
                    const query = "UPDATE movies SET rating = ? WHERE id = ?"
                    connection2.query(query, [rating, id], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    });
                });
            }
            catch(err){
                console.log("updateRatingByIdFunction: node 2 is unavailable for update");

                const recoveryDb2 = await new Promise((resolve, reject) => {
                    recovery2.query(recoveryQuery, [transaction_no, id, "update", record[0].name, record[0].name, record[0].year, record[0].year, record[0].rating, rating], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    });
                });
                const commitQuery = await new Promise((resolve, reject) => {
                    recovery2.query(recoveryQuery, [transaction_no, id, "commit", record[0].name, record[0].name, record[0].year, record[0].year, record[0].rating, rating], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    });
                });
            }
        }
        else{
            try{
                const nodeUpdate3  = await new Promise((resolve, reject) => {
                    const query = "UPDATE movies SET rating = ? WHERE id = ?";
                    connection3.query(query, [rating, id], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    });
                });
            }
            catch(err){
                console.log("updateRatingByIdFunction: node 3 is unavailable for update");
                const recoveryDb3 = await new Promise((resolve, reject) => {
                    recovery3.query(recoveryQuery, [transaction_no, id, "update", record[0].name, record[0].name, record[0].year, record[0].year, record[0].rating, rating], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    });
                });
                const commitQuery = await new Promise((resolve, reject) => {
                    recovery3.query(recoveryQuery, [transaction_no, id, "commit", record[0].name, record[0].name, record[0].year, record[0].year, record[0].rating, rating], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    });
                });
            }
        }
        return response.affectedRows === 1 ? true : false;

    }catch(err){
        console.log("updateRatingByIdFunction: Central node is unavailable for update");

        let response = null;
        let record = null;

        record = await new Promise((resolve, reject) => {
            const query = "SELECT * FROM movies WHERE id = ?";
            
            connection2.query(query, [id], (err, results) => {
                if(err) reject(new Error(err.message));
                resolve(results);
            });
        });

        if(record.length === 0){
            record = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM movies WHERE id = ?";
                
                connection3.query(query, [id], (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results);
                });
            });

            response  = await new Promise((resolve, reject) => {
                const query = "UPDATE movies SET rating = ? WHERE id = ?";
                connection3.query(query, [rating, id], (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results);
                });
            });
        }
        else{
            response  = await new Promise((resolve, reject) => {
                const query = "UPDATE movies SET rating = ? WHERE id = ?";
                connection2.query(query, [rating, id], (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results);
                });
            });
        }
    
        const recoveryDb1 = await new Promise((resolve, reject) => {
            recovery1.query(recoveryQuery, [transaction_no, id, "update", record[0].name, record[0].name, record[0].year, record[0].year, record[0].rating, rating], (err, results) => {
                if(err) reject(new Error(err.message));
                resolve(results);
            });
        });

        const commitQuery = await new Promise((resolve, reject) => {
            recovery1.query(recoveryQuery, [transaction_no, id, "commit", record[0].name, record[0].name, record[0].year, record[0].year, record[0].rating, rating], (err, results) => {
                if(err) reject(new Error(err.message));
                resolve(results);
            });
        });

        return response.affectedRows === 1 ? true : false;
    }
}

module.exports.updateRatingById = updateRatingById;