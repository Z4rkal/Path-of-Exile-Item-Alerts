import React, { Component } from 'react';
import buildSearchParams from './lib/functions/buildSearchParams';

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
            rarity: 'N/A',
            iLvl: ['', ''],
            tier: ['', ''],
            quality: ['', ''],
            modSearch: [{
                modifiers: [''],
                type: 'and'
            }]
        }
    }

    updateInput(field, value) {
        this.setState({
            [field]: value
        });
    }

    createNewModGroup() {
        this.setState({
            modSearch: [...this.state.modSearch, { modifiers: [''], type: 'and' }]
        });
    }

    removeModGroup(index) {
        let fields = this.state.modSearch;
        fields.splice(index, 1);

        this.setState({
            modSearch: fields
        });
    }

    updateModGroup(type, value, groupIndex, modIndex) {
        let { modSearch } = this.state;

        switch (type) {
            case 'type':
                modSearch[groupIndex].type = value;
                break;
            case 'add':
                modSearch[groupIndex].modifiers.push(value);
                break;
            case 'remove':
                modSearch[groupIndex].modifiers.splice(modIndex, 1);
                break;
            case 'write':
                modSearch[groupIndex].modifiers[modIndex] = value;
                break;
            default: throw new Error(`updateModGroup got called with an invalid type >:(`);
        }

        this.setState({
            modSearch: modSearch
        });
    }

    render() {
        const { name, type, base, sockets, links, corrupted, shaperElder, rarity, iLvl, tier, quality, modSearch } = this.state;

        return (
            <div className='card bg-light'>
                <div className='card-body'>
                    <label htmlFor='search-bar' className='control-label'>Enter the name of the item you would like to watch for:</label>
                    <input id='search-bar' className='form-control' type='text' value={name} onChange={(e) => this.updateInput('name', e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                    <div id='advanced-form' className={this.props.advanced ? 'show' : ''} style={{ marginTop: '0.25rem' }}>
                        <label htmlFor='type-bar' className='control-label'>Enter the type of item you would like to watch for:</label>
                        <input id='type-bar' className='form-control' type='text' value={type} onChange={(e) => this.updateInput('type', e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                        <label htmlFor='base-bar' className='control-label'>Enter the item base you would like to watch for:</label>
                        <input id='base-bar' className='form-control' type='text' value={base} onChange={(e) => this.updateInput('base', e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                        <div className='form-row'>
                            <div className='form-group col-auto'>
                                <label htmlFor='sockets-bar' className='control-label'>Sockets:</label>
                                <ul id='sockets-bar' className='list-group list-group-horizontal'>
                                    <li className='list-group-item px-0 py-0' style={{ width: '2rem' }}>
                                        <input style={{ width: '100%', height: '100%' }} type='number' value={sockets[0]} onChange={(e) => this.updateInput('sockets', [e.target.value, sockets[1]])} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                                    </li>
                                    <li className='list-group-item px-0 py-0' style={{ width: '2rem' }}>
                                        <input style={{ width: '100%', height: '100%' }} type='number' value={sockets[1]} onChange={(e) => this.updateInput('sockets', [sockets[0], e.target.value])} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                                    </li>
                                </ul>
                            </div>
                            <div className='form-group col-auto'>
                                <label htmlFor='links-bar' className='control-label'>Links:</label>
                                <ul id='links-bar' className='list-group list-group-horizontal'>
                                    <li className='list-group-item px-0 py-0' style={{ width: '2rem' }}>
                                        <input style={{ width: '100%', height: '100%' }} type='number' value={links[0]} onChange={(e) => this.updateInput('links', [e.target.value, links[1]])} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                                    </li>
                                    <li className='list-group-item px-0 py-0' style={{ width: '2rem' }}>
                                        <input style={{ width: '100%', height: '100%' }} type='number' value={links[1]} onChange={(e) => this.updateInput('links', [links[0], e.target.value])} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                                    </li>
                                </ul>
                            </div>
                            <div className='form-group col-auto'>
                                <label htmlFor='ilvl-bar' className='control-label'>iLvl:</label>
                                <ul id='ilvl-bar' className='list-group list-group-horizontal'>
                                    <li className='list-group-item px-0 py-0' style={{ width: '2rem' }}>
                                        <input style={{ width: '100%', height: '100%' }} type='number' value={iLvl[0]} onChange={(e) => this.updateInput('iLvl', [e.target.value, iLvl[1]])} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                                    </li>
                                    <li className='list-group-item px-0 py-0' style={{ width: '2rem' }}>
                                        <input style={{ width: '100%', height: '100%' }} type='number' value={iLvl[1]} onChange={(e) => this.updateInput('iLvl', [iLvl[0], e.target.value])} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                                    </li>
                                </ul>
                            </div>
                            <div className='form-group col-auto'>
                                <label htmlFor='tier-bar' className='control-label'>Tier:</label>
                                <ul id='tier-bar' className='list-group list-group-horizontal'>
                                    <li className='list-group-item px-0 py-0' style={{ width: '2rem' }}>
                                        <input style={{ width: '100%', height: '100%' }} type='number' value={tier[0]} onChange={(e) => this.updateInput('tier', [e.target.value, tier[1]])} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                                    </li>
                                    <li className='list-group-item px-0 py-0' style={{ width: '2rem' }}>
                                        <input style={{ width: '100%', height: '100%' }} type='number' value={tier[1]} onChange={(e) => this.updateInput('tier', [tier[0], e.target.value])} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                                    </li>
                                </ul>
                            </div>
                            <div className='form-group col-auto'>
                                <label htmlFor='qual-bar' className='control-label'>Quality:</label>
                                <ul id='qual-bar' className='list-group list-group-horizontal'>
                                    <li className='list-group-item px-0 py-0' style={{ width: '2rem' }}>
                                        <input style={{ width: '100%', height: '100%' }} type='number' value={quality[0]} onChange={(e) => this.updateInput('quality', [e.target.value, quality[1]])} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                                    </li>
                                    <li className='list-group-item px-0 py-0' style={{ width: '2rem' }}>
                                        <input style={{ width: '100%', height: '100%' }} type='number' value={quality[1]} onChange={(e) => this.updateInput('quality', [quality[0], e.target.value])} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                                    </li>
                                </ul>
                            </div>
                            <div className='w-100 d-block d-lg-none'></div>
                            <div className='form-group col-auto'>
                                <label htmlFor='corrupted-select' className='control-label'>Corrupted:</label>
                                <select id='corrupted-select' className='form-control search-select px-1' value={corrupted} onChange={(e) => this.updateInput('corrupted', e.target.value)}>
                                    <option value={true}>True</option>
                                    <option value={false}>False</option>
                                    <option value={'N/A'}>N/A</option>
                                </select>
                            </div>
                            <div className='form-group col-auto'>
                                <label htmlFor='shaper-elder-select' className='control-label'>Shaper/Elder:</label>
                                <select id='shaper-elder-select' className='form-control search-select px-1' value={shaperElder} onChange={(e) => this.updateInput('shaperElder', e.target.value)}>
                                    <option value={'shaper'}>Shaper</option>
                                    <option value={'elder'}>Elder</option>
                                    <option value={'either'}>Either</option>
                                    <option value={'neither'}>Neither</option>
                                    <option value={'N/A'}>N/A</option>
                                </select>
                            </div>
                            <div className='form-group col-auto'>
                                <label htmlFor='rarity-select' className='control-label'>Rarity:</label>
                                <select id='rarity-select' className='form-control search-select px-1' value={rarity} onChange={(e) => this.updateInput('rarity', e.target.value)}>
                                    <option value={'normal'}>Normal</option>
                                    <option value={'magic'}>Magic</option>
                                    <option value={'rare'}>Rare</option>
                                    <option value={'unique'}>Unique</option>
                                    <option value={'non-unique'}>Non-Unique</option>
                                    <option value={'N/A'}>N/A</option>
                                </select>
                            </div>
                        </div>
                        {modSearch.map((group, index) => (
                            <React.Fragment key={`Mod Group: ${index}`}>
                                <div className='form-row mb-3'>
                                    {group.modifiers.map((modifier, modIndex) => (
                                        <div className='form-group col-12' key={`Mod Group: ${index}, Mod: ${modIndex}`}>
                                            <div className='input-group mb-1'>
                                                <input className='form-control' type='text' value={modSearch[index].modifiers[modIndex]} onChange={(e) => this.updateModGroup('write', e.target.value, index, modIndex)}></input>
                                                <div className='input-group-append'>
                                                    <button className='btn btn-outline-danger' onClick={() => this.updateModGroup('remove', null, index, modIndex)}>{`&#U+1F5D1`}</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div col></div>
                                <button className='col-auto btn btn-outline-success' onClick={() => this.updateModGroup('add', '', index)}><strong>+</strong></button>
                                <div className='form-row'>
                                    <select className='col-auto' value={modSearch[index].type} onChange={(e) => this.updateModGroup('type', e.target.value, index)}>
                                        <option value={'and'}>And</option>
                                        <option value={'sum'}>Sum</option>
                                        <option value={'count'}>Count</option>
                                        <option value={'not'}>Not</option>
                                    </select>
                                    <div col></div>
                                    <button className='col-auto btn btn-outline-danger' onClick={() => this.removeModGroup(index)}>{`&#U+1F5D1`}</button>
                                </div>
                            </React.Fragment>
                        ))}
                        <button className='btn btn-outline-info' onClick={() => this.createNewModGroup()}>+</button>
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