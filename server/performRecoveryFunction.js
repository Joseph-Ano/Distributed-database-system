async function perform_recovery(db, connection1, connection2, connection3, recovery1, recovery2, recovery3){
    let query = `SELECT * FROM recovery WHERE operation = "insert"`
    let recovery_db = null;
    let actual_db = null;

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
    catch(err){}
}

module.exports.perform_recovery = perform_recovery;