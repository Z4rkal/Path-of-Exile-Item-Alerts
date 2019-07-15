const chai = require('chai');
const { expect } = require('chai');
const extractPrice = require('../server/lib/extractPrice');
const formatPrice = require('../server/lib/formatPrice');
const calculateRawValue = require('../server/lib/calculateRawValue');
const getCurrencyData = require('../server/lib/getCurrencyData');
const cData = require('./lib/cData');
const rawCData = require('./lib/rawCData');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const DataHandler = require('../server/lib/DataHandler');

describe('extractPrice Function', () => {

    it('The function should correctly extract the number and type of currency from an item\'s note', () => {
        expect(extractPrice('~b\\\/o 55 chaos')).to.equal('55 Chaos');
    });

    it('The function should throw when the input is invalid', () => {
        expect(extractPrice.bind(extractPrice, '55 cheetos')).to.throw(/Error/);
    });

});

describe('formatPrice Function', () => {

    it('The function should correctly recognize a buyout listing', () => {
        expect(formatPrice('~b\\\/o 55 chaos')).to.equal('Fixed price: 55 Chaos');
    });

    it('The function should correctly recognize an asking price listing', () => {
        expect(formatPrice('~price 5 exa')).to.equal('Asking price: 5 Exalted Orbs');
    });

    it('The function should return \'Price: N/A\' for invalid or empty inputs', () => {
        let na = 'Price: N/A'
        expect(formatPrice('~price 4 cookies')).to.equal(na);
        expect(formatPrice('')).to.equal(na);
        expect(formatPrice('Some user note that isn\'t a listing')).to.equal(na);
        expect(formatPrice('Some user note that contains \'price\' that isn\'t a listing')).to.equal(na);
        expect(formatPrice('Some user note that contains \'b\\\/o\' that isn\'t a listing')).to.equal(na);
    });
});

describe('calculateRawValue Function', () => {

    it('The function should return the same value for chaos', () => {
        expect(calculateRawValue('~price 74 chaos', cData)).to.equal(74);
        expect(calculateRawValue('~b\\\/o 146 chaos', cData)).to.equal(146);
    });

    it('The function should return the correct value for exalts', () => {
        expect(calculateRawValue('~b\\\/o 1 exa', cData)).to.equal(170);
        expect(calculateRawValue('~price 7.5 exalt', cData)).to.equal(1275);
    });
});

const mockData = rawCData;

describe('getCurrencyData.js', () => {

    beforeEach(() => {
        const mock = new MockAdapter(axios);
        mock
            .onGet('https://api.poe.watch/get?category=currency&league=legion')
            .reply(200, mockData);
    });

    it('The function should correctly format the currency data it gets from axios', async () => {
        let Data = await getCurrencyData('legion');
        expect(JSON.stringify(Data)).to.equal(JSON.stringify(cData));
    });
});

// let Data = null;

// TODO: Write tests for the DataHandler Class
// describe('DataHandler Class', () => {

//     beforeEach(() => {
//         Data = new DataHandler();
//     })

// });