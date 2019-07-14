const formatPrice = require('./formatPrice');

function calculateRawValue(note, cData) {
    if (cData == 'No currency data :(') return 'N/A';

    const fullPrice = formatPrice(note);
    if (fullPrice == 'Price: N/A') return 'N/A'

    const value = /[0-9.]+/.test(fullPrice) ? parseFloat(/[0-9.]+/.exec(fullPrice)[0]) : null;
    if (value == null) return 'N/A';
    const type = /[0-9] ([a-z ]+)/i.test(fullPrice) ? /[0-9] ([a-z ]+)/i.exec(fullPrice)[1] : null;
    if (type == null) return 'N/A';

    if (type === 'Chaos') return value;

    let res = 'N/A';

        cData.forEach((e) => {
            if (e.name == type || e.name == type.slice(0, type.length - 1)) res = Math.fround(value * e.median);
        });

    return res;
}

module.exports = calculateRawValue;