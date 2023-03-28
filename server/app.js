const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//create
app.post('/insert', (req, res) => {

});

//read
app.get('/getAll', (req, res) => {
    res.json({
        success: true
    });
});

//update


//delete

app.listen(process.env.PORT, () => {
    console.log("app is running...");
});