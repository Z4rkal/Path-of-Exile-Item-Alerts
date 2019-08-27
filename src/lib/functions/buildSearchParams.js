function buildSearchParams(params) {
    let searchParams = { //Clone the simple parameters
        name: params.name,
        type: params.type,
        base: params.base,
        sockets: [params.sockets[0], params.sockets[1]],
        links: [params.links[0], params.links[1]],
        corrupted: params.corrupted != 'N/A' ? params.corrupted : null,
        shaperElder: params.shaperElder != 'N/A' ? params.shaperElder : null,
        rarity: params.rarity != 'N/A' ? params.rarity : null,
        iLvl: [params.iLvl[0], params.iLvl[1]],
        tier: [params.tier[0], params.tier[1]],
        quality: [params.quality[0], params.quality[1]],
        modGroups: []
    };

    //Clone the modSearch parameter
    params.modSearch.map((group, index) => {
        searchParams.modGroups[index] = {
            modifiers: [],
            type: group.type,
            min: group.min,
            max: group.max
        };

        group.modifiers.map((modifier, modIndex) => {
            searchParams.modGroups[index].modifiers[modIndex] = {
                text: modifier.text,
                min: modifier.min,
                max: modifier.max
            };
        })
    });

    //Get rid of empty fields
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

    return searchParams;
}

export default buildSearchParams;