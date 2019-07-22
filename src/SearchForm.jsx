import React, { Component } from 'react';

class SearchForm extends Component {
    constructor() {
        super();
        this.state = {
            name: '',
            search: {}
        }
    }

    updateInput(field, value) {
        this.setState({
            [field]: value
        });
    }

    render() {
        return (
            <div className='card bg-light' style={{marginBottom: '2rem'}}>
                <div className='card-body'>
                    <label htmlFor='search-bar' className='control-label'>Enter the name of the item you would like to watch for:</label>
                    <input id='search-bar' className='form-control' type='text' value={this.state.name} onChange={(e) => this.updateInput('name', e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(this.state.name); }}></input>
                </div>
                <div className='card-footer'>
                    <button className='btn btn-success btn-block' onClick={() => this.props.handleSubmit(this.state.name)}>Search</button>
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