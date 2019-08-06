//This will be a function that converts the value of our search form into data for SearchHandler.js on the backend

function buildSearchParams(params) {
    //Build the searchParams object, probably a better way to do this 
    //because right now I have to add a parameter to three different files 
    //whenever I add a new one
    let searchParams = {
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
        quality: [params.quality[0], params.quality[1]]
    };

    //Get rid of empty fields before returning it
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

    return searchParams;
}

export default buildSearchParams;