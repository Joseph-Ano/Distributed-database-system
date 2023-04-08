async function deleteRowById(id, connection1, connection2, connection3){
    try{
        id = parseInt(id, 10);

        const year = await new Promise((resolve, reject) => {
            const queryYear = "SELECT * FROM movies WHERE id = ?";

            connection1.query(queryYear, [id], (err, results) => {
                if(err) reject(new Error(err.message));
                resolve(results);
            });
        });

        const query = "DELETE FROM movies WHERE id = ?; ALTER TABLE movies AUTO_INCREMENT = 1;";

        const response = await new Promise((resolve, reject) => {
            connection1.query(query, [id], (err, results) => {
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

module.exports.deleteRowById = deleteRowById;