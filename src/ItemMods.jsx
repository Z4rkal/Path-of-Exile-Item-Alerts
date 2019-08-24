import React, { Component } from 'react';

class ItemMods extends Component {
    parseModifier(rawModStr) {
        //Calculate the number of values the mod has by finding how many 'numbers' there are in the string
        const numVals = (rawModStr.match(/[0-9]+(?:.[0-9]+)?/g) || []).length;

        //Escape all special characters in the modifier string so that we can us
        const patStr = rawModStr.replace(/([^a-zA-Z0-9\s])/g, '\\$1')
            //And then replace all numbers in the string with a regex pattern for finding numbers
            .replace(/[0-9]+(?:.[0-9]+)?/g, '[0-9]+(?:.[0-9]+)?');
        //After doing this we're left with a regex-esque string like `Minions deal [0-9]+(?:.[0-9]+)?\% increased damage`
        //that we can use to match the modifier, so we'll build a regex out of it 
        const pattern = new RegExp(`^${patStr}$`);

        //Finally, make a new mod string with all the numbers replaced with `#` 
        //just in case we need something to spit out in an error relating to sorting by modifier to describe what the mod looks like.
        const parsedModStr = rawModStr.replace(/[0-9]+(?:.[0-9]+)?/g, '#');

        return [parsedModStr, numVals, pattern];
    }

    matchSortedMod(modifier, type) {
        if (this.props.mod.pattern.test(modifier) && type == this.props.mod.type) return { color: '#f73979' };
        return {};
    }

    setSortMod(rawModStr, type) {
        const [modText, numVals, pattern] = this.parseModifier(rawModStr);

        this.props.updateInput('mod', { text: modText, pattern, numVals, type });
        this.props.updateInput('prop', '');
        this.props.updateInput('sortStyle', 'modifier');
    }

    render() {
        return (
            <table style={{ marginLeft: '1.4rem' }}>
                <tbody style={{ minHeight: '6rem' }}>
                    {this.props.modifiers.implicit != undefined ? this.props.modifiers.implicit.map((element, index) => (
                        <tr key={this.props.id + ' ' + element + index}>
                            <th className='hover' onClick={() => this.setSortMod(element, 'implicit')} style={this.matchSortedMod(element, 'implicit')}>{element}</th>
                        </tr>
                    )) : null}
                    {this.props.modifiers.explicit != undefined ? this.props.modifiers.explicit.map((element, index) => (
                        <tr key={this.props.id + ' ' + element + index}>
                            <td className='hover' onClick={() => this.setSortMod(element, 'explicit')} style={this.matchSortedMod(element, 'explicit')}>{element}</td>
                        </tr>
                    )) : null}
                    {this.props.modifiers.crafted != undefined ? this.props.modifiers.crafted.map((element, index) => (
                        <tr key={this.props.id + ' ' + element + index}>
                            <td><span className='half-rem-right' style={{ backgroundColor: '#55c3d3', borderRadius: '2px', padding: '3px', color: '#ffffff' }}>Crafted</span> <span className='hover' onClick={() => this.setSortMod(element, 'crafted')} style={this.matchSortedMod(element, 'crafted')}>{element}</span></td>
                        </tr>
                    )) : null}
                </tbody>
            </table>
        )
    }
}

export default ItemMods;