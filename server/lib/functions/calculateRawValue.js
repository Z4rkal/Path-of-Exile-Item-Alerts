const formatPrice = require('./formatPrice');

function calculateRawValue(price, cData) {
    if (cData == 'No currency data :(') return 'N/A';

    if (price == 'Price: N/A') throw new Error('Don\'t pass a \'Price: N/A\' into calculateRawValue >:(');

    const priceReg = /(\.?[0-9]+|[0-9]+\.[0-9]+)\.? ([a-z ']+)$/i
    if (!priceReg.test(price)) return 'N/A';

    const value = parseFloat(priceReg.exec(price)[1]);
    const type = priceReg.exec(price)[2];

    if (type === 'Chaos') return value;

    let res = 'N/A';
    const cur = cData.find((e) => e.name == type || e.name == type.slice(0, type.length - 1));

    if (cur != undefined)
        res = Math.fround(value * cur.median);

    return res;
}

module.exports = calculateRawValue;