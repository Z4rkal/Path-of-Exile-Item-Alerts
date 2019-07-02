const axios = require('axios');

class DataHandler {
    constructor() {
        this.ready = true;
        this.league = null;
        this.refreshRate = 1000 * 1; //1 second between checking if we're ready to get the next chunk of stash tabs
        this.watchFor = null;

        this.stashTabs = {};
        this.stashesToParse = null;
        this.nextChangeId = null;
        this.nextData = { added: [], removed: [] };

        this.fetchCurrentLeague();
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

        this.getFreshId();
    }

    get getWatch() {
        if (this.watchFor != null)
            return this.watchFor;
        return 'Not currently searching for anything :(';
    }

    //Method Prototypes
    fetchCurrentLeague() {
        axios.get('https://api.pathofexile.com/leagues?type=main&offset=4&compact=1&limit=1')
            .then(response => this.setLeague = response.data[0].id, error => console.log(error));
    }

    getFreshId() {
        axios.get('https://api.poe.watch/id')
            .then(response => this.setId = response.data.id, error => console.log(error));
    }

    spinUp() {
        setInterval(() => this.getStashData(this.nextChangeId), this.refreshRate);
    }

    getStashData(nextChangeId) {
        if (this.ready && this.watchFor != null && this.nextChangeId != null) {
            this.ready = false;
            console.log(`Making GET request to ${`https://www.pathofexile.com/api/public-stash-tabs?id=${this.nextChangeId}`}`);
            axios.get(`https://www.pathofexile.com/api/public-stash-tabs?id=${this.nextChangeId}`)
                .then(response => this.ready = this.parseNewData(response.data));
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
                    note: element.note != undefined ? element.note : 'N/A',
                    time: new Date().getTime()
                }
                this.pushToNext({ id: element.id, acct: newTab.owner, char: newTab.lastChar, stashName: newTab.stashName, item: newTab.matches[element.id] }, 'add');
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
        let oldItems = curTab.matches;
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
                    note: element.note != undefined ? element.note : 'N/A',
                    time: new Date().getTime()
                }
                if (oldItems[element.id] == undefined)
                    this.pushToNext({ id: element.id, acct: curTab.owner, char: curTab.lastChar, stashName: curTab.stashName, item: curTab.matches[element.id] }, 'add');
            }

            Object.entries(oldItems).forEach(([, element]) => {
                if (curTab.matches[element.id] == undefined)
                    this.pushToNext({ id: element.id, acct: curTab.owner, char: curTab.lastChar, stashName: curTab.stashName, item: curTab.matches[element.id] }, 'remove');
            })
        })
        if (Object.entries(curTab.matches).length != 0)
            this.stashTabs[tab.id] = curTab;
        else
            delete this.stashTabs[tab.id]; // = undefined;
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