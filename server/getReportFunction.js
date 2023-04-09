async function getReport(node1_db, node2_db, node3_db){
    const query = `SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
            START TRANSACTION;
            WITH subquery1 as (SELECT \`year\`, MAX(rating) as rating FROM movies GROUP BY \`year\`)
            SELECT m.\`year\`, m.\`name\`, m.rating FROM movies m JOIN subquery1 s ON  m.\`year\`=s.\`year\` AND m.rating=s.rating ORDER BY m.\`year\` DESC;
            DO SLEEP(1);
            WITH subquery1 as (SELECT \`year\`, MAX(rating) as rating FROM movies GROUP BY \`year\`)
            SELECT m.\`year\`, m.\`name\`, m.rating FROM movies m JOIN subquery1 s ON  m.\`year\`=s.\`year\` AND m.rating=s.rating ORDER BY m.\`year\` DESC;
            COMMIT;`;

    try {
        const response = await new Promise((resolve, reject) => {
            node1_db.query(query, (err, results) => {
                if(err) reject(new Error(err.message));
                resolve(results);
            });
        });
        
        return response[4];

    } 
    catch (err){
        console.log("getReportFunction: Central node is unavailable");

        const getRecordsFromNode2 = await new Promise((resolve, reject) => {
            node2_db.query(query, (err, results) => {
                if(err) reject(new Error(err.message));
                resolve(results[4]);
            });
        });

        const getRecordsFromNode3 = await new Promise((resolve, reject) => {
            node3_db.query(query, (err, results) => {
                if(err) reject(new Error(err.message));
                resolve(results[4]);
            });
        });

        const response = getRecordsFromNode3.concat(getRecordsFromNode2)
        return response;
    }
}

module.exports.getReport = getReport;