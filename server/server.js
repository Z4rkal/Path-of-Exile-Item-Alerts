const express = require('express');
const morgan = require('morgan');
const DataHandler = require('./lib/DataHandler');
const getCurrencyData = require('./lib/getCurrencyData');
const { json } = require('body-parser')

const app = express();

app.use(morgan('dev'));
app.use(json());

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

app.get('/api/numparsed', (req, res) => {
    res.send(`${Data.getNumParsed}`);
})

app.get('/api/league', (req, res) => {
    res.send(Data.getLeague);
});

app.get('/api/cdata', (req, res) => {
    res.send(Data.getCData);
});

app.post('/api/search', (req, res) => {
    let resStatus, resMessage;

    try {
        //Data.setWatch = decodeURI(/id\=([^\&]+)/.exec(req.url)[1]);
        console.log(req.body);
        Data.setWatch = req.body;
        resStatus = 200;
        resMessage = `Received request to begin searching for '${JSON.stringify(req.body)}'`;
    }
    catch (err) {
        console.log(`Invalid post at /api/search from ${req.url}`);
        resStatus = 422;
        resMessage = 'Bad search parameters';
    }

    res.status(resStatus).send(resMessage);
    //console.log(/id\=([^\&]+)/.exec(req.url));
})

app.get('*', (req, res) => {
    res.status(404).send('404: Resource not found.');
});

module.exports = app;