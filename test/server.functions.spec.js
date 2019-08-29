const { expect } = require('chai');

const extractPrice = require('../server/lib/functions/extractPrice');
const formatPrice = require('../server/lib/functions/formatPrice');
const calculateRawValue = require('../server/lib/functions/calculateRawValue');
const getCurrencyData = require('../server/lib/functions/getCurrencyData');

const cData = require('./lib/cData');

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
        expect(calculateRawValue('Asking price: 74 Chaos', cData)).to.equal(74);
        expect(calculateRawValue('Fixed price: 146 Chaos', cData)).to.equal(146);
    });

    it('The function should return the correct value for exalts', () => {
        expect(calculateRawValue('Fixed price: 1 Exalted Orb', cData)).to.equal(170);
        expect(calculateRawValue('Asking price: 7.5 Exalted Orb', cData)).to.equal(1275);
    });
});

describe('getCurrencyData.js', () => {

    it('The function should correctly format the currency data it gets from axios', async () => {
        let Data = await getCurrencyData('Legion');
        expect(JSON.stringify(Data)).to.equal(JSON.stringify(cData));
    });
});