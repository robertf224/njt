import * as React from 'react';
import { HashRouter as Router, Route, Link } from 'react-router-dom';

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
          <div className="header"> 
            <Link to="/" style={{ height: 32 }}>
              <img style={{ height: 32 }} src="https://i.imgur.com/qSP16f3.png"/>
            </Link>
            <span className="pt-navbar-divider divider" />
            <span>NJ Transit Schedules</span>
          </div>
          <Route exact={true} path="/" component={Search} />
          <Route exact={true} path="/schedule" component={Schedule} />
        </div>
      </Router>
    );
  }
}

export default App;
