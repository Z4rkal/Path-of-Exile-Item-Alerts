const axios = require('axios');
const formatPrice = require('./formatPrice');
const getCurrencyData = require('./getCurrencyData');
const calculateRawValue = require('./calculateRawValue');

//This class will handle all of the item and currency data for the server
class DataHandler {
    constructor() {
        this.ready = true;
        this.league = null;
        this.refreshRate = 1000 * 1; //1 second between checking if we're ready to get the next chunk of stash tabs
        this.watchFor = null;

        this.stashTabs = {};
        this.nextChangeId = null;
        this.nextData = { added: [], removed: [] };

        this.cData = 'No currency data :(';

        this.fetchCurrentLeague().then(resolve => this.handleCurrencyData());
    }

    get getAllData() {
        if (Object.entries(this.stashTabs).length != 0) return this.stashTabs;
        return 'No data at the moment :(';
    }

    get getData() {
        let toSend = this.nextData;
        this.nextData = { added: [], removed: [] };
        return toSend;
    }

    set setLeague(league) {
        this.league = league;
        console.log(`The current league is ${this.league}`);
    }

    get getLeague() {
        return this.league;
    }

    set setId(Id) {
        this.nextChangeId = Id;
        console.log(`The next change ID is: ${this.nextChangeId}`);
    }

    set setWatch(params) {
        this.watchFor = params;
        this.nextData = { added: [], removed: [] };
        this.stashTabs = {};

        if (this.nextChangeId == null)
            return this.getFreshId();
    }

    get getWatch() {
        if (this.watchFor != null)
            return this.watchFor;
        return 'Not currently searching for anything :(';
    }

    get getCData() {
        return this.cData;
    }

    get getId() {
        if (this.nextChangeId != null)
            return this.nextChangeId;
        return 'The next Id hasn\'t been set yet';
    }

    //Method Prototypes
    fetchCurrentLeague() {
        return axios.get('https://api.pathofexile.com/leagues?type=main&offset=4&compact=1&limit=1')
            .then(response => this.setLeague = response.data[0].id, error => console.log('Failed to get the current league'));
    }

    async handleCurrencyData() {

        if (this.league == null) {
            this.cData = 'No currency data :(';
        }
        else {
            //Get the initial currency data from api.poe.watch
            this.cData = await getCurrencyData(this.league);

            //Update every 12 hours
            setInterval(async () => {
                let nData;
                nData = await getCurrencyData(this.league);
                if (nData != 'No Currency Data :(') this.cData = nData;
            }, 1000 * 60 * 60 * 12);
        }
    }

    getFreshId() {
        return axios.get('https://api.poe.watch/id')
            .then(response => this.setId = response.data.id, error => console.log('Failed to get the current chunk id from poe.watch'));
    }

    spinUp() {
        setInterval(() => this.getStashData(), this.refreshRate);
    }

    getStashData() {
        if (this.ready && this.watchFor != null && this.nextChangeId != null) {
            this.ready = false;
            console.log(`Making GET request to ${`https://www.pathofexile.com/api/public-stash-tabs?id=${this.nextChangeId}`}`);
            return axios.get(`https://www.pathofexile.com/api/public-stash-tabs?id=${this.nextChangeId}`)
                .then(response => this.ready = this.parseNewData(response.data), error => { console.log('Failed to get stash data'); this.ready = true; });
        }
    }

    parseNewData(data) {
        console.log(`Next change ID: ${data.next_change_id}`);
        if (this.nextChangeId == null || this.nextChangeId != data.next_change_id) {
            this.nextChangeId = data.next_change_id;
            if (this.watchFor != null) {
                data.stashes.forEach((element) => {
                    if (element.public && element.league == this.league) {
                        if (this.stashTabs[element.id] == undefined)
                            this.parseNewTab(element);
                        else
                            this.parseUpdatedTab(element);
                    }
                });
            }
        }
        return true;
    }

    //Currently this function and parseUpdatedTab are matching items by name, TODO: Update them to handle more advanced search parameters once the front end can send back more than an item name
    parseNewTab(tab) {
        let newTab = { id: tab.id, owner: tab.accountName, lastChar: tab.lastCharacterName, stashName: tab.stash, matches: {} }
        tab.items.forEach((element) => {
            if (element.name == this.watchFor) {
                newTab.matches[element.id] = {
                    id: element.id,
                    name: element.name,
                    icon: element.icon,
                    ilvl: element.ilvl,
                    corrupted: element.corrupted != undefined ? element.corrupted : false,
                    modifiers: { implicit: element.implicitMods, explicit: element.explicitMods, crafted: element.craftedMods },
                    position: [element.x, element.y],
                    note: element.note != undefined ? formatPrice(element.note) : 'Price: N/A',
                    time: new Date().getTime(),
                    chaos: element.note != undefined ? calculateRawValue(element.note, this.cData) : 'N/A'
                }
                this.pushToNext({ id: element.id, stashId: newTab.id, acct: newTab.owner, char: newTab.lastChar, stashName: newTab.stashName, item: newTab.matches[element.id] }, 'add');
            }
        })
        if (Object.entries(newTab.matches).length != 0 && Object.entries(this.stashTabs).length < 50)
            this.stashTabs[tab.id] = newTab;
        else if (Object.entries(this.stashTabs).length == 50) {
            delete this.stashTabs[Object.entries(this.stashTabs)[0][1].id]; // = undefined;
            this.stashTabs[tab.id] = newTab;
        }
    }

    parseUpdatedTab(tab) {
        let curTab = this.stashTabs[tab.id];
        const oldItems = curTab.matches;
        curTab.matches = {};

        tab.items.forEach((element) => {
            if (element.name == this.watchFor) {
                curTab.matches[element.id] = {
                    id: element.id,
                    name: element.name,
                    icon: element.icon,
                    ilvl: element.ilvl,
                    corrupted: element.corrupted != undefined ? element.corrupted : false,
                    modifiers: { implicit: element.implicitMods, explicit: element.explicitMods, crafted: element.craftedMods },
                    position: [element.x, element.y],
                    note: element.note != undefined ? formatPrice(element.note) : 'Price: N/A',
                    time: new Date().getTime(),
                    chaos: element.note != undefined ? calculateRawValue(element.note, this.cData) : 'N/A'
                }
                if (oldItems[element.id] == undefined)
                    this.pushToNext({ id: element.id, stashId: curTab.id, acct: curTab.owner, char: curTab.lastChar, stashName: curTab.stashName, item: curTab.matches[element.id] }, 'add');
            }
        })

        Object.entries(oldItems).forEach(([, element]) => {
            if (curTab.matches[element.id] == undefined) 
                this.pushToNext({ id: element.id, stashId: curTab.id, acct: curTab.owner, char: curTab.lastChar, stashName: curTab.stashName, item: oldItems[element.id] }, 'remove');
        });

        if (Object.entries(curTab.matches).length != 0)
            this.stashTabs[tab.id] = curTab;
        else
            delete this.stashTabs[tab.id]; // = undefined;
    }

    pushToNext(item, option) {
        let i;
        switch (option) {
            case 'add':
                i = this.nextData.removed.findIndex((el) => el.id == item.id && el.stashId == item.stashId);
                i != -1 ? this.nextData.removed.splice(i,1) :
                this.nextData.added.push(item);
                break;
            case 'remove':
                i = this.nextData.added.findIndex((el) => el.id == item.id && el.stashId == item.stashId);
                i != -1 ? this.nextData.added.splice(i,1) :
                this.nextData.removed.push(item);
                break;
            default:
                throw 'Heckin busted';
        }
    }
}

module.exports = DataHandler;