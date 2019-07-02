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
});