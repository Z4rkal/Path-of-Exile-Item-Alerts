const extractPrice = require('./extractPrice');

function formatPrice(note) {
    let result = '';
    if (/N\/A/.test(note)) return 'Price: N/A';

    let validListingTypes = /\~(b\\\/o) |\~(price) /;
    if (validListingTypes.test(note)) {
        if (/b\\\/o/.test(note))
            result = 'Fixed price: ';
        else result = 'Asking price: '
    }
    else result = 'Price: N/A'

    if (result == 'Price: N/A') return result;

    try { result += extractPrice(note); }
    catch (error) { result = 'Price: N/A' }

    return result;
}

module.exports = formatPrice;