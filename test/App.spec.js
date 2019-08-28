const React = require('react');
const chai = require('chai');
const { expect } = require('chai');
const enzyme = require('enzyme');
const chaiEnzyme = require('chai-enzyme');
const App = require('../src/App').default;
const Adapter = require('enzyme-adapter-react-16'); 

chai.use(chaiEnzyme());

enzyme.configure({ adapter: new Adapter() });

let wrapper = null;

describe('App Component', () => {

    beforeEach(() => {
        wrapper = enzyme.mount(<App />);
    });

    afterEach(() => {
        wrapper.unmount();
    });

    it('App should exist', () => {
        expect(wrapper).to.not.be.null;
    });

    it('App should have a function for updating the state when an input changes', () => {
        expect(wrapper.state('sortStyle')).to.equal('age');
        expect(wrapper.instance().updateInput('sortStyle','price'),'Updating sort style to price').to.not.throw;
        expect(wrapper.state('sortStyle'),'Checking that the state was updated properly').to.equal('price');
    });

    it(`App should have functions for handling data titled 'initializeData' and 'handleNewData'`, () => {
        expect(wrapper.instance().initializeData).to.exist;
        expect(wrapper.instance().handleNewData).to.exist;
    });

    it(`App should have a function for sending the current search criteria to the server called 'handleSubmit'`, () => {
        expect(wrapper.instance().handleSubmit).to.exist;
    });
});