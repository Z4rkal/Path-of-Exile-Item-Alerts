import React, { Component } from 'react';

const PROPERTY_PRIORITIES_AND_ABBREVIATIONS = {
    /*'Example': [Priority, Abbreviation, Row]*/
    'Level': [1, 'Lvl', 0],
    'Quality': [3, 'Qual', 0],
    'Physical Damage': [4, 'Phys', 1],
    'Elemental Damage': [5, 'Ele', 1],
    'Chaos Damage': [6, 'Chaos', 1],
    'Attacks per Second': [7, 'Aps', 2],
    'Critical Strike Chance': [8, 'Crit', 2],
    'Armour': [9, 'AR', 3],
    'Energy Shield': [10, 'ES', 3],
    'Evasion Rating': [11, 'EV', 3]
}

class ItemProps extends Component {
    setSortProp(propName) {
        this.props.updateInput('mod', { text: '', pattern: /^$/, numVals: 0, type: '' });
        this.props.updateInput('sortStyle', 'property');
        this.props.updateInput('prop', propName);
    }

    matchSortedProp(propName) {
        if (this.props.prop === propName) return { color: '#f73979' };
        return {};
    }

    //TODO: refactor this to be less expensive, should be able to calculate necessary values and store them in the state 
    //after mounting the component, and then pass them to a renderProperty function or something so that this isn't 
    //getting recalculated whenever a property gets clicked
    extractRelevantProps(props) {
        let propsObj = {};

        props.map((property) => {
            let val;

            switch (property.name) {
                //Ranges i.e. #-#
                case 'Physical Damage':
                case 'Elemental Damage':
                case 'Chaos Damage':
                    try {
                        val = parseInt(/([0-9]+)-([0-9]+)/.exec(property.values[0][0]).reduce((a, el, i) => {
                            if (i > 0) return a += parseInt(el);
                            else return a;
                        }, 0)) / 2;
                    }
                    catch (error) {
                        val = 0;
                        console.log(`Error with ${property.name} ${JSON.stringify(property.values)}`)
                    }
                    propsObj[property.name.replace(/\ /g, '-')] = [val, PROPERTY_PRIORITIES_AND_ABBREVIATIONS[property.name][0], (
                        <div className='col-xs-auto hover' key={property.name + ' ' + this.props.id} onClick={() => this.setSortProp(property.name)} style={this.matchSortedProp(property.name)}>
                            <span className='property-label'>{PROPERTY_PRIORITIES_AND_ABBREVIATIONS[property.name][1]}: </span>
                            <span className='property-value'>{val}</span>
                        </div>
                    ), PROPERTY_PRIORITIES_AND_ABBREVIATIONS[property.name][2]];
                    return null;
                //Ints
                case 'Armour':
                case 'Energy Shield':
                case 'Evasion Rating':
                case 'Level':
                    try {
                        val = parseInt(property.values[0][0]);
                    }
                    catch (error) {
                        val = 0;
                        console.log(`Error with ${property.name} ${JSON.stringify(property.values)}`)
                    }
                    propsObj[property.name.replace(/\ /g, '-')] = [val, PROPERTY_PRIORITIES_AND_ABBREVIATIONS[property.name][0], (
                        <div className='col-xs-auto hover' key={property.name + ' ' + this.props.id} onClick={() => this.setSortProp(property.name)} style={this.matchSortedProp(property.name)}>
                            <span className='property-label'>{PROPERTY_PRIORITIES_AND_ABBREVIATIONS[property.name][1]}: </span>
                            <span className='property-value'>{/[0-9]+/.exec(val)[0]}</span>
                        </div>
                    ), PROPERTY_PRIORITIES_AND_ABBREVIATIONS[property.name][2]];
                    return null;
                //Floats & Quality
                case 'Attacks per Second':
                case 'Critical Strike Chance':
                case 'Quality':
                    try {
                        val = parseFloat(/^\+?([0-9]+(?:.[0-9]+)?)\%?$/.exec(property.values[0][0])[1]);
                    }
                    catch (error) {
                        val = 0;
                        console.log(`Error with ${property.name} ${JSON.stringify(property.values)}`)
                    }
                    propsObj[property.name.replace(/\ /g, '-')] = [val, PROPERTY_PRIORITIES_AND_ABBREVIATIONS[property.name][0], (
                        <div className='col-xs-auto hover' key={property.name + ' ' + this.props.id} onClick={() => this.setSortProp(property.name)} style={this.matchSortedProp(property.name)}>
                            <span className='property-label'>{PROPERTY_PRIORITIES_AND_ABBREVIATIONS[property.name][1]}: </span>
                            <span className='property-value'>{val}{property.name === 'Quality' ? `%` : ``}</span>
                        </div>
                    ), PROPERTY_PRIORITIES_AND_ABBREVIATIONS[property.name][2]];
                    return null;
                default: return null;
            }
        });

        return propsObj;
    }

    buildItemProps(props, itemCatObject) {
        const itemType = this.determineItemType(itemCatObject);

        if (itemType === 'N/A') return null;

        let propsObj = this.extractRelevantProps(props);

        switch (itemType) {
            case 'armour':
            case 'gem':
                return this.outputProps(propsObj);
            case 'weapon':
                if (propsObj['Physical-Damage'] && propsObj['Attacks-per-Second']) {
                    propsObj['pDps'] =
                        [, 0, (
                            <div className='col-xs-auto hover' key={'pDps' + ' ' + this.props.id} onClick={() => this.setSortProp('pDps')} style={this.matchSortedProp('pDps')}>
                                <span className='property-label'>PDps: </span>
                                <span className='property-value'>{Math.round(propsObj['Physical-Damage'][0] * propsObj['Attacks-per-Second'][0] * 100) / 100}</span>
                            </div>
                        ), 0];
                }
                if (propsObj['Elemental-Damage'] && propsObj['Attacks-per-Second'])
                    propsObj['eDps'] =
                        [, 1, (
                            <div className='col-xs-auto hover' key={'eDps' + ' ' + this.props.id} onClick={() => this.setSortProp('eDps')} style={this.matchSortedProp('eDps')}>
                                <span className='property-label'>EDps: </span>
                                <span className='property-value'>{Math.round(propsObj['Elemental-Damage'][0] * propsObj['Attacks-per-Second'][0] * 100) / 100}</span>
                            </div>
                        ), 0];
                if (((propsObj['Physical-Damage'] && propsObj['Elemental-Damage']) || propsObj['Chaos-Damage']) && propsObj['Attacks-per-Second'])
                    propsObj['Dps'] =
                        [, 2, (
                            <div className='col-xs-auto hover' key={'Dps' + ' ' + this.props.id} onClick={() => this.setSortProp('Dps')} style={this.matchSortedProp('Dps')}>
                                <span className='property-label'>Dps: </span>
                                <span className='property-value'>
                                    {
                                        Math.round((
                                            (propsObj['Physical-Damage'] ? propsObj['Physical-Damage'][0] : 0)
                                            + (propsObj['Elemental-Damage'] ? propsObj['Elemental-Damage'][0] : 0)
                                            + (propsObj['Chaos-Damage'] ? propsObj['Chaos-Damage'][0] : 0)
                                        )
                                            * propsObj['Attacks-per-Second'][0] * 100) / 100
                                    }
                                </span>
                            </div>
                        ), 0];
                return this.outputProps(propsObj);
            default:
                return null;
        }
    }

    determineItemType(cat) {
        if (cat.armour) return 'armour';
        if (cat.weapons) return 'weapon';
        if (cat.gems) return 'gem';
        return 'N/A';
    }

    outputProps(propsObj) {
        const sortedArr = Object.entries(propsObj).sort(([, a], [, b]) => a[1] - b[1]);

        return (
            <React.Fragment>
                <div className='row justify-content-end'>
                    {sortedArr.map(([, value]) => value[3] === 0 ? value[2] : null)}
                </div>
                <div className='row justify-content-end'>
                    {sortedArr.map(([, value]) => value[3] === 1 ? value[2] : null)}
                </div>
                <div className='row justify-content-end'>
                    {sortedArr.map(([, value]) => value[3] === 2 ? value[2] : null)}
                </div>
                <div className='row justify-content-end'>
                    {sortedArr.map(([, value]) => value[3] === 3 ? value[2] : null)}
                </div>
            </React.Fragment>
        )
    }

    render() {
        return (
            <React.Fragment>
                {this.props.properties && this.props.category ? this.buildItemProps(this.props.properties, this.props.category) : null}
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