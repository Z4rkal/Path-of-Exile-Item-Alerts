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
                modifiers: [{ text: '', min: '', max: '' }],
                type: 'and',
                min: ``,
                max: ``
            }]
        }
    }

    updateInput(field, value) {
        this.setState({
            [field]: value
        });
    }

    createNewModGroup() {
        this.setState({ //No cap on number for now, but if this were meant to be a multi-user thing then that would be abusable
            modSearch: [...this.state.modSearch, { modifiers: [{ text: '', min: '', max: '' }], type: 'and', min: ``, max: `` }]
        });
    }

    removeModGroup(index) {
        let fields = this.state.modSearch;
        fields.splice(index, 1);

        this.setState({
            modSearch: fields
        });
    }

    updateModGroup(type, e, groupIndex, modIndex) {
        let { modSearch } = this.state;

        if (e)
            e.persist();
        let value = e && e.target ? e.target.value : '';
        const initialLength = value.length;
        let cursorStart = false;

        switch (type) {
            case 'type':
                modSearch[groupIndex].type = value;
                modSearch[groupIndex].min = '';
                modSearch[groupIndex].max = '';
                break;
            case 'add':
                modSearch[groupIndex].modifiers.push({ text: '', min: '', max: '' });
                break;
            case 'remove':
                modSearch[groupIndex].modifiers.splice(modIndex, 1);
                if (modSearch[groupIndex].type === 'count') {
                    modSearch[groupIndex].min = Math.min(modSearch[groupIndex].min, modSearch[groupIndex].modifiers.length);
                    modSearch[groupIndex].max = Math.min(modSearch[groupIndex].max, modSearch[groupIndex].modifiers.length);
                }
                break;
            case 'mod-text':
                let modified = false;

                if (value.length <= modSearch[groupIndex].modifiers[modIndex].text.length)
                    value = value.replace(/(?:[\+\-])(\ |[^\W\d]|$)/g, (match, p1) => { modified = true; return p1 });

                const denumPat = /(?:([0-9#]+)(?=\ |$))|(?:([0-9]+|#{1,})(?=[^\W\d]))/g;
                const filterPat = /[^\w\ \+\-#%]+|\_+/g;
                const hashPat = /([\+\-])(?=\ |$)|(?:\ |^)(%)/g;
                const sanPat = /(?:[^\w\ \+\-]|\d|[\+\-])*?((?:\+(?:#%|#)|\-(?:#%|#)|(?:#%|#)))(?:[^\w\ ]|\d)*(?=\ |$)|(?:[^\w\ ]|\d)*([^\W\d]+)(?:[^\w\ ]|\d)*/g;
                const firstCharPat = /(?:\ |^)[^\W\d]/g;

                const denumberedText = value.replace(denumPat, (match, p1) => { modified = true; return p1 ? `#` : `` });
                const filteredText = denumberedText.replace(filterPat, () => { modified = true; return `` });
                const hashAutofill = filteredText.replace(hashPat, (match, p1, p2) => { modified = true; return `${p1 || ` `}#${p2 || ``}` });
                const sanitizedText = hashAutofill.replace(sanPat, (match, p1, p2) => { modified = true; return `${p1 || ``}${p2 || ``}` });
                const formattedText = sanitizedText.toLowerCase().replace(firstCharPat, (match) => { modified = true; return match.toUpperCase() });

                if (modified) {
                    if (formattedText.length === initialLength - 1)
                        cursorStart = e && e.target ? Math.max(e.target.selectionStart - 1, 0) : false;
                    else if (formattedText.length > initialLength)
                        cursorStart = e && e.target ? Math.max(e.target.selectionStart + 1, 0) : false;
                    else
                        cursorStart = e && e.target ? Math.max(e.target.selectionStart, 0) : false;
                }
                modSearch[groupIndex].modifiers[modIndex].text = formattedText;
                break;
            case 'mod-min':
                modSearch[groupIndex].modifiers[modIndex].min = value.slice(0, 4).match(/[0-9]+/g) ? value.slice(0, 4).match(/[0-9]+/g).join('') : '';;
                break;
            case 'mod-max':
                modSearch[groupIndex].modifiers[modIndex].max = value.slice(0, 4).match(/[0-9]+/g) ? value.slice(0, 4).match(/[0-9]+/g).join('') : '';;
                break;
            case 'group-min':
            case 'group-max':
                if (modSearch[groupIndex].type === 'sum')
                    switch (type) {
                        case 'group-min':
                            modSearch[groupIndex].min = value.slice(0, 4).match(/[0-9]+/g) ? value.slice(0, 4).match(/[0-9]+/g).join('') : '';
                            break;
                        case 'group-max':
                            modSearch[groupIndex].max = value.slice(0, 4).match(/[0-9]+/g) ? value.slice(0, 4).match(/[0-9]+/g).join('') : '';
                            break;
                    }
                else if (modSearch[groupIndex].type === 'count') {
                    const numMods = modSearch[groupIndex].modifiers.length;
                    const adjustedValue = value.slice(0, 4).match(/[0-9]+/g) ? Math.min(parseInt(value.slice(0, 4).match(/[0-9]+/g).join('')), numMods).toString() : '';
                    switch (type) {
                        case 'group-min':
                            modSearch[groupIndex].min = adjustedValue;
                            break;
                        case 'group-max':
                            modSearch[groupIndex].max = adjustedValue;
                            break;
                    }
                }
                break;
            default: throw new Error(`updateModGroup got called with an invalid type >:(`);
        }
        this.setState({
            modSearch: modSearch
        }, () => {
            if (e && e.target && cursorStart)
                e.target.setSelectionRange(cursorStart, cursorStart);
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
                        <div className='form-group row'>
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
                        <hr></hr>
                        <div className='row'>
                            <div className='col-auto'><span>Modifier Groups:</span></div>
                            <div className='col'></div>
                            <div className='col-auto'>
                                <a href='https://pathofexile.gamepedia.com/List_of_item_mods' className='my-2 my-sm-2 px-4'>Modifiers<span className='hide-xs'> Wiki Page</span></a>
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-auto'>
                                <p>Searching by modifier is currently regex based, so make sure you don't make any typos and check the wiki if you aren't sure how a modifier is worded.</p>
                            </div>
                        </div>
                        {modSearch.map((group, index) => (
                            <React.Fragment key={`Mod Group: ${index}`}>
                                <div className='form-group row mb-3' alt={`Modifier group ${index} container`}>
                                    {group.modifiers.map((modifier, modIndex) => (
                                        <div className='form-group col-12 mb-1' key={`Mod Group: ${index}, Mod: ${modIndex}`}>
                                            <div className='input-group mb-1'>
                                                <input className='form-control mod-text' type='text' value={modSearch[index].modifiers[modIndex].text} onChange={(e) => this.updateModGroup('mod-text', e, index, modIndex)} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                                                <input className='form-control mod-value' type='text' placeholder='Min' value={modSearch[index].modifiers[modIndex].min} onChange={(e) => this.updateModGroup('mod-min', e, index, modIndex)} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                                                <input className='form-control mod-value' type='text' placeholder='Max' value={modSearch[index].modifiers[modIndex].max} onChange={(e) => this.updateModGroup('mod-max', e, index, modIndex)} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                                                <div className='input-group-append'>
                                                    <button className='btn btn-outline-danger' onClick={() => this.updateModGroup('remove', null, index, modIndex)}>{`-`/*&#U+1F5D1*/}</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className='form-group row mb-3'>
                                    <div className='col-auto'>
                                        {modSearch[index].type !== 'sum' && modSearch[index].type !== 'count' ?
                                            <select className='custom-select search-select' value={modSearch[index].type} onChange={(e) => this.updateModGroup('type', e, index)}>
                                                <option value={'and'}>And</option>
                                                <option value={'sum'}>Sum</option>
                                                <option value={'count'}>Count</option>
                                                <option value={'not'}>Not</option>
                                            </select> :
                                            <div className='input-group ml-1'>
                                                <select className='custom-select search-select' value={modSearch[index].type} onChange={(e) => this.updateModGroup('type', e, index)}>
                                                    <option value={'and'}>And</option>
                                                    <option value={'sum'}>Sum</option>
                                                    <option value={'count'}>Count</option>
                                                    <option value={'not'}>Not</option>
                                                </select>
                                                <input className='form-control count-sum' placeholder='Min' value={modSearch[index].min} onChange={(e) => this.updateModGroup('group-min', e, index)} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                                                <input className='form-control count-sum' placeholder='Max' value={modSearch[index].max} onChange={(e) => this.updateModGroup('group-max', e, index)} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(buildSearchParams(this.state)); }}></input>
                                            </div>}
                                    </div>
                                    <div className='col'></div>
                                    <div className='col-auto btn-group' role='group'>
                                        <button className='btn btn-outline-success' onClick={() => this.updateModGroup('add', null, index)} alt={`Add modifier to group ${index}`}>{`+`}</button>
                                        <button className='btn btn-outline-danger' onClick={() => this.removeModGroup(index)} alt={`Remove modifier group ${index}`}>{`-`/*&#U+1F5D1*/}</button>
                                    </div>
                                </div>
                                {index !== modSearch.length - 1 ? <hr></hr> : null}
                            </React.Fragment>
                        ))}
                        <div className='row'>
                            <div className='col'></div>
                            <div className='col-auto'>
                                <button className='btn btn-outline-info' onClick={() => this.createNewModGroup()} alt={`Create new modifier group`}>{`+`}</button>
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