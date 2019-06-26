const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const DataHandler = require('./DataHandler');

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());

app.use(express.static('dist'));
app.use(express.static('public'));

const Data = new DataHandler();
Data.spinUp();

app.get('/api/all', (req, res) => {
    res.send(Data.getAllData);
});

app.get('/api/cur', (req, res) => {
    res.send(Data.getData);
});

app.post('/api/search', (req, res) => {
    try {
        Data.setWatch = decodeURI(/id\=([^\&]+)/.exec(req.url)[1]);
        res.status(200).send(`Received request to begin searching for '${Data.getWatch}'`);
    }
    catch {
        console.log(`Invalid post at from ${req.url}`);
    }
    //console.log(/id\=([^\&]+)/.exec(req.url));
})

app.get('.*', (req, res) => {
    res.status(404).send('404: Resource not found.');
});

module.exports = app;