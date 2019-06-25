const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());

app.use(express.static('dist'));
app.use(express.static('public'));

app.get('/api/',(req,res) => {
    axios.get('https://www.pathofexile.com/api/public-stash-tabs')
    .then(response => {res.json(response.data); console.log('Should return data.')});
});

app.get('.*', (req,res) => {
    res.status(404).send('404: Resource not found.');
});

module.exports = app;