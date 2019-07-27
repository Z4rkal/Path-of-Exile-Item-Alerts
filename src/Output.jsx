import React, { Component } from 'react';
import Item from './Item';

class Output extends Component {
    sortByPrice(a, b) {
        //If both items have a price and their values are not the same, then sort by their value in chaos
        if (b.item.chaos != 'N/A' && a.item.chaos != 'N/A' && b.item.chaos != a.item.chaos) return a.item.chaos - b.item.chaos;
        //Otherwise, if one item doesn't have a price, move the one without a price towards the bottom
        if (b.item.chaos != 'N/A' && a.item.chaos == 'N/A') return 1;
        if (b.item.chaos == 'N/A' && a.item.chaos != 'N/A') return -1;
        //Else neither item has a price or their prices are the same, so sort by time
        return b.item.time - a.item.time;
    }

    sortByMod(a, b, mod) {
        let mod1 = null;
        let mod2 = null;

        switch (mod.type) {
            case 'implicit':

                for (let i = 0; i < a.item.modifiers.implicit.length; i++) {
                    if (mod.pattern.test(a.item.modifiers.implicit[i])) { mod1 = a.item.modifiers.implicit[i]; break; }
                }

                for (let i = 0; i < b.item.modifiers.implicit.length; i++) {
                    if (mod.pattern.test(b.item.modifiers.implicit[i])) { mod2 = b.item.modifiers.implicit[i]; break; }
                }

                break;
            case 'explicit':

                for (let i = 0; i < a.item.modifiers.explicit.length; i++) {
                    if (mod.pattern.test(a.item.modifiers.explicit[i])) { mod1 = a.item.modifiers.explicit[i]; break; }
                }


                for (let i = 0; i < b.item.modifiers.explicit.length; i++) {
                    if (mod.pattern.test(b.item.modifiers.explicit[i])) { mod2 = b.item.modifiers.explicit[i]; break; }
                }

                break;
            case 'crafted':

                for (let i = 0; i < a.item.modifiers.crafted.length; i++) {
                    if (mod.pattern.test(a.item.modifiers.crafted[i])) { mod1 = a.item.modifiers.crafted[i]; break; }
                }


                for (let i = 0; i < b.item.modifiers.crafted.length; i++) {
                    if (mod.pattern.test(b.item.modifiers.crafted[i])) { mod2 = b.item.modifiers.crafted[i]; break; }
                }

                break;
            default: console.log(`${mod.pattern} ${mod.text} ${mod.type}`)
        }

        if (mod2 != null && mod1 == null) return 1;
        if (mod2 == null && mod1 != null) return -1;
        if (mod2 == null && mod1 == null) return b.item.time - a.item.time;

        let val1 = null;
        let val2 = null;

        let numPat = /[0-9][0-9\.]*/g;

        switch (mod.numVals) {
            case 0:
                return b.item.time - a.item.time;
            case 1:
                val1 = mod1.match(numPat);
                val2 = mod2.match(numPat);
                break;
            case 2:
                val1 = mod1.match(numPat);
                val1 = (parseFloat(val1[0]) + parseFloat(val1[1])) / 2;

                val2 = mod2.match(numPat);
                val2 = (parseFloat(val2[0]) + parseFloat(val2[1])) / 2;
                break;
        }

        if (val1 == null || val2 == null) { console.log('Something is very wrong with the mod sorting D:'); return 0; }
        if (val1 == val2) return b.item.time - a.item.time;
        return val2 - val1;
    }

    buildItems() {
        if (this.props.sortStyle == 'age')
            return (Object.entries(this.props.results).sort(([, a], [, b]) => (b.item.time - a.item.time)).map(([, element]) => (
                <Item key={element.id} league={this.props.league} listing={element} updateInput={this.props.updateInput} mod={this.props.mod} />
            )));
        else if (this.props.sortStyle == 'price')
            return (Object.entries(this.props.results).sort(([, a], [, b]) => this.sortByPrice(a, b)).map(([, element]) => (
                <Item key={element.id} league={this.props.league} listing={element} updateInput={this.props.updateInput} mod={this.props.mod} />
            )));
        else if (this.props.sortStyle == 'modifier')
            return (Object.entries(this.props.results).sort(([, a], [, b]) => this.sortByMod(a, b, this.props.mod)).map(([, element]) => (
                <Item key={element.id} league={this.props.league} listing={element} updateInput={this.props.updateInput} mod={this.props.mod} />
            )));

        //Default to age, just in case
        return (Object.entries(this.props.results).sort(([, a], [, b]) => (b.item.time - a.item.time)).map(([, element]) => (
            <Item key={element.id} league={this.props.league} listing={element} updateInput={this.props.updateInput} mod={this.props.mod} />
        )));
    }

    render() {
        if (Object.entries(this.props.results).length != 0)
            //TODO: Need to bring out sort to another function once there are more than two styles of sort, i.e. once we can sort by item modifier
            return (
                <div className='card' style={{ borderColor: '#9dc8d6' }}>
                    <div className='card-header' style={{ color: '#333333', backgroundColor: '#add8e6' }}>
                        <div className='row justify-content-between'>
                            <span className='col-xs-auto' style={{ marginLeft: '1rem' }}>Results</span>
                            <span className='col-xs-auto' style={{ marginRight: '1rem' }} htmlFor='sort-select'>Sorting by: <span id='sort-display'>{this.props.sortStyle.charAt(0).toUpperCase() + this.props.sortStyle.slice(1)}</span></span>
                        </div>
                    </div>
                    <div className='card-body'>
                        <ul className='list-group'>
                            {this.buildItems()}
                        </ul>
                    </div>
                </div>
            );
        return ( this.props.searching ?
            <div className='card' style={{ borderColor: '#9dc8d6' }}>
                <div className='card-header' style={{ color: '#333333', backgroundColor: '#add8e6' }}>Waiting for results from server; tabs parsed: {this.props.numParsed}</div>
            </div> : <div></div>
        );
    }
}

export default Output;