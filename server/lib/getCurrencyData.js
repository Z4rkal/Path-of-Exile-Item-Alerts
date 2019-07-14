const axios = require('axios');
const curTypes = require('./currencyTypes');

async function getCurrencyData(league) {

    let [...cData] = await axios.get(`https://api.poe.watch/get?category=currency&league=${league}`)
        .then(response => response.data, error => { console.log('Couldn\'t get currency data from poe.watch :('); return 'No Currency Data :(' });

    cData = cData.filter((e) => e.group === 'currency' && !/shard/i.test(e.name) && !/sextant/i.test(e.name)).map((e) => {
        for (p in curTypes) {
            if (curTypes[p].test(e.name)) {
                return { name: p, mean: e.mean, median: e.median, icon: e.icon };
            }
        }
        return 'N/A'
    }).filter((e) => e != 'N/A');

    console.log(`Finished parsing currency data from api.poe.watch`);
    return cData;
}

module.exports = getCurrencyData;