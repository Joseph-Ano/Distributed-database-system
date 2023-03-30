const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const path = require("path");
dotenv.config();

const dbService = require('./dbService');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
let oneStepBack=path.join(__dirname,'../');
app.use(express.static(path.join(oneStepBack + "./client")));

app.get('/', (req, res) => {
    let oneStepBack=path.join(__dirname,'../');
    res.sendFile(path.resolve(oneStepBack + "./client/index.html"));
})


//create
app.post('/insert', (req, res) => {
    const { name, year, rating } = req.body
    const db = dbService.getDbServiceInstance();

    const result = db.insertRecord(name, year, rating);

    result.then(data => res.json({data: data}))
    .catch(err => console.log(err));
});

//read
app.get('/getAll', (req, res) => {
    const db = dbService.getDbServiceInstance();

    const result = db.getAllData();

    result.then(data => res.json({data: data}))
    .catch(err => console.log(err));
});

//update
app.patch('/update', (req, res) =>{
    const {id, name} = req.body;
    const db = dbService.getDbServiceInstance();

    const result = db.updateNameById(id, name);

    result.then(data => res.json({success: data}))
    .catch(err => console.log(err));

})

//delete
app.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    const db = dbService.getDbServiceInstance();

    const result = db.deleteRowById(id);

    result.then(data => res.json({success: data}))
    .catch(err => console.log(err));
})  

//search
app.get('/search/:name', (req, res) => {
    const {name} = req.params;
    const db = dbService.getDbServiceInstance();

    const result = db.searchByName(name);

    result.then(data => res.json({data: data}))
    .catch(err => console.log(err));

})

app.listen(process.env.PORT, () => {
    console.log("app is running...");
});