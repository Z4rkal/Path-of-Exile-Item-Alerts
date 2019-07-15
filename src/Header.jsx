import React, { Component } from 'react';

class Header extends Component {
    render() {
        return (
            <div className='panel panel-default'>
                <div className='panel-heading'>
                    <div className='row'>
                        <span className='col-xs-10'>PoE Live Search Tool</span>
                        <a href='https://pathofexile.gamepedia.com/Path_of_Exile_Wiki' className='col-xs-2'>Wiki Link</a>
                    </div>
                </div>
                <div className='panel-body'>
                    <label htmlFor='search-bar' className='control-label'>Enter the name of the item you would like to watch for:</label>
                    <input id='search-bar' className='form-control' type='text' value={this.props.search} onChange={(e) => this.props.updateInput('search', e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') this.props.handleSubmit(); }}></input>
                </div>
                <div className='panel-footer'>
                    <button className='btn btn-success btn-block' onClick={() => this.props.handleSubmit()}>Search</button>
                </div>
            </div>
        )
    }
}

export default Header;

//Advanced search wireframe?
/*
    Button to expand header to include more than just a name field
        -field for type and base
        -field for links and sockets
        -field for stats?

        -field for modifier groups
        
        -options for corrupted, shaped, elder, ilvl, quality, price, etc.
*/