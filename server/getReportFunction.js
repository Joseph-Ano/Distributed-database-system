async function getReport(connection1, connection2, connection3){
    const query = `SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
            START TRANSACTION;
            WITH subquery1 as (SELECT \`year\`, MAX(rating) as rating FROM movies GROUP BY \`year\`)
            SELECT m.\`year\`, m.\`name\`, m.rating FROM movies m JOIN subquery1 s ON  m.\`year\`=s.\`year\` AND m.rating=s.rating ORDER BY m.\`year\` DESC;
            DO SLEEP(5);
            WITH subquery1 as (SELECT \`year\`, MAX(rating) as rating FROM movies GROUP BY \`year\`)
            SELECT m.\`year\`, m.\`name\`, m.rating FROM movies m JOIN subquery1 s ON  m.\`year\`=s.\`year\` AND m.rating=s.rating ORDER BY m.\`year\` DESC;
            COMMIT;`;
    let response = null;

    try {
        response = await new Promise((resolve, reject) => {
            connection1.query(query, (err, results) => {
                if(err) reject(new Error(err.message));
                resolve(results);
            });
        });
        
        return response[4];

    } catch (err){
        console.log("getReportFunction: Central node is unavailable");
        const node2 = await new Promise((resolve, reject) => {
            connection2.query(query, (err, results) => {
                if(err) reject(new Error(err.message));
                resolve(results[4]);
            });
        });

        const node3 = await new Promise((resolve, reject) => {
            connection3.query(query, (err, results) => {
                if(err) reject(new Error(err.message));
                resolve(results[4]);
            });
        });

        response = node3.concat(node2)
        return response;
    }
}

module.exports.getReport = getReport;