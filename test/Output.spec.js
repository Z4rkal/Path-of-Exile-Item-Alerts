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
let Output = null;
describe('Output Component', () => {

    beforeEach(() => {
        wrapper = enzyme.mount(<App />);
        Output = wrapper.find('Output');
    });

    afterEach(() => {
        wrapper.unmount();
    });

    it('The Output component should exist', () => {
        expect(Output).to.exist;
    });
});