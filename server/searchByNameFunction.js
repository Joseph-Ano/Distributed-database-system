async function searchByName(name, year, connection1, connection2, connection3){
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
            console.log("searchByNameFunction: Node 2 is unavailable for search");
            response = await new Promise((resolve, reject) => {
                connection1.query(query, [name, year], (err, results) => {
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
            console.log("searchByNameFunction: Node 3 is unavailable for search");
            response = await new Promise((resolve, reject) => {
                connection1.query(query, [name, year], (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results);
                });
            });
        }
        return response[4];
    } 
}

module.exports.searchByName = searchByName;