//This will be a class that constructs the search method necessary to match our desired item.
//It will receive data passed to the server from buildSearchParams on the front end

//A list of valid search parameters, if any other parameters are present in the searchParams object we take in, we'll throw an error
const VALID_PARAM_KEYS = {
    name: 'valid uwu',
    type: 'valid uwu',
    base: 'valid uwu',
    sockets: 'valid uwu',
    links: 'valid uwu',
    corrupted: 'valid uwu',
    shaperElder: 'valid uwu',
    iLvl: 'valid uwu',
    tier: 'valid uwu',
    quality: 'valid uwu'
}

//A list describing the typing/use of valid parameters in buildSearchParams
const VALID_PARAM_TYPES = {
    name: 'regex_str',
    type: 'regex_str',
    base: 'regex_str',
    sockets: 'two_num_array',
    links: 'two_num_array',
    corrupted: 'bool_str',
    shaperElder: 'word_str',
    iLvl: 'two_num_array',
    tier: 'two_num_array',
    quality: 'two_num_array'
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
            const validationErr = new Error('The searchParams object contained some invalid keys or values, aborting building a search function for safety');

            //First sanitize the input by getting rid of null values
            Object.entries(searchParams).forEach(([param, el]) => {
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
            });

            //Then validate the remaining input for safety
            Object.entries(searchParams).forEach(([param, el]) => {
                if (!(VALID_PARAM_KEYS[param] === 'valid uwu')) throw validationErr;
                switch (VALID_PARAM_TYPES[param]) {
                    case 'regex_str':
                        if (typeof (el) !== 'string' || !/^[a-z ']+$/i.test(el)) throw validationErr;
                        break;
                    case 'two_num_array':
                        if (
                            typeof (el) !== 'object'
                            || Object.entries(el).length !== 2
                            || !(/^[0-9]+$/.test(el[0]) || el[0] === null)
                            || !(/^[0-9]+$/.test(el[1]) || el[1] === null)
                        ) throw validationErr;
                        break;
                    case 'bool_str':
                        if (typeof (el) !== 'string' || !/^true$|^false$/.test(el)) throw validationErr;
                        break;
                    case 'word_str':
                        if (typeof (el) !== 'string' || !/^[a-z]+$/i.test(el)) throw validationErr;
                        break;
                    default:
                        throw validationErr;
                }
            });

            const funcStr = this.buildSearchFunc(searchParams);
            //Then build the function by constructing a new function from the string literal returned by this.buildSearchFunc
            this.searchFunction = new Function(['item'], funcStr);

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
                default:
                    throw new Error(`Error: Invalid search parameter; ${param} is either a bad input or not implemented yet!`)
            }

            //Once this is thoroughly tested we can get rid of these try/catch blocks around each statement, but for now this reports on any errors in the resulting code
            a += `\n} catch(error) {\n\tconsole.log('!!!!!!!!!!');\n\tconsole.log(\`Param: ${param}, Element: ${el}\`);\n\tconsole.log(\`Error: \${error}\`);\n\treturn false;\n}\n`

            return a;
        }, '');

        functionString += '\nreturn true;';

        return functionString;
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