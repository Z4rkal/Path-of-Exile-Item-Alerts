import React, { Component } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import formatTime from './lib/functions/formatTime';
import ItemMods from './ItemMods';
import ItemProps from './ItemProps';

class Item extends Component {
    constructor(props) {
        super(props);

        this.state = {
            copied: false,
            whisper: null
        }
    }

    componentDidMount() {
        this.makeWhisper(this.props.listing);
    }

    setSort(type) {
        this.props.updateInput('mod', { text: '', pattern: /^$/, numVals: 0, type: '' });
        this.props.updateInput('prop', '');
        this.props.updateInput('sortStyle', type);
    }

    makeWhisper(listing) {
        if (listing == null || listing == undefined) return null;
        //console.log(listing.stashName);

        //Reference whisper taken from a poe.trade search, it's important to mostly stick to their whisper format for a smooth trading experience
        //'@GrazynaZeSzczecina Hi, I would like to buy your Hypnotic Twirl Paua Ring listed for 1 alteration in Legion (stash tab "S"; position: left 1, top 2)'
        try {
            let result = `@${listing.char} Hi, I would like to buy your ${listing.item.name} ${listing.item.note != 'Price: N/A' ? `listed for ${/[0-9]+ [a-z ']+$/i.exec(listing.item.note)[0]}` : ``} in ${this.props.league}${listing.stashName != undefined && listing.item.position != undefined ? ` (stash tab "${listing.stashName}"; position: left ${listing.item.position[0]}, top ${listing.item.position[1]})` : ``}`;
            this.setState({ whisper: result });
        }
        catch (error) {
            console.log('!!!!!!!!!!!! The mystical null note has appeared :O !!!!!!!!!!!!');
            console.log(`Error: ${error}`);
            console.log(`Note: ${listing.item.note}`);
            console.log(`Entire listing: ${JSON.stringify(listing)}`);
            this.setState({ whisper: 'Failed to generate whisper' });
        }
    }

    renderSockets(sockets, type) {
        if (!sockets) return null;

        let prevGroup = -1;
        const socketsInfo = sockets.map((socket, index) => {
            let socketAttr;
            switch (socket.attr) {
                case 'G':
                    socketAttr = 'gen';
                    break;
                case 'I':
                    socketAttr = 'int';
                    break;
                case 'D':
                    socketAttr = 'dex';
                    break;
                case 'S':
                    socketAttr = 'str';
                    break;
                case 'A':
                    socketAttr = 'aby';
                    break;
                default: throw new Error(`Invalid socket attribute: ${socket.attr}`);
            }


            let orient;
            if (!type || type !== 'One Handed') {
                if (index % 2 === 0)
                    orient = 'v_link';
                else orient = 'h_link';
            }
            else
                orient = 'v_link';

            const socketInfo = {
                link: socket.group === prevGroup ? `/sockets/${orient}.png` : false,
                src: `/sockets/${socketAttr}.png`
            };

            prevGroup = socket.group;

            return socketInfo;

        })

        return (
            <div className='position-absolute sockets'>
                {socketsInfo.map((socket, index) => (
                    <React.Fragment key={this.props.listing.item.id + ' socket: ' + index}>
                        {socket.link ? <img className={`position-absolute ${type === 'One Handed' ? `v-` : ``}link-${index}`} src={socket.link} /> : null}
                        <img className={`position-absolute ${type === 'One Handed' ? `v-` : ``}socket-${index}`} src={socket.src} />
                    </React.Fragment>
                ))}
            </div>
        );
    }

    render() {
        if (this.props.listing.id == undefined || this.props.listing.item.id == undefined) return (0)

        const ONE_PATTERN = /^one|^dagger|^wand/i;

        let oneHanded = false;
        if (this.props.listing.item.type === 'Gnarled Branch' || (this.props.listing.item.category && this.props.listing.item.category.weapons && ONE_PATTERN.test(this.props.listing.item.category.weapons)))
            oneHanded = true;

        return (
            <li className='list-group-item' key={this.props.listing.item.id}>
                <div className='row h-100'>
                    <div className='col-sm-auto d-none d-sm-flex mx-auto my-auto icon-sockets-div'>
                        <img className='img-fluid' src={this.props.listing.item.icon} />
                        {oneHanded ? this.renderSockets(this.props.listing.item.sockets, 'One Handed') : this.renderSockets(this.props.listing.item.sockets)}
                    </div>
                    <div className='col'>
                        <div className='row justify-content-between'>
                            <p className='col-xs-auto'>
                                {this.props.listing.item.corrupted ? (<span style={{ backgroundColor: '#ff6666', margin: 'auto 0.8rem auto auto', borderRadius: '2px', padding: '3px', color: '#ffffff' }}>Corrupted</span>) : null}
                                {this.props.listing.item.shaperElder ? (<span style={this.props.listing.item.shaperElder == 'shaper' ? { backgroundColor: '#9a669a', margin: 'auto 0.8rem auto auto', borderRadius: '2px', padding: '3px', color: '#ffffff' } : { backgroundColor: '#444444', margin: 'auto 0.8rem auto auto', borderRadius: '2px', padding: '3px', color: '#ffffff' }}>{this.props.listing.item.shaperElder == 'shaper' ? `Shaped` : `Elder`}</span>) : null}
                                {this.props.listing.item.name ? (`${this.props.listing.item.name}, ${this.props.listing.item.type}`) : (`${this.props.listing.item.type}`)}
                            </p>
                            <p style={{ textAlign: 'right' }} className='col-xs-auto' onClick={() => this.setSort('age')}><span className={`hover${this.props.sortStyle === 'age' ? ` sort-highlight` : ``}`}>{formatTime(this.props.listing.item.time)}</span></p>
                        </div>
                        <div className='row'>
                            <div className='col-xs-auto'>
                                <ItemMods id={this.props.listing.id} modifiers={this.props.listing.item.modifiers} updateInput={this.props.updateInput} mod={this.props.mod} />
                            </div>
                            {this.props.listing.item.properties ? <div className='col'>
                                <ItemProps id={this.props.listing.id} properties={this.props.listing.item.properties} updateInput={this.props.updateInput} prop={this.props.prop} />
                            </div> : null}
                        </div>
                        <div className='row'>
                            <div className='col-xs-auto'>
                                <p style={{ marginTop: '1rem' }}><span className={`hover${this.props.sortStyle === 'price' ? ` sort-highlight` : ``}`} onClick={() => this.setSort('price')}>{this.props.listing.item.note}</span> | IGN: {this.props.listing.char} | <a href={`https://www.pathofexile.com/account/view-profile/${this.props.listing.acct}`} style={{ color: '#ff4444' }}>Profile</a>{this.state.whisper != null ? (<span> | <CopyToClipboard text={this.state.whisper} onCopy={() => this.setState({ copied: true })}>{this.state.copied == false ? <span style={{ color: '#ff4444' }}>Whisper</span> : <span style={{ color: '#ff4444' }}>Copied to Clipboard</span>}</CopyToClipboard></span>) : null}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        )
    }
}

export default Item;