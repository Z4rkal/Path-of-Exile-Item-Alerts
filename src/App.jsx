import React, { Component } from 'react';
import axios from 'axios';
import { CopyToClipboard } from 'react-copy-to-clipboard';

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

class ItemMods extends Component {
    render() {
        return (
            <table style={{ marginLeft: '1.4rem' }}>
                <tbody>
                    {this.props.modifiers.implicit != undefined ? this.props.modifiers.implicit.map((element, index) => (
                        <tr key={this.props.id + ' ' + element + index}>
                            <th>{element}</th>
                        </tr>
                    )) : null}
                    {this.props.modifiers.explicit != undefined ? this.props.modifiers.explicit.map((element, index) => (
                        <tr key={this.props.id + ' ' + element + index}>
                            <td>{element}</td>
                        </tr>
                    )) : null}
                    {this.props.modifiers.crafted != undefined ? this.props.modifiers.crafted.map((element, index) => (
                        <tr key={this.props.id + ' ' + element + index}>
                            <td><span style={{ backgroundColor: '#55c3d3', margin: 'auto 0.8rem auto auto', borderRadius: '2px', padding: '3px', color: '#ffffff' }}>Crafted</span> {element}</td>
                        </tr>
                    )) : null}
                </tbody>
            </table>
        )
    }
}

class Item extends Component {
    constructor(props) {
        super(props);

        this.state = {
            whisper: null
        }
    }

    componentWillMount() {
        this.makeWhisper(this.props.listing);
    }

    extractPrice(note) {
        let result = '';
        let price = /([0-9\.]+) ([a-z]+)/i;
        //let currencyType = /alt|chance|alch|fuse|vaal|chaos|exa/i;

        if (price.test(note)) {
            let extractPrice = price.exec(note);

            result += extractPrice[1];
            result += ' ' + extractPrice[2];
            return result;
        }
        else return 'Price: N/A';
    }

    formatPrice(note) {
        let result = '';
        if (/N\/A/.test(note)) return 'Price: N/A';

        let listingType = /b\\\/o/;
        if (listingType.test(note)) result = 'Fixed price: ';
        else result = 'Asking price: '

        result += this.extractPrice(note);

        return result;
    }

    makeWhisper(listing) {
        if (listing == null || listing == undefined) return null;
        //console.log(listing.stashName);

        //Reference whisper taken from a poe.trade search, it's important to stick to their whisper format
        //'@GrazynaZeSzczecina Hi, I would like to buy your Hypnotic Twirl Paua Ring listed for 1 alteration in Legion (stash tab "S"; position: left 1, top 2)'
        let result = `@${listing.char} Hi, I would like to buy your ${listing.item.name} ${listing.item.note != 'N/A' && this.extractPrice(listing.item.note) != 'Price: N/A' ? `listed for ${this.extractPrice(listing.item.note)} ` : ``} in ${this.props.league}${listing.stashName != undefined && listing.item.position != undefined ? ` (stash tab "${listing.stashName}"; position: left ${listing.item.position[0]}, top ${listing.item.position[1]})` : ``}`

        this.setState({ whisper: result });
    }

    render() {
        if (this.props.listing.id == undefined || this.props.listing.item.id == undefined) return (0)

        return (
            <li className='list-group-item' key={this.props.listing.item.id}>
                <div className='row'>
                    <div className='col-sm-2 hidden-xs'>
                        <img className='img-responsive' src={this.props.listing.item.icon} style={{ marginTop: '6rem', marginLeft: '2rem' }} />
                    </div>
                    <div className='col-xs-12 col-sm-10'>
                        <div className='row'>
                            <div className='col-xs-12'>
                                <p>{this.props.listing.item.corrupted ? (<span style={{ backgroundColor: '#ff6666', margin: 'auto 0.8rem auto auto', borderRadius: '2px', padding: '3px', color: '#ffffff' }}>Corrupted</span>) : null}{this.props.listing.item.name}</p>
                            </div>
                        </div>
                        <div className='row'>
                            <ItemMods id={this.props.listing.id} modifiers={this.props.listing.item.modifiers} />
                        </div>
                        <div className='row'>
                            <div className='col-xs-12'>
                                <p style={{ marginTop: '1rem' }}>{this.formatPrice(this.props.listing.item.note)} | IGN: {this.props.listing.char} | <a href={`https://www.pathofexile.com/account/view-profile/${this.props.listing.acct}`} style={{ color: '#ff4444' }}>Profile</a>{this.state.whisper != null ? (<span> | <CopyToClipboard text={this.state.whisper}><span style={{ color: '#ff4444' }}>Whisper</span></CopyToClipboard></span>) : null}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
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
                                <Item key={element.id} league={this.props.league} listing={element} />
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
            .then(response => this.setState({ league: response.data }), error => console.log(error));

        axios.get('/api/all')
            .then(response => this.initializeData(response.data), error => console.log(error));

        let serverRef = setInterval(() => axios.get('/api/cur').then(response => this.handleNewData(response.data), error => { clearInterval(serverRef); console.log(error) }), 1000 * 4);
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
                data[Object.entries(data)[0][1].id] = undefined;
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