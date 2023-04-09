async function deleteRowById(id, node1_db, node2_db, node3_db){
    try{
        id = parseInt(id, 10);

        const record = await new Promise((resolve, reject) => {
            const queryYear = "SELECT * FROM movies WHERE id = ?";

            node1_db.query(queryYear, [id], (err, results) => {
                if(err) reject(new Error(err.message));
                resolve(results);
            });
        });

        const query = "DELETE FROM movies WHERE id = ?; ALTER TABLE movies AUTO_INCREMENT = 1;";

        const response = await new Promise((resolve, reject) => {
            node1_db.query(query, [id], (err, results) => {
                if(err) reject(new Error(err.message));
                resolve(results[0].affectedRows);
            });
        });

        if(record[0].year < 1980){
            const deleteInNode2  = await new Promise((resolve, reject) => {       
                node2_db.query(query, [id], (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results);
                });
            });
        }

        else{
            const deleteInNode3  = await new Promise((resolve, reject) => {
                node3_db.query(query, [id], (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results);
                });
            });
        }

        return response === 1 ? true : false;
        
    }
    catch(err){
        console.log(err)
        return false;
    }
}

module.exports.deleteRowById = deleteRowById;