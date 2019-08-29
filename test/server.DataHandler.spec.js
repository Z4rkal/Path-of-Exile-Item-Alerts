const chai = require('chai');
const { expect } = require('chai');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);

const DataHandler = require('../server/lib/classes/DataHandler');

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

        const start = new Date().valueOf();
        for (let i = 0; i < 5; i++) {
            await DH.getStashData();
            if (!DH.ready) i--;
        }
        const elapsed = new Date().valueOf() - start;
        console.log(`\x1b[0m%s\x1b[35m%s\x1b[0m%s`, `\n\nParsing all 5 chunks took `, `${elapsed / 1000}`, ` seconds!\n\n`);
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
