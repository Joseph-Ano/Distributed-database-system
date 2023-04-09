const mysql = require("mysql");
const dotenv = require('dotenv');
const {getAllData} = require("./getAllFunction.js")
const {insertRecord} = require("./insertRecordFunction.js")
const {searchByName} = require("./searchByNameFunction.js")
const {deleteRowById} = require("./deleteRowByIdFunction.js")
const {updateRatingById} = require("./updateRatingByIdFunction.js")
const {getReport} = require("./getReportFunction.js")
const {perform_recovery} = require("./performRecoveryFunction.js")
let instance = null;
dotenv.config();

const node1_db = mysql.createConnection({
    host: process.env.HOST1,
    user: process.env.USER1,
    password: process.env.PASSWORD1,
    database: process.env.DATABASE1,
    port: process.env.DB_PORT1,
    multipleStatements: true
})

const node2_db = mysql.createConnection({
    host: process.env.HOST2,
    user: process.env.USER2,
    password: process.env.PASSWORD2,
    database: process.env.DATABASE2,
    port: process.env.DB_PORT2,
    multipleStatements: true
})

const node3_db = mysql.createConnection({
    host: process.env.HOST3,
    user: process.env.USER3,
    password: process.env.PASSWORD3,
    database: process.env.DATABASE3,
    port: process.env.DB_PORT3,
    multipleStatements: true
})

const node1_recovery = mysql.createConnection({
    host: process.env.RECOVERY_HOST1,
    user: process.env.RECOVERY_USER1,
    password: process.env.RECOVERY_PASSWORD1,
    database: process.env.RECOVERY_DATABASE1,
    port: process.env.RECOVERY_DB_PORT1,
    multipleStatements: true
})

const node2_recovery = mysql.createConnection({
    host: process.env.RECOVERY_HOST2,
    user: process.env.RECOVERY_USER2,
    password: process.env.RECOVERY_PASSWORD2,
    database: process.env.RECOVERY_DATABASE2,
    port: process.env.RECOVERY_DB_PORT2,
    multipleStatements: true
})

const node3_recovery = mysql.createConnection({
    host: process.env.RECOVERY_HOST3,
    user: process.env.RECOVERY_USER3,
    password: process.env.RECOVERY_PASSWORD3,
    database: process.env.RECOVERY_DATABASE3,
    port: process.env.RECOVERY_DB_PORT3,
    multipleStatements: true
})

node1_db.connect((err) => {
    if(err){
        console.log(err.message);
    }
    
    console.log('node1_db ' + node1_db.state);
})

node2_db.connect((err) => {
    if(err){
        console.log(err.message);
    }
    
    console.log('node2_db ' + node2_db.state);
})

node3_db.connect((err) => {
    if(err){
        console.log(err.message);
    }
    
    console.log('node3_db ' + node3_db.state);
})

node1_recovery.connect((err) => {
    if(err){
        console.log(err.message);
    }
    
    console.log('node1_recovery ' + node1_recovery.state);
})

node2_recovery.connect((err) => {
    if(err){
        console.log(err.message);
    }
    
    console.log('node2_recovery ' + node2_recovery.state);
})

node3_recovery.connect((err) => {
    if(err){
        console.log(err.message);
    }
    console.log('node3_recovery ' + node3_recovery.state);
})

 class DbService {
    static getDbServiceInstance(){
        return instance ? instance : new DbService();
    }

    async getAllData(){
        return getAllData(node1_db, node2_db, node3_db);
    }

    async insertRecord(id, name, year, rating){
        return insertRecord(id, name, year, rating, node1_db, node2_db, node3_db, node1_recovery, node2_recovery, node3_recovery);
    }

    async deleteRowById(id){
        return deleteRowById(id, node1_db, node2_db, node3_db);
    }

    async updateRatingById(id, rating){
        return updateRatingById(id, rating, node1_db, node2_db, node3_db, node1_recovery, node2_recovery, node3_recovery);
    }

    async searchByName(name, year){
        return searchByName(name, year, node1_db, node2_db, node3_db);
    }

    async getReport(){
        return getReport(node1_db, node2_db, node3_db);
    }

    async perform_recovery(db){
        perform_recovery(db, node1_db, node2_db, node3_db, node1_recovery, node2_recovery, node3_recovery)
    }
 }

 module.exports = DbService;