import React, { Component } from 'react';

class Header extends Component {
    render() {
        return (
            <nav className='navbar navbar-expand-lg navbar-light bg-light' style={{marginBottom: '2rem'}}>
                <div className='container'>
                    <a className='navbar-brand'>PoE Live Search Tool</a>
                    <span className='navbar-text'>
                        <button className='btn btn-sm btn-light' data-toggle="collapse" data-target="#advanced-form" onClick={() => this.props.updateInput('advanced', !this.props.advanced)}>Advanced<span className='hidden-xs'> Search</span></button>
                        <a href='https://pathofexile.gamepedia.com/Path_of_Exile_Wiki' className='my-2 my-sm-2 px-4'>Wiki<span className='hidden-xs'> Link</span></a>
                    </span>
                </div>
            </nav>
        )
    }
}

export default Header;