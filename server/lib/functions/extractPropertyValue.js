function extractPropertyValue(property, type) {
    let val = 0;

    switch (type) {
        case 'range':
            try {
                val = parseInt(/([0-9]+)-([0-9]+)/.exec(property.values[0][0]).reduce((a, el, i) => {
                    if (i > 0) return a += parseInt(el);
                    else return a;
                }, 0)) / 2;
            }
            catch (error) {
                val = 0;
                console.log(`Error with ${property.name} ${JSON.stringify(property.values)}`)
            }
            break;
        case 'int':
            try {
                val = parseInt(/[0-9]+/.exec(property.values[0][0])[0]);
            }
            catch (error) {
                val = 0;
                console.log(`Error with ${property.name} ${JSON.stringify(property.values)}`)
            }
            break;
        case 'float':
            try {
                val = parseFloat(/^\+?([0-9]+(?:.[0-9]+)?)\%?$/.exec(property.values[0][0])[1]);
            }
            catch (error) {
                val = 0;
                console.log(`Error with ${property.name} ${JSON.stringify(property.values)}`)
            }
            break;
        default: throw new Error('Bad property type passed into extractPropertyValue');
    }

    return val;
}

module.exports = extractPropertyValue;