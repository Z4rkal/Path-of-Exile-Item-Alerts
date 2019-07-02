import React, { Component } from 'react';
import Item from './Item';

class Output extends Component {
    render() {
        // console.log(this.props.results);
        if (Object.entries(this.props.results).length != 0)
            return (
                <div className='panel panel-info'>
                    <div className='panel-heading lead'>Results</div>
                    <div className='panel-body'>
                        <ul className='list-group'>
                            {Object.entries(this.props.results).sort(([, a], [, b]) => (b.item.time - a.item.time)).map(([, element]) => (
                                <Item key={element.id} league={this.props.league} listing={element} />
                            ))}
                        </ul>
                    </div>
                </div>
            );
        return (<div></div>);
    }
}

export default Output;