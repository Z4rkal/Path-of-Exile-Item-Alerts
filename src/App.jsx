import React, { Component } from 'react';
import axios from 'axios';
import Header from './Header';
import SearchForm from './SearchForm';
import Output from './Output';

String.prototype.hashCode = function () {
    let hash = 0;
    if (this.length == 0) return hash;

    let char;

    for (let i = 0; i < this.length; i++) {
        char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    if (hash < 0) hash *= -2;

    return hash;
}

class App extends Component {
    constructor() {
        super();
        this.state = {
            advanced: false,
            searching: false,
            numParsed: 0,
            league: '',
            data: {},
            sortStyle: 'age',
            mod: { text: '', pattern: /^$/, numVals: 0, type: '' },
            prop: ''
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
            .then(response => this.setState({ league: response.data }), error => /*console.log(error)*/'');

        axios.get('/api/all')
            .then(response => this.initializeData(response.data), error => /*console.log(error)*/'');

        let serverRef = setInterval(() => axios.get('/api/cur')
            .then((response) => {
                if (response.data.added.length != 0 || response.data.removed.length != 0)
                    this.handleNewData(response.data)
                else if (Object.entries(this.state.data).length == 0)
                    axios.get('/api/numparsed')
                        .then(response => this.setState({ numParsed: response.data }))
                        .catch(() => console.log('Having issues communicating with the server'))
            })
            .catch(error => { clearInterval(serverRef); console.log(`Can't reach server, aborting asking for new data`) }), 1000 * 4);
    }

    initializeData(dataIn) {
        let data = {}

        if (dataIn != 'No data at the moment :(') {
            Object.entries(dataIn).forEach(([, stash]) => {
                Object.entries(stash.matches).forEach(([, item]) => {
                    data[item.id] = { id: item.id, acct: stash.owner, char: stash.lastChar, stashName: stash.stashName, position: stash.position, item: stash.matches[item.id] }
                });
            });

            this.setState({
                searching: true,
                data: data
            });
        }

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

    handleSubmit(search) {
        if (search == undefined || Object.entries(search).length == 0) alert('Please enter a value into the search field');
        else {
            this.setState({
                data: {},
                numParsed: 0,
                searching: true,
                sortStyle: 'age',
                mod: { text: '', pattern: /^$/, numVals: 0, type: '' }
            });

            axios.post(`/api/search?id=${JSON.stringify(search).hashCode()}`, search).then(response => console.log(response.data), error => { console.log(error); console.log(`Failed to submit new search criteria to the server.`) });
        }
    }

    render() {

        return (
            <React.Fragment>
                <Header
                    advanced={this.state.advanced}
                    updateInput={this.updateInput}
                />
                <div className='container'>
                    <SearchForm
                        advanced={this.state.advanced}
                        handleSubmit={this.handleSubmit}
                    />
                    <Output
                        searching={this.state.searching}
                        numParsed={this.state.numParsed}
                        league={this.state.league}
                        results={this.state.data}
                        updateInput={this.updateInput}
                        sortStyle={this.state.sortStyle}
                        mod={this.state.mod}
                        prop={this.state.prop}
                    />
                </div>
            </React.Fragment>
        )
    }
}

export default App;