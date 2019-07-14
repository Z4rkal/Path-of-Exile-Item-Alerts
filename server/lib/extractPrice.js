const curTypes = Object.entries(require('./currencyTypes'));

function extractPrice(note) {
    let result = '';
    let price = /([0-9\.]+) ([a-z]+)$/i;

    if (price.test(note)) {
        let extractPrice = price.exec(note);

        result += extractPrice[1];

        for (let i = 0; i < curTypes.length; i++) {
            if (curTypes[i][1].test(extractPrice[2])) {
                result += ' ' + curTypes[i][0] + (extractPrice[1] != '1' && curTypes[i][0][curTypes[i][0].length - 1] != 's' ? 's' : '');
                return result;
            }
        }
    }

    throw new Error(`Error in extractPrice function, the given note (${note}) does not contain a valid price`);
}

module.exports = extractPrice;