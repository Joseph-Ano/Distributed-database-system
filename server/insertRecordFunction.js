async function insertRecord(id, name, year, rating, node1_db, node2_db, node3_db, node1_recovery, node2_recovery, node3_recovery){
    const query = "INSERT INTO movies (id, name, year, rating) VALUES (?, ?, ?, ?);";
    const recovery_query = `INSERT INTO recovery (transaction_no, movie_id, operation, name_old_val, 
        name_new_val, year_old_val, year_new_val, rating_old_val, rating_new_val) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`
    const transaction_no = Math.floor(Math.random() * 100);

    try {
        const insertId = await new Promise((resolve, reject) => {
            node1_db.query(query, [id, name, year, rating], (err, results) => {
                if(err) reject(new Error(err.message));
                else resolve(results.insertId);
            });
        });

        if(year < 1980){
            try{
                const insertInNode2 = await new Promise((resolve, reject) => {
                    node2_db.query(query, [id, name, year, rating], (err, results) => {
                        if(err)reject(new Error(err.message));
                        else resolve(results);
                    });
                });
            }
            catch(err){
                console.log("insertRecordFunction: node 2 is unavailable. Unable to insert record in node 2");
                const insertInRecovery2 = await new Promise((resolve, reject) => {
                    node2_recovery.query(recovery_query, [transaction_no, id, "insert", null, name, null, year, null, rating], (err, results) => {
                        if(err) reject(new Error(err.message));
                        else resolve(results);
                    });
                });   
            }
        }
        else{
            try{
                const insertInNode3 = await new Promise((resolve, reject) => {
                    node3_db.query(query, [id, name, year, rating], (err, results) => {
                        if(err) reject(new Error(err.message));
                        else resolve(results);
                    });
                });
            }
            catch(err){
                console.log("insertRecordFunction: node 3 is unavailable. Unable to insert record in node 3");
                const insertInRecovery3 = await new Promise((resolve, reject) => {
                    node3_recovery.query(recovery_query, [transaction_no, id, "insert", null, name, null, year, null, rating], (err, results) => {
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
                node2_db.query(query, [id, name, year, rating], (err, results) => {
                    if(err) reject(new Error(err.message));
                    else resolve(results.insertId);
                });
            });
        }
        else{
            insertId = await new Promise((resolve, reject) => {
                node3_db.query(query, [id, name, year, rating], (err, results) => {
                    if(err) reject(new Error(err.message));
                    else resolve(results);
                });
            });
        }

        const insertInRecovery1 = await new Promise((resolve, reject) => {
            node1_recovery.query(recovery_query, [transaction_no, id, "insert", null, name, null, year, null, rating], (err, results) => {
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