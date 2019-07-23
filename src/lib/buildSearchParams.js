//This will be a function that converts the value of our search form into data for SearchHandler.js on the backend

function buildSearchParams(params, advanced) {
    if (advanced)
        return {
            name: params.name != '' ? params.name : undefined,
            type: params.type != '' ? params.type : undefined,
            base: params.base != '' ? params.base : undefined,
            sockets: params.sockets != ['',''] ? [parseInt(params.sockets[0]),parseInt(params.sockets[1])] : undefined,
            links: params.links != ['',''] ? [parseInt(params.links[0]),parseInt(params.links[1])] : undefined,
            corrupted: params.corrupted != 'N/A' ? params.corrupted : undefined
        }


    return { name: params.name };
}

export default buildSearchParams;