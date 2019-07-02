import React, { Component } from 'react';
import axios from 'axios';
import Header from './Header';
import Output from './Output';

class App extends Component {
    constructor() {
        super();
        this.state = {
            search: '',
            league: '',
            data: {}
        }

        this.updateInput = this.updateInput.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    updateInput(field, value) {
        this.setState({
            [field]: value
        });
    }

    componentWillMount() {
        axios.get('/api/league')
            .then(response => this.setState({ league: response.data }), error => console.log(`Couldn't reach server for current League`));

        axios.get('/api/all')
            .then(response => this.initializeData(response.data), error => console.log(`Couldn't reach server for old data`));

        let serverRef = setInterval(() => axios.get('/api/cur').then(response => this.handleNewData(response.data), error => { clearInterval(serverRef); console.log(`Can't reach server, aborting asking for new data`) }), 1000 * 4);
    }

    initializeData(dataIn) {
        let data = {}

        if (dataIn != 'No data at the moment :(')
            Object.entries(dataIn).forEach(([, stash]) => {
                Object.entries(stash.matches).forEach(([, item]) => {
                    data[item.id] = { id: item.id, acct: stash.owner, char: stash.lastChar, stashName: stash.stashName, position: stash.position, item: stash.matches[item.id] }
                });
            });

        this.setState({
            data: data
        });
    }

    handleNewData(dataIn) {
        let data = this.state.data;

        //Added upper bound of 50, just so now doesn't explode after a short while
        dataIn.added.forEach((element) => {
            if (Object.entries(data).length == 50)
                delete data[Object.entries(data)[0][1].id];// = undefined;
            data[element.id] = element;
        });

        dataIn.removed.forEach((element) => {
            delete data[element.id];// = undefined;
        });

        this.setState({
            data: data
        });
    }

    handleSubmit() {
        if (this.state.search == undefined || this.state.search == '') alert('Please enter a value into the search field');
        else {
            let data = {};
            this.setState({ data: data });
            axios.post(`/api/search?id=${this.state.search}`, 'Hewwo mxs sewver').then(response => console.log(response.data), error => console.log(error));
        }
    }

    render() {

        return (
            <div className='container'>
                <Header
                    search={this.state.search}
                    updateInput={this.updateInput}
                    handleSubmit={this.handleSubmit}
                />
                <Output league={this.state.league} results={this.state.data} />
            </div>
        )
    }
}

export default App;