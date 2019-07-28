const curTypes = Object.entries(require('./currencyTypes'));

function extractPrice(note) {
    let result = '';
    let price = /(\.?[0-9]+|[0-9]+\.[0-9]+)\.? ([a-z]+)$/i;

    if (price.test(note)) {
        let extractPrice = price.exec(note);

        result += extractPrice[1];

        const type = curTypes.find((e) => e[1].test(extractPrice[2]));

        if (type != undefined && type != null) {
            result += ' ' + type[0] + (extractPrice[1] != '1' && type[0][type[0].length - 1] != 's' ? 's' : '');
            return result;
        }
    }

    throw new Error(`Error in extractPrice function, the given note (${note}) does not contain a valid price`);
}

module.exports = extractPrice;