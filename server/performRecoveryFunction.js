async function perform_recovery(db, connection1, connection2, connection3, recovery1, recovery2, recovery3){
    let query = `SELECT * FROM recovery WHERE operation = "insert"`
    let recovery_db = null;
    let actual_db = null;
    let temp = null;

    if(db == "node1"){
        recovery_db = recovery1
        actual_db = connection1
    }
    else if(db == "node2"){
        recovery_db = recovery2
        actual_db = connection2
    }
    else{
        recovery_db = recovery3
        actual_db = connection3
    }
    
    try{
        //CHECK FOR INSERTS
        let response = await new Promise((resolve, reject) => {
            recovery_db.query(query, (err, results) => {
                if(err) reject(new Error(err.message));
                resolve(results);
            });
        });

        query = `INSERT INTO movies (id, name, year, rating) 
            VALUES (?, ?, ?, ? );`

        const insertPromises = response.map(async (element) => {
            try{
                const insertRecord = await new Promise((resolve, reject) => {
                    actual_db.query(query, [element.movie_id, element.name_new_val, element.year_new_val, element.rating_new_val], (err, results) => {
                        if(err) reject(new Error(err.message));
                        else{resolve(console.log("Recovery: Record successfully inserted"))}
                    });
                });

                recovery_db.query("DELETE FROM recovery WHERE id = ?", [element.id], (err, results) => {
                    if(err) console.log(err);
                    else console.log("Recovery: Insert deleted from recovery db");
                });
            }
            catch(err){
                console.log("Recovery: Could not perform insert recovery.")
            }
        }); 
        await Promise.all(insertPromises);
        

        // CHECK FOR COMMITS
        query = `SELECT * FROM recovery WHERE operation = "commit"`
        response = await new Promise((resolve, reject) => {
            recovery_db.query(query, (err, results) => {
                if (err) reject(new Error(err.message));
                resolve(results);
            });
        });

        query = `SELECT * FROM recovery WHERE transaction_no = ?`;

        for (const element of response) {
            const temp = await new Promise((resolve, reject) => {
                recovery_db.query(query, [element.transaction_no], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });

            temp.sort((a, b) => { return a.id - b.id; }); //sort list in ascending order by id

            const updatePromises = temp.map(async (element) => {
                try {
                    const updateRecord = await new Promise((resolve, reject) => {
                        const updateQuery = `UPDATE movies SET rating = ? WHERE id = ?`;
                        actual_db.query(updateQuery, [element.rating_new_val, element.movie_id], (err, results) => {
                            if (err) reject(new Error(err.message));
                            else { resolve(console.log("Recovery: Record successfully updated from recovery.")) }
                        });
                    });

                    recovery_db.query("DELETE FROM recovery WHERE id = ?", [element.id], (err, results) => {
                        if (err) console.log(err);
                        else console.log("Recovery: Update deleted from recovery db");
                    })
                }
                catch (err) {
                    console.log("Recovery: Could not perform update recovery.")
                }
            });

            await Promise.all(updatePromises);
        }

        // CHECK FOR NON-COMMITS
        response = await new Promise((resolve, reject) => {
            recovery_db.query(`SELECT * FROM recovery`, (err, results) => {
                if (err) reject(new Error(err.message));
                resolve(results);
            });
        });

        response.sort((a, b) => {return b.id - a.id;}); //sort list in descending order by id

        const rollBackPromises = response.map(async (element) => {
            query = `UPDATE movies SET rating = ? WHERE id = ?`;
           
            try{
                const rollBackRecord = await new Promise((resolve, reject) => {
                    actual_db.query(query, [element.rating_old_val, element.movie_id], (err, results) => {
                        if(err) reject(new Error(err.message));
                        else{resolve(console.log("Recovery: Successfully rolled back record"))}
                    });
                });

                recovery_db.query("DELETE FROM recovery WHERE id = ?", [element.id], (err, results) => {
                    if(err) console.log(err);
                    else console.log("Recovery: Roll back deleted from recovery db");
                })
            }
            catch(err){
                console.log("Recovery: Could not perform roll back recovery.")
            }

            await Promise.all(rollBackPromises);
        }); 
    }
    catch(err){
        console.log(err)
    }
}

module.exports.perform_recovery = perform_recovery;