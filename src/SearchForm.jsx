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
            corrupted: 'N/A',
            shaperElder: 'N/A',
            iLvl: ['', ''],
            tier: ['', ''],
            quality: ['', '']
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
                    <input id='search-bar' className='form-control' type='text' value={this.state.name} onChange={(e) => this.updateInput('name', e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                    <div id='advanced-form' className={this.props.advanced ? 'show' : ''}>
                        <label htmlFor='type-bar' className='control-label'>Enter the type of item you would like to watch for:</label>
                        <input id='type-bar' className='form-control' type='text' value={this.state.type} onChange={(e) => this.updateInput('type', e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                        <label htmlFor='base-bar' className='control-label'>Enter the item base you would like to watch for:</label>
                        <input id='base-bar' className='form-control' type='text' value={this.state.base} onChange={(e) => this.updateInput('base', e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                        <div className='form-row'>
                            <div className='form-group col-xs-2'>
                                <label htmlFor='sockets-bar' className='control-label'>Sockets:</label>
                                <ul id='sockets-bar' className='list-group list-group-horizontal'>
                                    <li className='list-group-item px-0 py-0' style={{ width: '2rem' }}>
                                        <input style={{ width: '100%', height: '100%' }} type='number' value={this.state.sockets[0]} onChange={(e) => this.updateInput('sockets', [e.target.value, this.state.sockets[1]])} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                                    </li>
                                    <li className='list-group-item px-0 py-0' style={{ width: '2rem' }}>
                                        <input style={{ width: '100%', height: '100%' }} type='number' value={this.state.sockets[1]} onChange={(e) => this.updateInput('sockets', [this.state.sockets[0], e.target.value])} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                                    </li>
                                </ul>
                            </div>
                            <div className='form-group col-xs-2'>
                                <label htmlFor='links-bar' className='control-label'>Links:</label>
                                <ul id='links-bar' className='list-group list-group-horizontal'>
                                    <li className='list-group-item px-0 py-0' style={{ width: '2rem' }}>
                                        <input style={{ width: '100%', height: '100%' }} type='number' value={this.state.links[0]} onChange={(e) => this.updateInput('links', [e.target.value, this.state.links[1]])} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                                    </li>
                                    <li className='list-group-item px-0 py-0' style={{ width: '2rem' }}>
                                        <input style={{ width: '100%', height: '100%' }} type='number' value={this.state.links[1]} onChange={(e) => this.updateInput('links', [this.state.links[0], e.target.value])} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
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
                            <div className='form-group col-xs-1'>
                                <label htmlFor='shaper-elder-select' className='control-label'>Shaper/Elder:</label>
                                <select id='shaper-elder-select' className='form-control' value={this.state.shaperElder} onChange={(e) => this.updateInput('shaperElder', e.target.value)}>
                                    <option value={'shaper'}>Shaper</option>
                                    <option value={'elder'}>Elder</option>
                                    <option value={'either'}>Either</option>
                                    <option value={'neither'}>Neither</option>
                                    <option value={'N/A'}>N/A</option>
                                </select>
                            </div>
                            <div className='form-group col-xs-2'>
                                <label htmlFor='ilvl-bar' className='control-label'>iLvl:</label>
                                <ul id='ilvl-bar' className='list-group list-group-horizontal'>
                                    <li className='list-group-item px-0 py-0' style={{ width: '2rem' }}>
                                        <input style={{ width: '100%', height: '100%' }} type='number' value={this.state.iLvl[0]} onChange={(e) => this.updateInput('iLvl', [e.target.value, this.state.iLvl[1]])} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                                    </li>
                                    <li className='list-group-item px-0 py-0' style={{ width: '2rem' }}>
                                        <input style={{ width: '100%', height: '100%' }} type='number' value={this.state.iLvl[1]} onChange={(e) => this.updateInput('iLvl', [this.state.iLvl[0], e.target.value])} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                                    </li>
                                </ul>
                            </div>
                            <div className='form-group col-xs-2'>
                                <label htmlFor='tier-bar' className='control-label'>Tier:</label>
                                <ul id='tier-bar' className='list-group list-group-horizontal'>
                                    <li className='list-group-item px-0 py-0' style={{ width: '2rem' }}>
                                        <input style={{ width: '100%', height: '100%' }} type='number' value={this.state.tier[0]} onChange={(e) => this.updateInput('tier', [e.target.value, this.state.tier[1]])} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                                    </li>
                                    <li className='list-group-item px-0 py-0' style={{ width: '2rem' }}>
                                        <input style={{ width: '100%', height: '100%' }} type='number' value={this.state.tier[1]} onChange={(e) => this.updateInput('tier', [this.state.tier[0], e.target.value])} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                                    </li>
                                </ul>
                            </div>
                            <div className='form-group col-xs-2'>
                                <label htmlFor='qual-bar' className='control-label'>Quality:</label>
                                <ul id='qual-bar' className='list-group list-group-horizontal'>
                                    <li className='list-group-item px-0 py-0' style={{ width: '2rem' }}>
                                        <input style={{ width: '100%', height: '100%' }} type='number' value={this.state.quality[0]} onChange={(e) => this.updateInput('quality', [e.target.value, this.state.quality[1]])} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                                    </li>
                                    <li className='list-group-item px-0 py-0' style={{ width: '2rem' }}>
                                        <input style={{ width: '100%', height: '100%' }} type='number' value={this.state.quality[1]} onChange={(e) => this.updateInput('quality', [this.state.quality[0], e.target.value])} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='card-footer'>
                    <button className='btn btn-success btn-block' onClick={() => this.props.handleSubmit(buildSearchParams(this.state))}>Search</button>
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