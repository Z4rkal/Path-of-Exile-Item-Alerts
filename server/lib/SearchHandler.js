//This will be a class that constructs the search method necessary to match our desired item.
//It will receive data passed to the server from buildSearchParams on the front end

class SearchHandler {
    constructor() {
        this.parseItem = function (item) { return false; };
    }

    get getParser() {
        return this.parseItem;
    }

    set newParams(searchParams) {
        eval(`${this.buildParser(searchParams)}`);
    }

    buildParser(params) {
        let functionString = 'this.parseItem = function (item) {';

        functionString += Object.entries(params).reduce((a, [param, el]) => {
            if (el == null) return a;

            a += `try{`

            switch (param) {
                case 'name':
                    a += ` if(item.name != ${el}) return false`;
                case 'type':
                    a += ` if(JSON.stringify(item.category) != ${el}) return false;`;
                case 'base':
                    a += ` if(item.typeLine != ${el}) return false;`;
                case 'links':
                    a += ` let [,,maxLinks] = item.sockets.reduce((a,el.group,i) => {
                                    if(el.group == a[1]) a[0]++;
                                    else {
                                        if(a[2] < a[0]) a[2] = a[0];
                                        a[0] = 1; a[1] = el.group;
                                    }
                                    return a;
                                },[0,0,0]); if(maxLinks < ${el}) return false;`;
                case 'sockets':
                    a += ` if(item.sockets.length < ${el}) return false;`;
                case 'corrupted':
                    a += ` if(item.corrupted != ${el}) return false;`;
                case 'shaper':
                    a += ` if(item.shaper != ${el}) return false;`;
                case 'elder':
                    a += ` if(item.elder != ${el}) return false;`;
                case 'ilvl':
                    a += ` if(item.ilvl < ${el}) return false;`;
            }

            a += ` } catch(error) { console.log('!!!!!!!!!!'); console.log(\`Param: \${param}, Element: \${el}\`); console.log(\`Error: \${error}\`); return false; }`

            return a;
        }, '');

        functionString += ' return true; };';

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