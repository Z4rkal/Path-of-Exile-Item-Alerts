import React, { Component } from 'react';

class ItemMods extends Component {
    getPattern(mod, type) {
        const numVals = (mod.match(/[0-9]+/g) || []).length;

        let patStr = mod.replace(/([^a-zA-Z0-9\s])/g, '\\$1');
        patStr = patStr.replace(/[0-9][0-9.]*/g, '[0-9][0-9.]*');
        const pat = new RegExp(patStr);

        mod = mod.replace(/[0-9]+/g, '#');

        this.props.updateInput('sortStyle', 'modifier');
        this.props.updateInput('mod', { text: mod, pattern: pat, numVals: numVals, type: type });
    }

    matchSortedMod(modifier, type) {
        if (this.props.mod.pattern.test(modifier) && type == this.props.mod.type) return { color: '#f73979' };
        return {};
    }

    render() {
        return (
            <table style={{ marginLeft: '1.4rem' }}>
                <tbody style={{ minHeight: '6rem' }}>
                    {this.props.modifiers.implicit != undefined ? this.props.modifiers.implicit.map((element, index) => (
                        <tr key={this.props.id + ' ' + element + index}>
                            <th className='hover' onClick={() => this.getPattern(element, 'implicit')} style={this.matchSortedMod(element, 'implicit')}>{element}</th>
                        </tr>
                    )) : null}
                    {this.props.modifiers.explicit != undefined ? this.props.modifiers.explicit.map((element, index) => (
                        <tr key={this.props.id + ' ' + element + index}>
                            <td className='hover' onClick={() => this.getPattern(element, 'explicit')} style={this.matchSortedMod(element, 'explicit')}>{element}</td>
                        </tr>
                    )) : null}
                    {this.props.modifiers.crafted != undefined ? this.props.modifiers.crafted.map((element, index) => (
                        <tr key={this.props.id + ' ' + element + index}>
                            <td><span style={{ backgroundColor: '#55c3d3', margin: 'auto 0.8rem auto auto', borderRadius: '2px', padding: '3px', color: '#ffffff' }}>Crafted</span> <span className='hover' onClick={() => this.getPattern(element, 'crafted')} style={this.matchSortedMod(element, 'crafted')}>{element}</span></td>
                        </tr>
                    )) : null}
                </tbody>
            </table>
        )
    }
}

export default ItemMods;