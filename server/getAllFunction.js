async function getAllData(connection1, connection2, connection3){
    const query = "SELECT * FROM movies;"
    let response = null
    try {
        response = await new Promise((resolve, reject) => {
            connection1.query(query, (err, results) => {
                if(err) reject(new Error(err.message));
                else resolve(results);
            });
        });
        
        return response;
    } catch (err){
        console.log("getAllFunction: Central node is unavailable");
        let node2 = await new Promise((resolve, reject) => {
            connection2.query(query, (err, results) => {
                if(err) reject(new Error(err.message));
                else resolve(results);
            });
        });

        let node3 = await new Promise((resolve, reject) => {
            connection3.query(query, (err, results) => {
                if(err) reject(new Error(err.message));
                else resolve(results);
            });
        });

        response = node3.concat(node2)
        return response
    }
}

module.exports.getAllData = getAllData;