async function getAllData(node1_db, node2_db, node3_db){
    const query = "SELECT * FROM movies;"
    try {
        const response = await new Promise((resolve, reject) => {
            node1_db.query(query, (err, results) => {
                if(err) reject(new Error(err.message));
                else resolve(results);
            });
        });
        
        return response;
    } 
    catch (err){
        console.log("getAllFunction: Central node is unavailable");

        const getAllRecordsInNode2 = await new Promise((resolve, reject) => {
            node2_db.query(query, (err, results) => {
                if(err) reject(new Error(err.message));
                else resolve(results);
            });
        });

        const getAllRecordsInNode3 = await new Promise((resolve, reject) => {
            node3_db.query(query, (err, results) => {
                if(err) reject(new Error(err.message));
                else resolve(results);
            });
        });

        const response = getAllRecordsInNode3.concat(getAllRecordsInNode2)

        return response
    }
}

module.exports.getAllData = getAllData;