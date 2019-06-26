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

app.get('/api/', (req, res) => {
    res.send(Data.getAllData);
});

app.get('.*', (req, res) => {
    res.status(404).send('404: Resource not found.');
});

module.exports = app;