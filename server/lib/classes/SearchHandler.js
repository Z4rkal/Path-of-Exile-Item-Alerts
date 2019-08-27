//This will be a class that constructs the search method necessary to match our desired item.
//It will receive data passed to the server from buildSearchParams on the front end

//A list of valid search parameters, if any other parameters are present in the searchParams object we take in, we'll throw an error
const VALID_PARAMS = {
    name: 'regex_str',
    type: 'regex_str',
    base: 'regex_str',
    sockets: 'two_num_array',
    links: 'two_num_array',
    corrupted: 'bool_str',
    shaperElder: 'word_str',
    rarity: 'word_str',
    iLvl: 'two_num_array',
    tier: 'two_num_array',
    quality: 'two_num_array',
    modGroups: 'group_array'
}

class SearchHandler {
    constructor() {
        this.searchFunction = function (item) { return false; };
    }

    get getSearchFunc() {
        return this.searchFunction;
    }

    set newParams(searchParams) {
        try {
            const validationErr = (type) => new Error(`The searchParams object contained some invalid keys or values${type ? ` of type ${type}` : ``}, aborting building a search function for safety`);

            //First sanitize the input by getting rid of null values
            Object.entries(searchParams).forEach(([param, el]) => {
                if (param !== 'modGroups') {
                    if (
                        el === null
                        || el === ''
                        || (typeof (el) === 'object'
                            && (el[0] === null || el[0] === '')
                            && (el[1] === null || el[1] === ''))
                    ) delete searchParams[param];

                    else if (typeof (el) === 'object') {
                        if (el[0] === '') searchParams[param][0] = null;
                        if (el[1] === '') searchParams[param][1] = null;
                    }
                }
            });

            //Get rid of empty modifiers and modifier groups
            for (let n = 0; n < searchParams.modGroups.length; n++) {
                for (let i = 0; i < searchParams.modGroups[n].modifiers.length; i++) {
                    if (!searchParams.modGroups[n].modifiers[i].text
                        || typeof searchParams.modGroups[n].modifiers[i].text !== 'string'
                        || /^ +$/.test(searchParams.modGroups[n].modifiers[i].text)) {
                        searchParams.modGroups[n].modifiers.splice(i, 1);
                        i--;
                    }
                    else if (searchParams.modGroups[n].modifiers[i].text && /^ +| +$/g.test(searchParams.modGroups[n].modifiers[i].text))
                        searchParams.modGroups[n].modifiers[i].text.replace(/^ +| +$/g, '');
                }

                if (searchParams.modGroups[n].modifiers.length === 0) {
                    searchParams.modGroups.splice(n, 1);
                    n--;
                }
            }

            //Then delete the entire modGroups parameter if it's empty afterwards
            if (searchParams.modGroups.length === 0)
                delete searchParams.modGroups;

            //Then validate the remaining input for safety
            Object.entries(searchParams).forEach(([param, el]) => {
                if (!VALID_PARAMS[param]) throw validationErr(param);
                switch (VALID_PARAMS[param]) {
                    case 'regex_str':
                        if (typeof (el) !== 'string' || !/^[a-z ']+$/i.test(el)) throw validationErr('regex_str');
                        break;
                    case 'two_num_array':
                        if (
                            typeof (el) !== 'object'
                            || Object.entries(el).length !== 2
                            || !(/^[0-9]+$/.test(el[0]) || el[0] === null)
                            || !(/^[0-9]+$/.test(el[1]) || el[1] === null)
                        ) throw validationErr('two_num_array');
                        break;
                    case 'bool_str':
                        if (typeof (el) !== 'string' || !/^true$|^false$/.test(el)) throw validationErr('bool_str');
                        break;
                    case 'word_str':
                        if (typeof (el) !== 'string' || !/^[a-z]+(?:\-[a-z]+)*$/i.test(el)) throw validationErr('word_str');
                        break;
                    case 'group_array':
                        if (typeof el !== 'object' || el.length === 0) throw validationErr('group_array');
                        el.map((group) => {
                            if (!group.modifiers || typeof group.modifiers !== 'object' || group.modifiers.length === 0) throw validationErr('group_array: group modifiers');
                            if (!group.type || typeof group.type !== 'string' || !/^and$|^sum$|^count$|^not$/.test(group.type)) throw validationErr('group_array: group type');
                            if (typeof group.min !== 'string' || !/^[0-9]*$/.test(group.min)) throw validationErr('group_array: group min');
                            if (typeof group.max !== 'string' || !/^[0-9]*$/.test(group.max)) throw validationErr('group_array: group max');
                            group.modifiers.map((modifier) => {
                                if (!modifier.text
                                    || typeof modifier.text !== 'string'
                                    || modifier.text.length === 0
                                    || /\/|\\/.test(modifier.text)
                                    || !/^(?:(?:(?:[\+\-]?#%?)|(?:[^\W\d_]+))(?: |$))+$/.test(modifier.text))
                                    throw validationErr('group_array: modifier text');
                                if (typeof modifier.min !== 'string'
                                    || !/^[0-9]*$/.test(modifier.min))
                                    throw validationErr('group_array: modifier min');
                                if (typeof modifier.max !== 'string'
                                    || !/^[0-9]*$/.test(modifier.max))
                                    throw validationErr('group_array: modifier max');
                            });
                        });
                        break;
                    default:
                        throw validationErr();
                }
            });

            const funcStr = this.buildSearchFunc(searchParams);
            //Then build the function by constructing a new function from the string literal returned by this.buildSearchFunc
            this.searchFunction = new Function(['item', 'compareToMinMax', 'extractModValue'], funcStr);

            //console.log('::::Completed Function::::');
            //console.log(this.searchFunction.toString());
        }
        catch (error) {
            console.log(error);
            console.log(`Here's what our function would have looked like:\nfunction anonymous(item\n)\n${this.buildSearchFunc(searchParams)}}`);
            this.searchFunction = function (item) { return false; };
            throw new Error(`Throwing upwards, let the client know that something went wrong:\n${error}`);
        }
    }

    //Builds a string literal of a custom function for matching the search parameters passed in.
    //This is probably horrible code but it sounded like a really cool idea so I wanted to write it this way just to see if I could get it to work.
    //Pros: The function it builds should be somewhat faster than a generic catchall that checks every possible search term,
    //speed is pretty important considering the sheer volume of data from the GGG api that we're searching through
    //Doing it this way should also make it significantly easier to build modular searches for different sets of item modifiers later
    //Cons: Probably a nightmare to maintain / test, we'll see
    buildSearchFunc(params) {
        let functionString = 'let i;';

        functionString += Object.entries(params).reduce((a, [param, el]) => {
            if (el == undefined || el == null) return a;

            a += `\ntry {`

            switch (param) {
                case 'name':
                    a += `\n\tif(!/^${el}$/i.test(item.name)) return false;`;
                    break;
                case 'type':
                    a += `\n\tif(!/${el}/i.test(JSON.stringify(item.category))) return false;`;
                    break;
                case 'base':
                    a += `\n\tif(!/^${el}$/i.test(item.typeLine)) return false;`;
                    break;
                case 'links':
                    a += `\n\tif(item.sockets == undefined${el[0] != null ? ` || item.sockets.length < ${el[0]}` : ``}) return false;`
                    a += `\n\tlet [,,maxLinks] = item.sockets.reduce((a,el,i) => {`
                    a += /*    */`\n\t\tif(el.group == a[1]) a[0]++;`
                    a += /*    */`\n\t\telse {`
                    a += /*        */`\n\t\t\tif(a[2] < a[0]) a[2] = a[0];`
                    a += /*        */`\n\t\t\ta[0] = 1; a[1] = el.group;`
                    a += /*    */`\n\t\t}`
                    a += /*    */`\n\t\tif(i == item.sockets.length - 1 && a[0] > a[2]) a[2] = a[0];`
                    a += /*    */`\n\t\treturn a;`
                    a += `\n\t}, [0, 0, 0]);`
                    a += `\n\tif (${el[0] != null && el[1] != null
                        ? `maxLinks < ${el[0]} || maxLinks > ${el[1]}`
                        : `${el[0] != null
                            ? `maxLinks < ${el[0]}`
                            : `maxLinks > ${el[1]}`}`}) return false;`;
                    break;
                case 'sockets':
                    a += `\n\tif (item.sockets == undefined || ${el[0] != null && el[1] != null
                        ? `item.sockets.length < ${el[0]} || item.sockets.length > ${el[1]}`
                        : `${el[0] != null
                            ? `item.sockets.length < ${el[0]}`
                            : `item.sockets.length > ${el[1]}`}`}) return false;`;
                    break;
                case 'corrupted':
                    a += `\n\tif (${el === 'true' ? `!` : ``}item.corrupted) return false;`;
                    break;
                case 'shaperElder':
                    switch (el) {
                        case 'shaper':
                            a += `\n\tif (!item.shaper) return false;`;
                            break;
                        case 'elder':
                            a += `\n\tif (!item.elder) return false;`;
                            break;
                        case 'either':
                            a += `\n\tif (!item.shaper && !item.elder) return false;`;
                            break;
                        case 'neither':
                            a += `\n\tif (item.shaper || item.elder) return false;`;
                            break;
                        default: throw new Error('Bad shaperElder input >:(');
                    }
                    break;
                case 'rarity':
                    switch (el) {
                        case 'normal':
                            a += `\n\tif (item.frameType != 0 || Object.keys(item.category)[1] == 'currency') return false;`
                            break;
                        case 'magic':
                            a += `\n\tif (item.frameType != 1) return false;`
                            break;
                        case 'rare':
                            a += `\n\tif (item.frameType != 2 || !item.name || !/[a-z]+ [a-z]+/i.test(item.name)) return false;`
                            break;
                        case 'unique':
                            a += `\n\tif (item.frameType != 3) return false;`
                            break;
                        case 'non-unique':
                            a += `\n\tif (item.frameType != 2) return false`
                            break;
                        default: throw new Error('Bad rarity input >:(');
                    }
                    break;
                case 'iLvl':
                    a += `\n\tif (${el[0] != null
                        ? `item.ilvl < ${el[0]}${el[1] != null
                            ? ` || item.ilvl > ${el[1]}`
                            : ``}` : `${el[1] != null
                                ? `item.ilvl > ${el[1]}`
                                : `true) throw new Error('vewy wong ;w;');`}`}) return false;`;
                    break;
                case 'tier':
                    a += `\n\tif(item.properties === undefined) return false;`;
                    a += `\n\tlet i = item.properties.findIndex((el) => el.name === 'Map Tier' || el.name === 'Level' ? true : false);`;
                    a += `\n\tif(i === -1) return false;`;
                    if (el[0] != null) {
                        a += `\n\tif(/[0-9]+/.exec(item.properties[i].values[0][0])[0] < ${el[0]}`;
                        if (el[1] != null)
                            a += ` || /[0-9]+/.exec(item.properties[i].values[0][0])[0] > ${el[1]}) return false;`;
                        else a += `) return false;`;
                    }
                    else if (el[1] != null) {
                        a += `\n\tif(/[0-9]+/.exec(item.properties[i].values[0][0])[0] > ${el[1]}) return false;`
                    }
                    else throw new Error('vewy wong ;w;');
                    break;
                case 'quality':
                    a += `\n\tif(item.properties === undefined) return false;`;
                    a += `\n\tlet i = item.properties.findIndex((el) => el.name === 'Quality'? true : false);`;
                    a += `\n\tif(i === -1) return false;`;
                    if (el[0] != null) {
                        a += `\n\tif(/[0-9]+/.exec(item.properties[i].values[0][0])[0] < ${el[0]}`;
                        if (el[1] != null)
                            a += ` || /[0-9]+/.exec(item.properties[i].values[0][0])[0] > ${el[1]}) return false;`;
                        else a += `) return false;`;
                    }
                    else if (el[1] != null) {
                        a += `\n\tif(/[0-9]+/.exec(item.properties[i].values[0][0])[0] > ${el[1]}) return false;`
                    }
                    else throw new Error('vewy wong ;w;');
                    break;
                case 'modGroups':
                    a += `\n\tconst itemMods = [].concat(item.implicitMods || '',item.explicitMods || '',item.craftedMods || '');`
                    //a += `\n\tconsole.log(itemMods);`
                    a += `\n\tlet matches = [];`
                    a += `\n\tlet sum = 0;`
                    a += `\n\tlet count = 0;`
                    el.map((group) => {
                        switch (group.type) {
                            case 'and':
                                group.modifiers.map((modifier) => {
                                    const modPattern = this.regexifyMod(modifier.text);
                                    a += this.matchMods(modPattern, modifier.min, modifier.max, false);
                                    a += `\n\tif(matches.length === 0) return false;`;
                                });
                                break;
                            case 'sum':
                                a += `\n\tsum = 0;`;
                                group.modifiers.map((modifier) => {
                                    const modPattern = this.regexifyMod(modifier.text);
                                    a += this.matchMods(modPattern, modifier.min, modifier.max, true);
                                    a += `\n\tsum += matches.reduce((acc,cur) => acc + cur, 0)`;
                                });
                                if (group.min && group.max)
                                    a += `\n\tif(sum < ${group.min} || sum > ${group.max}) return false;`;
                                else if (group.min)
                                    a += `\n\tif(sum < ${group.min}) return false;`;
                                else if (group.max)
                                    a += `\n\tif(sum > ${group.max}) return false;`;
                                else
                                    a += `\n\tif(sum === 0) return false;`;
                                break;
                            case 'count':
                                a += `\n\tcount = 0;`;
                                group.modifiers.map((modifier) => {
                                    const modPattern = this.regexifyMod(modifier.text);
                                    a += this.matchMods(modPattern, modifier.min, modifier.max, false);
                                    a += `\n\tif(matches.length != 0) count++;`;
                                });
                                if (group.min && group.max)
                                    a += `\n\tif(count < ${group.min} || count > ${group.max}) return false;`;
                                else if (group.min)
                                    a += `\n\tif(count < ${group.min}) return false;`;
                                else if (group.max)
                                    a += `\n\tif(count > ${group.max}) return false;`;
                                else
                                    a += `\n\tif(count === 0) return false;`;
                                break;
                            case 'not':
                                group.modifiers.map((modifier) => {
                                    const modPattern = this.regexifyMod(modifier.text);
                                    a += this.matchMods(modPattern, modifier.min, modifier.max, false);
                                    a += `\n\tif(matches.length !== 0) return false;`;
                                });
                                break;
                            default: throw new Error(`an invalid group type got through validation ;w;`)
                        }
                    });
                    break;
                default:
                    throw new Error(`Error: Invalid search parameter; ${param} is either a bad input or not implemented yet!`)
            }

            //Once this is thoroughly tested we can get rid of these try/catch blocks around each statement, but for now this reports on any errors in the resulting code
            a += `\n} catch(error) {\n\tconsole.log('!!!!!!!!!!');\n\tconsole.log(\`Param: ${param}, Element: ${el}\`);\n\tconsole.log(\`Error: \${JSON.stringify(error)}\`);\n\treturn false;\n}\n`

            return a;
        }, '');

        functionString += '\nreturn true;';

        return functionString;
    }

    regexifyMod(modifierText) {
        return modifierText
            .replace(/\ {2,}/g, ' ')
            .replace(/[\+\-]/g, '\\$&')
            .replace(/#/g, '[0-9]+');
    }

    matchMods(modPattern, min, max, shouldExtract) {
        return `\n\tmatches = itemMods`
            + `.filter((modifier) => /^${modPattern}$/i.test(modifier))`
            + (shouldExtract || min || max ? `.map((modifier) => extractModValue(modifier))` : ``)
            + (min || max ? `.filter((value) => compareToMinMax(value,${min || null},${max || null}))` : ``);
    }
}

module.exports = SearchHandler;

/*{ //Example Item
    "verified": false,
    "w": 2, "h": 2,
    "ilvl": 84,
    "icon": "https:\/\/web.poecdn.com\/image\/Art\/2DItems\/Armours\/Helmets\/BoneHelm.png?scale=1&w=2&h=2&v=998a0d0beda1648f6a95cb26b166aa6c",
    "league": "Legion",
    "id": "18747667c0d26a0222e077274ef2e3ea2a8486d04c079cb0e70bfe0287b2f136",
    "sockets": [{ "group": 0, "attr": "I", "sColour": "B" }, { "group": 0, "attr": "I", "sColour": "B" }, { "group": 0, "attr": "S", "sColour": "R" }],
    "name": "Dread Brow",
    "typeLine": "Bone Helmet",
    "identified": true,
    "note": "~price 20 chaos",
    "properties": [{ "name": "Quality", "values": [["+7%", 1]], "displayMode": 0, "type": 6 }, { "name": "Armour", "values": [["331", 1]], "displayMode": 0, "type": 16 }, { "name": "Energy Shield", "values": [["64", 1]], "displayMode": 0, "type": 18 }],
    "requirements": [{ "name": "Level", "values": [["73", 0]], "displayMode": 0 }, { "name": "Str", "values": [["76", 0]], "displayMode": 1 }, { "name": "Int", "values": [["76", 0]], "displayMode": 1 }],
    "implicitMods": ["Minions deal 20% increased Damage"],
    "explicitMods": ["61% increased Armour and Energy Shield", "+88 to maximum Life", "+44% to Cold Resistance"],
    "craftedMods": ["+20% to Fire and Lightning Resistances"],
    "frameType": 2,
    "category": { "armour": ["helmet"] },
    "x": 10, "y": 7,
    "inventoryId":
    "Stash8",
    "socketedItems": []
}*/

//Advanced search wireframe?
/*
    Button to expand header to include more than just a name field
        -field for type and base
        -field for links and sockets
        -field for stats?

        -field for modifier groups

        -options for corrupted, shaped, elder, ilvl, quality, price, etc.
*/

/* Tabula Example
{
    "verified": false,
    "w": 2, "h": 3,
    "ilvl": 82,
    "icon": "https:\/\/web.poecdn.com\/image\/Art\/2DItems\/Armours\/BodyArmours\/TabulaRasa.png?scale=1&w=2&h=3&v=c169e1ab88583925693bb3a35cc49b6b", "league": "Legion", "id": "783a97efccb6ed0b101562db7ce91d559d43104d217a9643964424e8ff4bca06",
    "sockets": [
        { "group": 0, "attr": "G", "sColour": "W" },
        { "group": 0, "attr": "G", "sColour": "W" },
        { "group": 0, "attr": "G", "sColour": "W" },
        { "group": 0, "attr": "G", "sColour": "W" },
        { "group": 0, "attr": "G", "sColour": "W" },
        { "group": 0, "attr": "G", "sColour": "W" }],
    "name": "Tabula Rasa",
    "typeLine": "Simple Robe",
    "identified": true,
    "corrupted": true,
    "frameType": 3,
    "category": { "armour": ["chest"] },
    "x": 2, "y": 0,
    "inventoryId": "Stash3",
    "socketedItems": []
}
*/

/* Example Exquisite Blade
{
    "verified":false,
    "w":2,"h":4,
    "ilvl":83,
    "icon":"https:\/\/web.poecdn.com\/image\/Art\/2DItems\/Weapons\/TwoHandWeapons\/TwoHandSwords\/TwoHandSword8.png?scale=1&w=2&h=4&v=44d717ffd2668094350ae6065f0f3b62","league":"Legion","id":"25cb0942eabb7babe7e310350c75fc4bce3177be2670c218c2a226999f865b3c",
    "sockets":[{"group":0,"attr":"D","sColour":"G"},{"group":0,"attr":"S","sColour":"R"}],
    "name":"Gale Thirst",
    "typeLine":"Exquisite Blade",
    "identified":true,
    "note":"~price 2 chaos",
    "properties":
    [
        {"name":"Two Handed Sword","values":[],"displayMode":0},
        {"name":"Physical Damage","values":[["56-94",0]],"displayMode":0,"type":9},
        {"name":"Elemental Damage","values":[["64-111",4]],"displayMode":0,"type":10},
        {"name":"Critical Strike Chance","values":[["6.96%",1]],"displayMode":0,"type":12},
        {"name":"Attacks per Second","values":[["1.35",0]],"displayMode":0,"type":13},
        {"name":"Weapon Range","values":[["13",0]],"displayMode":0,"type":14}
    ],
    "requirements":
    [
        {"name":"Level","values":[["70",0]],"displayMode":0},
        {"name":"Str","values":[["119",0]],"displayMode":1},
        {"name":"Dex","values":[["131",0]],"displayMode":1}
    ],
    "implicitMods":["+60% to Global Critical Strike Multiplier"],
    "explicitMods":
    [
        "+16 to Strength",
        "Adds 64 to 111 Fire Damage",
        "16% increased Critical Strike Chance",
        "+5 Life gained on Kill"
    ],
    "frameType":2,
    "category":{"weapons":["twosword"]},
    "x":22,"y":17,
    "inventoryId":"Stash80",
    "socketedItems":[]
}
*/

/* Example Skill Gem
{
    "verified":false,
    "w":1,"h":1,
    "ilvl":0,
    "icon":"https:\/\/web.poecdn.com\/image\/Art\/2DItems\/Gems\/Flammability.png?scale=1&w=1&h=1&v=6fbf7cfcddcc267b1f44fb84314dbe04",
    "support":false,
    "league":"Legion",
    "id":"dc484b6a2c5992768f47a7b5c613456bcaaf219d8f4231ed7ca161c2f9d25eb9",
    "name":"",
    "typeLine":"Flammability",
    "identified":true,
    "properties":
    [
        {"name":"Spell, AoE, Duration, Curse, Fire","values":[],"displayMode":0},
        {"name":"Level","values":[["1",0]],"displayMode":0,"type":5},
        {"name":"Mana Cost","values":[["24",0]],"displayMode":0},
        {"name":"Cast Time","values":[["0.50 sec",0]],"displayMode":0},
        {"name":"Quality","values":[["+8%",1]],"displayMode":0,"type":6}
    ],
    "additionalProperties":[{"name":"Experience","values":[["1\/118383",0]],"displayMode":2,"progress":8.447158506896812e-6,"type":20}],
    "requirements":[{"name":"Level","values":[["24",0]],"displayMode":0},{"name":"Str","values":[["25",0]],"displayMode":1},{"name":"Int","values":[["37",0]],"displayMode":1}],
    "secDescrText":"Curses all targets in an area, making them less resistant to fire damage and giving them a chance to be ignited by fire damage.",
    "explicitMods":["Base duration is 9.00 seconds","Cursed enemies have -25% to Fire Resistance","Cursed enemies have +10% chance to be Ignited by Fire Damage","Ignite on Cursed enemies has 4% increased Duration"],
    "descrText":"Place into an item socket of the right colour to gain this skill. Right click to remove from a socket.",
    "frameType":4,
    "category":{"gems":["activegem"]},
    "x":3,"y":4,
    "inventoryId":"Stash44"
}
*/