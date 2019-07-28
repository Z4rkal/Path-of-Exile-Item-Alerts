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

    try {
        result += extractPrice(note);
        return result;
    }
    catch (error) {
        //console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        //console.log(error);
        //console.log(note);
        return 'Price: N/A';
    }
}

module.exports = formatPrice;