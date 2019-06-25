import React, { Component } from 'react';
import axios from 'axios';

class App extends Component {
    constructor() {
        super();
        this.state = {
            data: []
        }

    }

    componentWillMount() {
        axios.get('/api/')
            .then(response => response.data)
            .then(data => this.setState({ data }));
    }

    render() {

        return (
            <div className='container'>
                <div>Hewwo World</div>
                <div>{JSON.stringify(this.state.data)}</div>
            </div>
        )
    }
}

export default App;