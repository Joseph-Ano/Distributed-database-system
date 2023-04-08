async function insertRecord(id, name, year, rating, connection1, connection2, connection3, recovery1, recovery2, recovery3){
    const query = "INSERT INTO movies (id, name, year, rating) VALUES (?, ?, ?, ?);";
    const recovery_query = `INSERT INTO recovery (transaction_no, movie_id, operation, name_old_val, 
        name_new_val, year_old_val, year_new_val, rating_old_val, rating_new_val) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`
    const transaction_no = Math.floor(Math.random() * 100);

    try {
        const insertId = await new Promise((resolve, reject) => {
            connection1.query(query, [id, name, year, rating], (err, results) => {
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
                console.log("insertRecordFunction: node 2 is unavailable. Unable to insert record in node 2");
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
                console.log("insertRecordFunction: node 3 is unavailable. Unable to insert record in node 3");
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
        console.log("insertRecordFunction: Central node is unavailable. Unable to insert record in central node");
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

module.exports.insertRecord = insertRecord;