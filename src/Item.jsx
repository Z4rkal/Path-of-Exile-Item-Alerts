import React, { Component } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import formatTime from './lib/formatTime';

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
            copied: false,
            whisper: null
        }
    }

    componentWillMount() {
        this.makeWhisper(this.props.listing);
    }

    makeWhisper(listing) {
        if (listing == null || listing == undefined) return null;
        //console.log(listing.stashName);

        //Reference whisper taken from a poe.trade search, it's important to stick to their whisper format
        //'@GrazynaZeSzczecina Hi, I would like to buy your Hypnotic Twirl Paua Ring listed for 1 alteration in Legion (stash tab "S"; position: left 1, top 2)'
        let result = `@${listing.char} Hi, I would like to buy your ${listing.item.name} ${listing.item.note != 'Price: N/A' ? `listed for ${/[0-9]+ [a-z ]+$/i.exec(listing.item.note)[0]}` : ``} in ${this.props.league}${listing.stashName != undefined && listing.item.position != undefined ? ` (stash tab "${listing.stashName}"; position: left ${listing.item.position[0]}, top ${listing.item.position[1]})` : ``}`

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
                                <div className='row'>
                                    <p className='col-xs-8'>{this.props.listing.item.corrupted ? (<span style={{ backgroundColor: '#ff6666', margin: 'auto 0.8rem auto auto', borderRadius: '2px', padding: '3px', color: '#ffffff' }}>Corrupted</span>) : null}{this.props.listing.item.name}</p><p style={{textAlign: 'right'}} className='col-xs-4'>{formatTime(this.props.listing.item.time)}</p>
                                </div>
                            </div>
                        </div>
                        <div className='row'>
                            <ItemMods id={this.props.listing.id} modifiers={this.props.listing.item.modifiers} />
                        </div>
                        <div className='row'>
                            <div className='col-xs-12'>
                                <p style={{ marginTop: '1rem' }}>{this.props.listing.item.note} | IGN: {this.props.listing.char} | <a href={`https://www.pathofexile.com/account/view-profile/${this.props.listing.acct}`} style={{ color: '#ff4444' }}>Profile</a>{this.state.whisper != null ? (<span> | <CopyToClipboard text={this.state.whisper} onCopy={() => this.setState({ copied: true })}>{this.state.copied == false ? <span style={{ color: '#ff4444' }}>Whisper</span> : <span style={{ color: '#ff4444' }}>Copied to Clipboard</span>}</CopyToClipboard></span>) : null}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        )
    }
}

export default Item;