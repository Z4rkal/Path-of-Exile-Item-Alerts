import React, { Component } from 'react';
import buildSearchParams from './lib/buildSearchParams';

class SearchForm extends Component {
    constructor() {
        super();
        this.state = {
            name: '',
            type: '',
            base: '',
            sockets: ['', ''],
            links: ['', ''],
            corrupted: 'N/A'
        }
    }

    updateInput(field, value) {
        this.setState({
            [field]: value
        });
    }

    render() {
        return (
            <div className='card bg-light'>
                <div className='card-body'>
                    <label htmlFor='search-bar' className='control-label'>Enter the name of the item you would like to watch for:</label>
                    <input id='search-bar' className='form-control' type='text' value={this.state.name} onChange={(e) => this.updateInput('name', e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state, this.props.advanced)); }}></input>
                    <div id='advanced-form' className={this.props.advanced ? 'show' : ''}>
                        <label htmlFor='type-bar' className='control-label'>Enter the type of item you would like to watch for:</label>
                        <input id='type-bar' className='form-control' type='text' value={this.state.type} onChange={(e) => this.updateInput('type', e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state, this.props.advanced)); }}></input>
                        <label htmlFor='base-bar' className='control-label'>Enter the item base you would like to watch for:</label>
                        <input id='base-bar' className='form-control' type='text' value={this.state.base} onChange={(e) => this.updateInput('base', e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state, this.props.advanced)); }}></input>
                        <div className='form-row'>
                            <div className='form-group col-xs-2'>
                                <label htmlFor='sockets-bar' className='control-label'>Sockets:</label>
                                <ul id='sockets-bar' className='list-group list-group-horizontal'>
                                    <li className='list-group-item px-0 py-0' style={{width: '2rem'}}>
                                        <input style={{ width: '100%', height: '100%' }} type='number' value={this.state.sockets[0]} onChange={(e) => this.updateInput('sockets', [e.target.value, this.state.sockets[1]])} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state, this.props.advanced)); }}></input>
                                    </li>
                                    <li className='list-group-item px-0 py-0' style={{width: '2rem'}}>
                                        <input style={{ width: '100%', height: '100%' }} type='number' value={this.state.sockets[1]} onChange={(e) => this.updateInput('sockets', [this.state.sockets[0], e.target.value])} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state, this.props.advanced)); }}></input>
                                    </li>
                                </ul>
                            </div>
                            <div className='form-group col-xs-2'>
                                <label htmlFor='links-bar' className='control-label'>Links:</label>
                                <ul id='links-bar' className='list-group list-group-horizontal'>
                                    <li className='list-group-item px-0 py-0' style={{width: '2rem'}}>
                                        <input style={{ width: '100%', height: '100%' }} type='number' value={this.state.links[0]} onChange={(e) => this.updateInput('links', [e.target.value, this.state.links[1]])} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state, this.props.advanced)); }}></input>
                                    </li>
                                    <li className='list-group-item px-0 py-0' style={{width: '2rem'}}>
                                        <input style={{ width: '100%', height: '100%' }} type='number' value={this.state.links[1]} onChange={(e) => this.updateInput('links', [this.state.links[0], e.target.value])} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state, this.props.advanced)); }}></input>
                                    </li>
                                </ul>
                            </div>
                            <div className='form-group col-xs-1'>
                                <label htmlFor='corrupted-select' className='control-label'>Corrupted:</label>
                                <select id='corrupted-select' className='form-control' value={this.state.corrupted} onChange={(e) => this.updateInput('corrupted', e.target.value)}>
                                    <option value={true}>True</option>
                                    <option value={false}>False</option>
                                    <option value={'N/A'}>N/A</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='card-footer'>
                    <button className='btn btn-success btn-block' onClick={() => this.props.handleSubmit(buildSearchParams(this.state, this.props.advanced))}>Search</button>
                </div>
            </div>
        )
    }
}

export default SearchForm;

//Advanced search wireframe?
/*
    Button to expand header to include more than just a name field
        -field for type and base
        -field for links and sockets
        -field for stats?

        -field for modifier groups

        -options for corrupted, shaped, elder, ilvl, quality, price, etc.
*/