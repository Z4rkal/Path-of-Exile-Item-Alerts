const chai = require('chai');
const { expect } = require('chai');
const sinon = require("sinon");
const sinonChai = require("sinon-chai");

const extractPrice = require('../server/lib/functions/extractPrice');
const formatPrice = require('../server/lib/functions/formatPrice');
const calculateRawValue = require('../server/lib/functions/calculateRawValue');
const getCurrencyData = require('../server/lib/functions/getCurrencyData');
const DataHandler = require('../server/lib/classes/DataHandler');

const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

const cData = require('./lib/cData');
const rawCData = require('./lib/rawCData');
const leagueData = require('./lib/leagueData');
const testId = require('./lib/testId');
const stashData1 = require('./lib/stashData1');
const stashData2 = require('./lib/stashData2');
const stashData3 = require('./lib/stashData3');
const stashData4 = require('./lib/stashData4');
const stashData5 = require('./lib/stashData5');
const md1 = require('./lib/mockStash1');
const md2 = require('./lib/mockStash2');
const md3 = require('./lib/mockStash3');
const md4 = require('./lib/mockStash4');
const md5 = require('./lib/mockStash5');
const md6 = require('./lib/mockStash6');
const md7 = require('./lib/mockStash7');
const md8 = require('./lib/mockStash8');
const md9 = require('./lib/mockStash9');
const md10 = require('./lib/mockStash10');

chai.use(sinonChai);

const mock = new MockAdapter(axios);

mock
    .onGet('https://api.poe.watch/get?category=currency&league=Legion')
    .reply(200, rawCData)

mock
    .onGet('https://api.pathofexile.com/leagues?type=main&offset=4&compact=1&limit=1')
    .reply(200, leagueData)
    .onGet('https://api.poe.watch/id')
    .reply(200, testId);

//Mocks for the 5 chunks of actual data from the GGG API
mock
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=447010774-463577235-436918901-500591518-475195838')
    .reply(200, stashData1)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=447010817-463577289-436918925-500591543-475195882')
    .reply(200, stashData2)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=447010848-463577326-436918960-500591589-475195909')
    .reply(200, stashData3)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=447010903-463577356-436918984-500591644-475195931')
    .reply(200, stashData4)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=447010944-463577396-436919033-500591682-475195991')
    .reply(200, stashData5)
    //This one is to handle the next change id of chunk 5 just in case it gets called somehow
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=447010984-463577428-436919073-500591734-475196036')
    .reply(500, 'All done :)');

//Mocks for the 10 chunks of mock stash data to test removing items and adding new items to tabs
mock
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=mock-1')
    .reply(200, md1)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=mock-2')
    .reply(200, md2)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=mock-3')
    .reply(200, md3)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=mock-4')
    .reply(200, md4)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=mock-5')
    .reply(200, md5)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=mock-6')
    .reply(200, md6)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=mock-7')
    .reply(200, md7)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=mock-8')
    .reply(200, md8)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=mock-9')
    .reply(200, md9)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=mock-10')
    .reply(200, md10)
    .onGet('https://www.pathofexile.com/api/public-stash-tabs?id=all-done')
    .reply(500, 'All done :)');

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

let DH = null;

describe('DataHandler Class with simple name searching', () => {

    beforeEach(async () => {
        DH = new DataHandler();
        //We won't spin up for these tests
    });

    it('The class should be able to fetch the current league', async () => {
        await DH.fetchCurrentLeague()
        expect(DH.getLeague).to.equal('Legion');
    });

    it('The class should have a setter and getter for the \'watchFor\' attribute, and both should work properly', () => {
        expect(DH.setWatch = { name: 'Voidfletcher' }).to.be.ok;
        expect(DH.getWatch.toString()).to.equal('function anonymous(item,compareToMinMax,extractModValue\n) {\nlet i;\ntry {\n\tif(!/^Voidfletcher$/i.test(item.name)) return false;\n} catch(error) {\n\tconsole.log(\'!!!!!!!!!!\');\n\tconsole.log(`Param: name, Element: Voidfletcher`);\n\tconsole.log(`Error: ${JSON.stringify(error)}`);\n\treturn false;\n}\n\nreturn true;\n}');
    });

    it('The class should get the nextChangeId from api.poe.watch/id when a watchFor is set', async () => {
        await DH.fetchFreshId();
        expect(DH.getId).to.equal('447010774-463577235-436918901-500591518-475195838');
    });

    it('The class should be able to parse stash data from GGG\'s API and find the 4 \'Kaom\'s Sign\' listings in the first chunk of test data', async () => {
        DH.setWatch = { name: 'Kaom\'s Sign' };
        await DH.fetchFreshId();

        await DH.getStashData();
        expect(DH.getId).to.equal('447010817-463577289-436918925-500591543-475195882');
        expect(Object.entries(DH.stashTabs).length).to.equal(4);
        expect(Object.entries(Object.entries(DH.stashTabs)[0][1].matches)[0][1].name).to.equal('Kaom\'s Sign');
    });

    it('The class should be able to parse all 5 chunks of test data in a row, the Voidfletchers it finds should be added to the nextData attribute', async () => {
        DH.setWatch = { name: 'Voidfletcher' };
        await DH.fetchFreshId();

        for (let i = 0; i < 5; i++) {
            await DH.getStashData();
            if (!DH.ready) i--;
        }
        expect(DH.getId).to.equal('447010984-463577428-436919073-500591734-475196036');
        expect(Object.entries(DH.stashTabs).length).to.not.equal(0);
        expect(Object.entries(Object.entries(DH.stashTabs)[0][1].matches)[0][1].name).to.equal('Voidfletcher');
        expect(DH.nextData.added[0].item.name).to.equal('Voidfletcher');
        expect(DH.nextData.added.length).to.equal(Object.entries(DH.stashTabs).length);
    });

    it('The class should be able to handle modifications to previously parsed tabs correctly', async () => {
        DH.setId = 'mock-1';
        DH.setWatch = { name: 'Voidfletcher' };

        await DH.getStashData();
        let i = false;
        while (!i) i = DH.ready; //Wait until the data is done being parsed
        expect(DH.getId).to.equal('mock-2');

        expect(Object.entries(DH.stashTabs).length).to.equal(2);
        expect(Object.entries(Object.entries(DH.stashTabs)[0][1].matches)[0][1].id).to.equal('c8895eb54aa00e5d278583b2e0916bb5902903b7f5946f23ef6e19dea1043f08');

        //Get rid of the time the items were parsed so that we can compare the state of DH.stashTabs to its state after the next chunk of data is parsed
        const initialStashes = JSON.stringify(Object.entries(DH.stashTabs).map(([, tab]) => {
            Object.entries(tab.matches).map(([, item]) => {
                item.time = null;
                return item;
            });
            return tab;
        }));

        await DH.getStashData();
        i = false;
        while (!i) i = DH.ready; //Wait until the data is done being parsed
        expect(DH.getId).to.equal('mock-3');

        const updatedTabs = JSON.stringify(Object.entries(DH.stashTabs).map(([, tab]) => {
            Object.entries(tab.matches).map(([, item]) => {
                item.time = null;
                return item;
            });
            return tab;
        }));

        expect(updatedTabs).to.equal(initialStashes); //Should be no change so check that everything is the same

        await DH.getStashData();
        i = false;
        while (!i) i = DH.ready; //Wait until the data is done being parsed
        expect(DH.getId).to.equal('mock-4');

        expect(Object.entries(DH.stashTabs).length).to.equal(1);
        expect(Object.entries(DH.stashTabs)[1]).to.be.undefined;
        expect(Object.entries(Object.entries(DH.stashTabs)[0][1].matches)[1][1].id).to.equal('c8895eb54aa00e5d278583b2e0916bb5902903b7f5946f23ef6e19dea104346e');

        expect(DH.nextData.removed.length).to.equal(0);
        expect(DH.nextData.added.length).to.equal(2);

        await DH.getStashData();
        i = false;
        while (!i) i = DH.ready; //Wait until the data is done being parsed
        expect(DH.getId).to.equal('mock-5');

        expect(Object.entries(DH.stashTabs).length).to.equal(2);
        expect(Object.entries(DH.stashTabs).reduce((a, [, tab]) => {
            return a + Object.entries(tab.matches).length;
        }, 0)).to.equal(4);

        await DH.getStashData();
        i = false;
        while (!i) i = DH.ready; //Wait until the data is done being parsed
        expect(DH.getId).to.equal('mock-6');

        expect(Object.entries(DH.stashTabs).length).to.equal(0);
        expect(DH.nextData.added.length).to.equal(0);
        expect(DH.nextData.removed.length).to.equal(0);

        //TODO: Write the last 4 parts of this test
    });
});