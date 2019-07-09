const chai = require('chai');
const { expect } = require('chai');
const extractPrice = require('../server/lib/extractPrice');
const formatPrice = require('../server/lib/formatPrice');
const DataHandler = require('../server/lib/DataHandler');

describe('extractPrice Function', () => {
    
    it('The function should correctly extract the number and type of currency from an item\'s note', () => {
        expect(extractPrice('~b\\\/o 55 chaos')).to.equal('55 Chaos');
    });

    it('The function should throw when the input is invalid', () => {
        expect(extractPrice.bind(extractPrice,'55 cheetos')).to.throw(/Error/);
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

// let Data = null;

// TODO: Write tests for the DataHandler Class
// describe('DataHandler Class', () => {

//     beforeEach(() => {
//         Data = new DataHandler();
//     })

// });
