import React, { Component } from 'react';
import axios from 'axios';

class Header extends Component {
    render() {
        return (
            <div className='panel panel-default'>
                <div className='panel-heading'>PoE Live Search Tool</div>
                <div className='panel-body'>
                    <label htmlFor='search-bar' className='control-label'>Enter the name of the item you would like to watch for:</label>
                    <input id='search-bar' className='form-control' type='text' value={this.props.search} onChange={(e) => this.props.updateInput('search', e.target.value)}></input>
                </div>
                <div className='panel-footer'>
                    <button className='btn btn-success btn-block' onClick={() => this.props.handleSubmit()}>Search</button>
                </div>
            </div>
        )
    }
}

class Output extends Component {
    render() {
        // console.log(this.props.results);
        if (Object.entries(this.props.results).length != 0)
            return (
                <div className='panel panel-info'>
                    <div className='panel-heading lead'>Results</div>
                    <div className='panel-body'>
                        <ul className='list-group'>
                            {Object.entries(this.props.results).map(([, element]) => (
                                <li className='list-group-item' key={element.item.id}>
                                    <div className='row'>
                                        <div className='col-sm-4'>
                                            <img src={element.item.icon} />
                                            {element.item.flavour.map((text) => (<p key={element.item.id + ' ' + text} style={{ color: 'orange' }}>{text}</p>))}
                                        </div>
                                        <div className='col-sm-8'>
                                            <h3>{element.item.name}</h3>
                                            <p>Price: {element.item.note}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            );
        return (<div></div>);
    }
}

class App extends Component {
    constructor() {
        super();
        this.state = {
            search: '',
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
        axios.get('/api/all')
            .then(response => this.initializeData(response.data), error => console.log(error));

        let serverRef = setInterval(() => axios.get('/api/cur').then(response => this.handleNewData(response.data), error => { clearInterval(serverRef); console.log(error) }), 1000 * 4);
    }

    initializeData(dataIn) {
        let data = {}

        if (dataIn != 'No data at the moment :(')
            Object.entries(dataIn).forEach((stash) => {
                Object.entries(stash[1].matches).forEach((item) => {
                    data[item[1].id] = { id: item[1].id, acct: stash[1].owner, char: stash[1].lastChar, name: stash[1].name, item: stash[1].matches[item[1].id] }
                });
            });

        this.setState({
            data: data
        });
    }

    handleNewData(dataIn) {
        let data = this.state.data;

        dataIn.added.forEach((element) => {
            data[element.id] = element;
        });

        dataIn.removed.forEach((element) => {
            data[element.id] = undefined;
        });

        this.setState({
            data: data
        });
    }

    handleSubmit() {
        if (this.state.search == undefined || this.state.search == '') alert('Please enter a value into the search field');
        else {
            this.setState({ data: {} });
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
                <Output results={this.state.data} />
            </div>
        )
    }
}

export default App;