const axios = require('axios');
const formatPrice = require('../functions/formatPrice');
const getCurrencyData = require('../functions/getCurrencyData');
const calculateRawValue = require('../functions/calculateRawValue');
const SearchHandler = require('./SearchHandler');
const extractPropertyValue = require('../functions/extractPropertyValue');
const calculateBaseQuality = require('../functions/calculateBaseQuality');
const calculatePhysDamageAt20Quality = require('../functions/calculatePhysDamageAt20Quality');
const VALID_PROPERTIES = require('../configs/propertyConfigBackend');

//This class will handle all of the item and currency data for the server
class DataHandler {
    constructor() {
        this.searchHandler = new SearchHandler()
        this.ready = true; //Variable for holding off on getting the next chunk of data until we're done parsing this one.
        this.league = null; //The current league
        this.refreshRate = 1000 * 1; //1 second between checking if we're ready to get the next chunk of stash tabs
        this.watchFor = this.searchHandler.getSearchFunc; //The search parameter, will eventually get replaced with a class since right now this only matches item names

        //Stash Data Variables
        this.stashTabs = {}; //Stores every parsed stash tab with matched items
        this.numParsed = 0;
        this.nextChangeId = null; //The Id for the next chunk of data from the stash tab API
        this.nextData = { added: [], removed: [] }; //Stores data for the next time the frontend asks what has changed

        //Variable for holding the currency data from the poe.watch api
        //We need outside help to determine what is worth what since we're not tracking current currency rates ourselves
        this.cData = 'No currency data :(';

        //Fetch the current league from GGG and then get the currency data from poe.watch for the current league
        this.fetchCurrentLeague().then(resolve => this.handleCurrencyData());
    }

    get getAllData() { //Gets all of the stashs we currently have
        if (Object.entries(this.stashTabs).length != 0) return this.stashTabs;
        return 'No data at the moment :(';
    }

    get getData() { //Gets the next set of data and then empties it, this solution only works for a single user
        let toSend = this.nextData;
        this.nextData = { added: [], removed: [] };
        return toSend;
    }

    set setLeague(league) { //Sets the current league
        this.league = league;
        console.log(`The current league is ${this.league}`);
    }

    get getLeague() { //Gets the value of the current league
        return this.league;
    }

    set setId(Id) { //Sets the next change Id
        this.nextChangeId = Id;
        console.log(`The next change ID is: ${this.nextChangeId}`);
    }

    set setWatch(params) { //Sets the search parameters, currently just item name
        this.searchHandler.newParams = params;
        this.watchFor = this.searchHandler.getSearchFunc;
        this.nextData = { added: [], removed: [] };
        this.numParsed = 0;
        this.stashTabs = {}; //Empties out the stash tabs since we're searching for a new item;

        if (this.nextChangeId == null) //Fetch the next chunk Id from poe.watch, but only once so we don't spam their API
            return this.fetchFreshId();
    }

    get getWatch() { //Get the current search value
        if (this.watchFor != null)
            return this.watchFor;
        return 'Not currently searching for anything :(';
    }

    get getCData() { //Get the currency data we got from poe.watch
        return this.cData;
    }

    get getId() { //Get the next chunk Id
        if (this.nextChangeId != null)
            return this.nextChangeId;
        return 'The next Id hasn\'t been set yet';
    }

    get getNumParsed() {
        return this.numParsed;
    }

    //Method Prototypes
    fetchCurrentLeague() { //Returns an axios promise that resolves to setting the current league
        return axios.get('https://api.pathofexile.com/leagues?type=main&offset=4&compact=1&limit=1')
            .then(response => this.setLeague = response.data[0].id, error => console.log('Failed to get the current league'));
    }

    async handleCurrencyData() { //Handles getting the currency data from poe.watch using the getCurrencyData function

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

    fetchFreshId() { //Returns an axios promise that resolves to setting the next chunk Id
        return axios.get('https://api.poe.watch/id')
            .then(response => this.setId = response.data.id, error => console.log('Failed to get the current chunk id from poe.watch'));
    }

    spinUp() { //Sets up an interval for fetching the next chunk of stash data from GGG
        setInterval(() => this.getStashData(), this.refreshRate);
    }

    //If you want a reference for the structure of the data getStashData() is pulling in, you can either go to https://www.pathofexile.com/api/public-stash-tabs
    //Or look at the mock data I wrote in the test/lib folder
    getStashData() { //Fetches the next chunk of stash data and then hands it to the parseNewData method
        if (this.ready && this.watchFor != null && this.nextChangeId != null) {
            this.ready = false;
            console.log(`Making GET request to ${`https://www.pathofexile.com/api/public-stash-tabs?id=${this.nextChangeId}`}`);
            return axios.get(`https://www.pathofexile.com/api/public-stash-tabs?id=${this.nextChangeId}`)
                .then(response => this.ready = this.parseNewData(response.data), error => { console.log('Failed to get stash data'); this.ready = true; });
        }
    }

    parseNewData(data) { //Parses stash tab data passed to it
        console.log('Received data');
        //If the next id in the data is new, then parse the data since it's a new chunk,
        //otherwise we're at the end of the stream and we need to wait for the next chunk
        if (this.nextChangeId == null || this.nextChangeId != data.next_change_id) {
            console.log(`Next change ID: ${data.next_change_id}`);
            this.nextChangeId = data.next_change_id;
            if (this.watchFor != null) { //If we have a search term
                data.stashes.forEach((element) => { //Then go through each stash in the data chunk
                    if (element.public && element.league == this.league) { //And if the stash is public and in the current league
                        this.numParsed++;
                        if (this.stashTabs[element.id] == undefined) //Then check if we don't already have this stash
                            this.parseNewTab(element); //If so, then parse it as a new tab
                        else
                            this.parseUpdatedTab(element); //Otherwise, parse it as a tab update
                    }
                });
            }
        }
        else console.log(`Reached the end of the stream, waiting for new chunk`);
        return true; //Return true so that getStashData can make another request
    }

    //Currently this function and parseUpdatedTab are matching items by name, TODO: Update them to handle more advanced search parameters once the front end can send back more than an item name
    parseNewTab(tab) { //Parses a new stash tab

        const time = new Date().getTime(); //Get the time that the current tab is being parsed.

        //Set up the new tab object by pulling info from the data, matches is where any items that match our search will go
        let newTab = { id: tab.id, owner: tab.accountName, lastChar: tab.lastCharacterName, stashName: tab.stash, matches: {} }
        tab.items.forEach((element) => { //Go through the tab item by item
            if (this.watchFor(element)) { //If an item matches our search (currently just item name)
                const price = element.note != undefined ? formatPrice(element.note) : 'Price: N/A';
                newTab.matches[element.id] = { //Then make a new item object and put it in newTab.matches
                    id: element.id,
                    name: element.name,
                    type: element.typeLine,
                    icon: element.icon, //The ingame sprite
                    ilvl: element.ilvl,
                    corrupted: element.corrupted != undefined ? element.corrupted : false,
                    shaperElder: element.shaper != undefined ? 'shaper' : element.elder != undefined ? 'elder' : false,
                    properties: element.properties ? this.handleItemProperties(element) : undefined,
                    modifiers: { implicit: element.implicitMods, explicit: element.explicitMods, crafted: element.craftedMods },
                    position: [element.x, element.y], //Position in the stash tab
                    note: price, //The price listing
                    time, //The time that the item was parsed
                    chaos: price != 'Price: N/A' ? calculateRawValue(price, this.cData) : 'N/A' //Use calculateRawValue to determine the value in 'chaos orbs' of the listing
                }
                //Push the new item to our this.nextData variable so that it can be sent to the front end
                this.pushToNext({ id: element.id, stashId: newTab.id, acct: newTab.owner, char: newTab.lastChar, stashName: newTab.stashName, item: newTab.matches[element.id] }, 'add');
            }
        })

        //If we had any matches, then add the new tab to this.stashTabs
        if (Object.entries(newTab.matches).length != 0 && Object.entries(this.stashTabs).length < 50)
            this.stashTabs[tab.id] = newTab;
        //Use an arbitrary limit of 50 stash tabs so that we don't eat through our allowed memory on Heroku or Now, way way lower than it could be
        else if (Object.entries(this.stashTabs).length == 50) {
            delete this.stashTabs[Object.entries(this.stashTabs)[0][1].id]; // = undefined;
            this.stashTabs[tab.id] = newTab;
        }
    }

    parseUpdatedTab(tab) { //Parses a returning tab
        let curTab = this.stashTabs[tab.id]; //Get the value of the stash tab as we currently know it in this.stashTabs
        const oldItems = curTab.matches; //Get the old matches
        curTab.matches = {}; //Empty out curTab

        const time = new Date().getTime(); //Get the time that the current tab is being parsed.

        tab.items.forEach((element) => { //Go through the tab item by item
            if (this.watchFor(element)) { //If an item matches our search (currently just item name), then parse it
                if (oldItems[element.id] == undefined) { //If we didn't already know about the item, then handle it like a new item
                    const price = element.note != undefined ? formatPrice(element.note) : 'Price: N/A';
                    curTab.matches[element.id] = { //First make a new item object and put it in curTab.matches
                        id: element.id,
                        name: element.name,
                        type: element.typeLine,
                        icon: element.icon,
                        ilvl: element.ilvl,
                        corrupted: element.corrupted != undefined ? element.corrupted : false,
                        shaperElder: element.shaper != undefined ? 'shaper' : element.elder != undefined ? 'elder' : false,
                        properties: element.properties ? this.handleItemProperties(element) : undefined,
                        modifiers: { implicit: element.implicitMods, explicit: element.explicitMods, crafted: element.craftedMods },
                        position: [element.x, element.y],
                        note: price,
                        time,
                        chaos: price != 'Price: N/A' ? calculateRawValue(price, this.cData) : 'N/A'
                    } //Then push it to this.nextData.added
                    this.pushToNext({ id: element.id, stashId: curTab.id, acct: curTab.owner, char: curTab.lastChar, stashName: curTab.stashName, item: curTab.matches[element.id] }, 'add');
                }
                //Otherwise we already knew about it, so put the old item into curTab.matches
                else { oldItems[element.id].time = time; curTab.matches[element.id] = oldItems[element.id]; }
            }
        })

        //Check through our old matches in the tab
        Object.entries(oldItems).forEach(([, element]) => {
            if (curTab.matches[element.id] == undefined) //If an old item no longer exists, then tell the front end it has been removed
                this.pushToNext({ id: element.id, stashId: curTab.id, acct: curTab.owner, char: curTab.lastChar, stashName: curTab.stashName, item: oldItems[element.id] }, 'remove');
        });

        //If the stash tab isn't empty, then update it in this.stashTabs
        if (Object.entries(curTab.matches).length != 0)
            this.stashTabs[tab.id] = curTab;
        else //Otherwise, the items relevant to our search have been removed so delete the tab in this.stashTabs
            delete this.stashTabs[tab.id]; // = undefined;
    }

    pushToNext(item, option) { //Push items to this.nextData
        let i; //dummy variable for storing the result of our findIndex operation
        switch (option) {
            case 'add':
                //If we're adding, then check that this item wasn't previously thought to be removed this update
                i = this.nextData.removed.findIndex((el) => el.id == item.id && el.stashId == item.stashId);
                //If the item has an index in this.nextData.removed, then it's been re-added to the tab, so take it out of removed
                i != -1 ? this.nextData.removed.splice(i, 1) :
                    this.nextData.added.push(item); //Otherwise, it's a new item, so push it onto this.nextData.added

                //This functionality is to ensure that items don't end up appearing multiple times in the 
                //added and removed stacks if for whatever reason the frontend takes a long time between asking for this.nextData
                break;
            case 'remove': //Do what we did above, but in reverse; i.e. if the item exists in added, then take it out of there
                i = this.nextData.added.findIndex((el) => el.id == item.id && el.stashId == item.stashId);
                i != -1 ? this.nextData.added.splice(i, 1) :
                    this.nextData.removed.push(item); //Otherwise, it's been removed so push it onto this.nextData.removed
                break;
            default: //if this somehow gets called with a bad option, then throw some nonsense
                throw new Error('Heckin busted');
        }
    }

    handleItemProperties(item) {
        const properties = item.properties;
        let parsedPropertiesToSave = [];
        let notablePropValues = {
            damage: {},
            defense: {},
            quality: undefined
        }

        properties.map((property) => {
            if (VALID_PROPERTIES[property.name]) {
                parsedPropertiesToSave.push({ name: property.name, value: extractPropertyValue(property, VALID_PROPERTIES[property.name]) });
                switch (property.name) {
                    case 'Physical Damage':
                        notablePropValues.damage.rawPhys = property.values[0][0];
                        notablePropValues.damage.phys = parsedPropertiesToSave[parsedPropertiesToSave.length - 1].value;
                        break;
                    case 'Elemental Damage':
                        notablePropValues.damage.ele = parsedPropertiesToSave[parsedPropertiesToSave.length - 1].value;
                        break;
                    case 'Chaos Damage':
                        notablePropValues.damage.chaos = parsedPropertiesToSave[parsedPropertiesToSave.length - 1].value;
                        break;
                    case 'Attacks per Second':
                        notablePropValues.damage.speed = parsedPropertiesToSave[parsedPropertiesToSave.length - 1].value;
                        break;
                    case 'Armour':
                        notablePropValues.defense.armour = { value: parsedPropertiesToSave[parsedPropertiesToSave.length - 1].value, index: parsedPropertiesToSave.length - 1 };
                        break;
                    case 'Energy Shield':
                        notablePropValues.defense.shield = { value: parsedPropertiesToSave[parsedPropertiesToSave.length - 1].value, index: parsedPropertiesToSave.length - 1 };
                        break;
                    case 'Evasion Rating':
                        notablePropValues.defense.evasion = { value: parsedPropertiesToSave[parsedPropertiesToSave.length - 1].value, index: parsedPropertiesToSave.length - 1 };
                        break;
                    case 'Quality':
                        notablePropValues.quality = parsedPropertiesToSave[parsedPropertiesToSave.length - 1].value;
                        break;
                }
            }

            return null;
        });

        if (!notablePropValues.quality && (item.category.gems || item.category.armour || item.category.weapons || (item.category.maps && item.category.maps.length === 0))) {
            notablePropValues.quality = !(item.category.gems || item.category.maps) ? 0 : false;
            parsedPropertiesToSave.push({ name: 'Quality', value: 0 })
        }
        else if (!(item.category.armour || item.category.weapons)) {
            notablePropValues.quality = false;
        }

        //If the item has quality that modifies stats and it can be modified
        if ((notablePropValues.quality || notablePropValues.quality === 0) && !item.corrupted && !(item.explicitMods && /Mirrored/.test(JSON.stringify(item.explicitMods)))) {
            let baseQuality = calculateBaseQuality(item, notablePropValues.quality);
            if (baseQuality < 20) {
                if (notablePropValues.damage.phys)
                    notablePropValues.damage.physAt20 = calculatePhysDamageAt20Quality(item, 20 - baseQuality, notablePropValues.damage.quality, notablePropValues.damage.rawPhys);
                //TODO: Defenses
            }
        }

        //TODO: add 'at 20 quality' values to parsedProperty objects where necessary
        let val = 0;
        let val20 = 0;
        if (notablePropValues.damage.phys && notablePropValues.damage.speed) {
            val = Math.round(notablePropValues.damage.phys * notablePropValues.damage.speed * 100) / 100;
            if (notablePropValues.damage.physAt20) {
                val20 = Math.round(notablePropValues.damage.physAt20 * notablePropValues.damage.speed * 100) / 100;
                parsedPropertiesToSave.push({ name: 'Physical Damage per Second', value: val, valueAt20: val20 });
            }
            else {
                parsedPropertiesToSave.push({ name: 'Physical Damage per Second', value: val });
            }
        }

        if (notablePropValues.damage.ele && notablePropValues.damage.speed) {
            val = Math.round(notablePropValues.damage.ele * notablePropValues.damage.speed * 100) / 100;
            parsedPropertiesToSave.push({ name: 'Elemental Damage per Second', value: val });
        }

        if ((notablePropValues.damage.phys || notablePropValues.damage.ele || notablePropValues.damage.chaos) && notablePropValues.damage.speed) {
            val = Math.round(((notablePropValues.damage.phys || 0) + (notablePropValues.damage.ele || 0) + (notablePropValues.damage.chaos || 0)) * notablePropValues.damage.speed * 100) / 100;
            if (notablePropValues.damage.physAt20) {
                val20 = Math.round((notablePropValues.damage.physAt20 + (notablePropValues.damage.ele || 0) + (notablePropValues.damage.chaos || 0)) * notablePropValues.damage.speed * 100) / 100;
                parsedPropertiesToSave.push({ name: 'Damage per Second', value: val, valueAt20: val20 });
            }
            else {
                parsedPropertiesToSave.push({ name: 'Damage per Second', value: val });
            }
        }

        return parsedPropertiesToSave;
    }
}

module.exports = DataHandler;