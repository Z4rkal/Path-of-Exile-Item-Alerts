import React, { Component } from 'react';
import PROPERTY_PRIORITIES_ABBREVIATIONS_AND_ROWS from './lib/configs/propertyConfigFrontend'

class ItemProps extends Component {
    setSortProp(propName) {
        this.props.updateInput('mod', { text: '', pattern: /^$/, numVals: 0, type: '' });
        this.props.updateInput('prop', propName);
        this.props.updateInput('sortStyle', 'property');
    }

    matchSortedProp(propName) {
        if (this.props.prop === propName) return ' sort-highlight';
        return '';
    }

    buildPropHtml(property) {
        return (
            <div className={`col-xs-auto hover${this.matchSortedProp(property.name)}`} key={property.name + ' ' + this.props.id} onClick={() => this.setSortProp(property.name)}>
                <span className='property-label'>{PROPERTY_PRIORITIES_ABBREVIATIONS_AND_ROWS[property.name][1] || property.name}: </span>
                <span className='property-value'>{property.valueAt20 ? `${property.value} (${property.valueAt20})` : property.value}{property.name === 'Quality' ? `%` : ``}</span>
            </div>
        )
    }

    outputProps(properties) {
        const sortedProperties = properties.sort((a, b) => (PROPERTY_PRIORITIES_ABBREVIATIONS_AND_ROWS[b.name][0] || 999) - (PROPERTY_PRIORITIES_ABBREVIATIONS_AND_ROWS[a.name][0] || 999));

        return (
            <React.Fragment>
                <div className='row justify-content-end'>
                    {sortedProperties.map((property) => PROPERTY_PRIORITIES_ABBREVIATIONS_AND_ROWS[property.name][2] === 0 ? this.buildPropHtml(property) : null)}
                </div>
                <div className='row justify-content-end'>
                    {sortedProperties.map((property) => PROPERTY_PRIORITIES_ABBREVIATIONS_AND_ROWS[property.name][2] === 1 ? this.buildPropHtml(property) : null)}
                </div>
                <div className='row justify-content-end'>
                    {sortedProperties.map((property) => PROPERTY_PRIORITIES_ABBREVIATIONS_AND_ROWS[property.name][2] === 2 ? this.buildPropHtml(property) : null)}
                </div>
                <div className='row justify-content-end'>
                    {sortedProperties.map((property) => PROPERTY_PRIORITIES_ABBREVIATIONS_AND_ROWS[property.name][2] === 3 ? this.buildPropHtml(property) : null)}
                </div>
            </React.Fragment>
        )
    }

    render() {
        return (
            <React.Fragment>
                {this.props.properties ? this.outputProps(this.props.properties) : null}
            </React.Fragment>
        )
    }
}

export default ItemProps;

/*  Example Properties array from an Exquisite Blade
    "properties":
    [
        {"name":"Two Handed Sword","values":[],"displayMode":0},
        {"name":"Physical Damage","values":[["56-94",0]],"displayMode":0,"type":9},
        {"name":"Elemental Damage","values":[["64-111",4]],"displayMode":0,"type":10},
        {"name":"Critical Strike Chance","values":[["6.96%",1]],"displayMode":0,"type":12},
        {"name":"Attacks per Second","values":[["1.35",0]],"displayMode":0,"type":13},
        {"name":"Weapon Range","values":[["13",0]],"displayMode":0,"type":14}
    ],
*/