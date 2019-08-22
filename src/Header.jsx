import React, { Component } from 'react';

class Header extends Component {
    render() {
        return (
            <nav className='navbar navbar-expand-lg navbar-light bg-light'>
                <div className='container'>
                    <a className='navbar-brand'>PoE Live Search Tool</a>
                    <span className='navbar-text'>
                        <button className='btn btn-sm btn-light' onClick={() => this.props.updateInput('advanced', !this.props.advanced)}>Advanced<span className='hide-xs'> Search</span></button>
                        <a href='https://pathofexile.gamepedia.com/Path_of_Exile_Wiki' className='my-2 my-sm-2 px-4'>Wiki<span className='hide-xs'> Link</span></a>
                    </span>
                </div>
            </nav>
        )
    }
}

export default Header;