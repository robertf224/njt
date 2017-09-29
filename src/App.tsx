import * as React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';

import { Schedule } from './schedule';
import { Search } from './search';

import './App.css';

export const PROXY_SERVER_URL = 'https://cors-anywhere.herokuapp.com/';

export interface IStation {
  key: string;
  name: string;
  lat: number;
  lon: number;
}

class App extends React.Component {

  public render() {
    return (
      <Router>
        <div className="App">
          <h1 className="header"> 
            <img style={{ height: 32, paddingTop: 3 }} src="https://i.imgur.com/qSP16f3.png"/>
            <span className="pt-navbar-divider" />
            NJ Transit Schedules 
          </h1>
          <Route exact={true} path="/" component={Search} />
          <Route exact={true} path="/schedule" component={Schedule} />
        </div>
      </Router>
    );
  }
}

export default App;
