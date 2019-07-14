const express = require('express');
const morgan = require('morgan');
const DataHandler = require('./lib/DataHandler');
const getCurrencyData = require('./lib/getCurrencyData');

const app = express();

app.use(morgan('dev'));

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

app.get('/api/league', (req, res) => {
    res.send(Data.getLeague);
});

app.get('/api/cdata', (req, res) => {
    res.send(Data.getCData);
});

app.post('/api/search', (req, res) => {
    try {
        Data.setWatch = decodeURI(/id\=([^\&]+)/.exec(req.url)[1]);
        res.status(200).send(`Received request to begin searching for '${Data.getWatch}'`);
    }
    catch (err) {
        console.log(`Invalid post at from ${req.url}`);
    }
    //console.log(/id\=([^\&]+)/.exec(req.url));
})

app.get('.*', (req, res) => {
    res.status(404).send('404: Resource not found.');
});

module.exports = app;