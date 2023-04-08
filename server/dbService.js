const mysql = require("mysql");
const dotenv = require('dotenv');
const { response } = require("express");
const {getAllData} = require("./getAllFunction.js")
const {insertRecord} = require("./insertRecordFunction.js")
const {searchByName} = require("./searchByNameFunction.js")
const {deleteRowById} = require("./deleteRowByIdFunction.js")
const {updateRatingById} = require("./updateRatingByIdFunction.js")
const {getReport} = require("./getReportFunction.js")
const {perform_recovery} = require("./performRecoveryFunction.js")
let instance = null;
dotenv.config();

const connection1 = mysql.createConnection({
    host: process.env.HOST1,
    user: process.env.USER1,
    password: process.env.PASSWORD1,
    database: process.env.DATABASE1,
    port: process.env.DB_PORT1,
    multipleStatements: true
})

const connection2 = mysql.createConnection({
    host: process.env.HOST2,
    user: process.env.USER2,
    password: process.env.PASSWORD2,
    database: process.env.DATABASE2,
    port: process.env.DB_PORT2,
    multipleStatements: true
})

const connection3 = mysql.createConnection({
    host: process.env.HOST3,
    user: process.env.USER3,
    password: process.env.PASSWORD3,
    database: process.env.DATABASE3,
    port: process.env.DB_PORT3,
    multipleStatements: true
})

const recovery1 = mysql.createConnection({
    host: process.env.RECOVERY_HOST1,
    user: process.env.RECOVERY_USER1,
    password: process.env.RECOVERY_PASSWORD1,
    database: process.env.RECOVERY_DATABASE1,
    port: process.env.RECOVERY_DB_PORT1,
    multipleStatements: true
})

const recovery2 = mysql.createConnection({
    host: process.env.RECOVERY_HOST2,
    user: process.env.RECOVERY_USER2,
    password: process.env.RECOVERY_PASSWORD2,
    database: process.env.RECOVERY_DATABASE2,
    port: process.env.RECOVERY_DB_PORT2,
    multipleStatements: true
})

const recovery3 = mysql.createConnection({
    host: process.env.RECOVERY_HOST3,
    user: process.env.RECOVERY_USER3,
    password: process.env.RECOVERY_PASSWORD3,
    database: process.env.RECOVERY_DATABASE3,
    port: process.env.RECOVERY_DB_PORT3,
    multipleStatements: true
})

connection1.connect((err) => {
    if(err){
        console.log(err.message);
    }
    
    console.log('db1 ' + connection1.state);
})

connection2.connect((err) => {
    if(err){
        console.log(err.message);
    }
    
    console.log('db2 ' + connection2.state);
})

connection3.connect((err) => {
    if(err){
        console.log(err.message);
    }
    
    console.log('db3 ' + connection3.state);
})

recovery1.connect((err) => {
    if(err){
        console.log(err.message);
    }
    
    console.log('recovery1 ' + recovery1.state);
})

recovery2.connect((err) => {
    if(err){
        console.log(err.message);
    }
    
    console.log('recovery2 ' + recovery2.state);
})

recovery3.connect((err) => {
    if(err){
        console.log(err.message);
    }
    console.log('recovery3 ' + recovery3.state);
})

 class DbService {
    static getDbServiceInstance(){
        return instance ? instance : new DbService();
    }

    async getAllData(){
        return getAllData(connection1, connection2, connection3);
    }

    async insertRecord(id, name, year, rating){
        return insertRecord(id, name, year, rating, connection1, connection2, connection3, recovery1, recovery2, recovery3);
    }

    async deleteRowById(id){
        return deleteRowById(id, connection1, connection2, connection3);
    }

    async updateRatingById(id, rating){
        return updateRatingById(id, rating, connection1, connection2, connection3, recovery1, recovery2, recovery3);
    }

    async searchByName(name, year){
        return searchByName(name, year, connection1, connection2, connection3);
    }

    async getReport(){
        return getReport(connection1, connection2, connection3);
    }

    async perform_recovery(db){
        perform_recovery(db, connection1, connection2, connection3, recovery1, recovery2, recovery3)
    }
 }

 module.exports = DbService;