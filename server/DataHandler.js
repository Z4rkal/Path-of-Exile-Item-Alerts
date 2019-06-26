const axios = require('axios');

class DataHandler {
    constructor() {
        this.ready = true;
        this.league = null;
        this.refreshRate = 1000 * 4; //4 seconds
        this.watchFor = `Voidfletcher`;

        this.stashTabs = {};
        this.stashesToParse = null;
        this.nextChangeId = `423736660-439696015-414223782-475329009-450825155`;
        this.nextData = { added: [], removed: [] };

        this.getLeague();
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

    set setWatch(params) {
        this.watchFor = params;
    }

    getLeague() {
        axios.get('https://api.pathofexile.com/leagues?type=main&offset=4&compact=1&limit=1')
            .then(response => this.setLeague = response.data[0].id);
    }

    //Method Prototypes
    spinUp() {
        setInterval(() => this.getStashData(this.nextChangeId), this.refreshRate);
    }

    getStashData(nextChangeId) {
        if (this.ready) {
            this.ready = false;
            console.log(`Making GET request to ${`https://www.pathofexile.com/api/public-stash-tabs?id=${this.nextChangeId}`}`);
            if (nextChangeId == null) {
                axios.get('https://www.pathofexile.com/api/public-stash-tabs')
                    .then(response => this.ready = this.parseNewData(response.data));
            }
            else {
                axios.get(`https://www.pathofexile.com/api/public-stash-tabs?id=${this.nextChangeId}`)
                    .then(response => this.ready = this.parseNewData(response.data));
            }
        }
    }

    parseNewData(data) {
        //console.log(data);
        console.log(`Next change ID: ${data.next_change_id}`);
        if (this.nextChangeId == null || this.nextChangeId != data.next_change_id) {
            this.nextChangeId = data.next_change_id;
            if (this.watchFor != null) {
                data.stashes.forEach((element) => {
                    if (element.public && element.league == this.league) {
                        if (this.stashTabs == null || this.stashTabs[element.id] == null)
                            this.parseNewTab(element);
                        else
                            this.parseUpdatedTab(element);
                    }
                });
            }
        }
        return true;
    }

    parseNewTab(tab) {
        let newTab = { id: tab.id, owner: tab.accountName, lastChar: tab.lastCharacterName, name: tab.stash, matches: {} }
        tab.items.forEach((element) => {
            if (element.name == this.watchFor) {
                newTab.matches[element.id] = {
                    name: element.name,
                    icon: element.icon,
                    ilvl: element.ilvl,
                    modifiers: { implicit: element.implicitMods, explicit: element.explicitMods },
                    flavour: element.flavourText,
                    note: element.note != undefined ? element.note : 'N/A'
                }
                this.pushToNext({ acct: newTab.owner, char: newTab.lastChar, name: newTab.name, item: newTab.matches[element.id] }, 'add');
            }
        })
        if (Object.entries(newTab.matches).length != 0)
            this.stashTabs[tab.id] = newTab;
    }

    parseUpdatedTab(tab) {
        let curTab = this.stashTabs[tab.id];
        let oldItems = curTab.matches;
        curTab.matches = {};

        tab.items.forEach((element) => {
            if (element.name == this.watchFor) {
                curTab.matches[element.id] = {
                    name: element.name,
                    icon: element.icon,
                    ilvl: element.ilvl,
                    modifiers: { implicit: element.implicitMods, explicit: element.explicitMods },
                    flavour: element.flavourText,
                    note: element.note != undefined ? element.note : 'N/A'
                }
                if (oldItems[element.id] == undefined)
                    this.pushToNext({ acct: curTab.owner, char: curTab.lastChar, name: curTab.name, item: curTab.matches[element.id] }, 'add');
            }

            oldItems.entries.forEach((element) => {
                if (curTab.matches[element.id] == undefined)
                    this.pushToNext({ acct: curTab.owner, char: curTab.lastChar, name: curTab.name, item: curTab.matches[element.id] }, 'remove');
            })
        })
        if (Object.entries(curTab.matches).length != 0)
            this.stashTabs[tab.id] = curTab;
        else
            this.stashTabs[tab.id] = undefined;
    }

    pushToNext(item, option) {
        switch (option) {
            case 'add':
                this.nextData.added.push(item);
                break;
            case 'remove':
                this.nextData.removed.push(item);
                break;
            default:
                throw 'Heckin busted';
        }
    }
}

module.exports = DataHandler;