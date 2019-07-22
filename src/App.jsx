import React, { Component } from 'react';
import axios from 'axios';
import Header from './Header';
import SearchForm from './SearchForm';
import Output from './Output';

class App extends Component {
    constructor() {
        super();
        this.state = {
            advanced: false,
            league: '',
            data: {},
            sortStyle: 'age',
            mod: { text: '', pattern: /^$/, numVals: 0, type: '' }
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

    handleSubmit(search) {
        if (search == undefined || Object.entries(search).length == 0) alert('Please enter a value into the search field');
        else {
            this.setState({ data: {} });
            axios.post(`/api/search?id=${search}`, { search, message: 'Hewwo mxs sewver' }).then(response => console.log(response.data), error => console.log(`Failed to submit new search criteria to the server.`));
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
                        league={this.state.league}
                        results={this.state.data}
                        updateInput={this.updateInput}
                        sortStyle={this.state.sortStyle}
                        mod={this.state.mod}
                    />
                </div>
            </React.Fragment>
        )
    }
}

export default App;