const axios = require('axios');

class DataHandler {
    constructor() {
        this.data = null;
        this.nextChangeId = null;
    }
    get getData() {
        if (this.data != null) return this.data;
        return 'Waiting for initial data';
    }

    //Method Prototypes
    spinUp() {
        setInterval(() => this.getStashData(this.nextChangeId), 1000 * 60);
    }

    getStashData(nextChangeId) {
        if (nextChangeId != null) {
            axios.get('https://www.pathofexile.com/api/public-stash-tabs')
                .then(response => this.parseNewData(response.data));
        }
        else {
            axios.get(`https://www.pathofexile.com/api/public-stash-tabs?id=${nextChangeId}`)
                .then(response => this.parseNewData(response.data));
        }
    }

    parseNewData(data) {
        this.data = data;
        this.nextChangeId = data.next_change_id;
        console.log(this.nextChangeId);
    }
}

module.exports = DataHandler;