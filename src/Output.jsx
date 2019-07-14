import React, { Component } from 'react';
import Item from './Item';

class Output extends Component {
    sortByValue(a,b) {
        if(b.item.chaos != 'N/A' && a.item.chaos != 'N/A') return a.item.chaos - b.item.chaos;
        if(b.item.chaos != 'N/A' && a.item.chaos == 'N/A') return 1;
        if(b.item.chaos == 'N/A' && a.item.chaos != 'N/A') return -1;
        return b.item.time - a.item.time;
    }

    render() {
        // console.log(this.props.results);
        if (Object.entries(this.props.results).length != 0)
            return (
                <div className='panel panel-info'>
                    <div className='panel-heading'>
                        <div className='row'>
                            <span className='col-xs-10'>Results</span>
                            <select className='col-xs-2' value={this.props.sortStyle} onChange={(e) => this.props.updateInput('sortStyle', e.target.value)}>
                                <option value='age'>Sort by age</option>
                                <option value='price'>Sort by price</option>
                            </select>
                        </div>
                    </div>
                    <div className='panel-body'>
                        <ul className='list-group'>
                            {this.props.sortStyle == 'age'? Object.entries(this.props.results).sort(([, a], [, b]) => (b.item.time - a.item.time)).map(([, element]) => (
                                <Item key={element.id} league={this.props.league} listing={element} />
                            )) : Object.entries(this.props.results).sort(([, a], [, b]) => this.sortByValue(a,b)).map(([, element]) => (
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