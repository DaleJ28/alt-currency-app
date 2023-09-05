// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Layout from './Layout';
import Home from './Home';
import './App.css';

const App = () => {
  return (
    <Router basename="/alt-currency-app">
      <Layout>
        <Switch>
          <Route path="/" exact render={(Home) => <h1>Hello world</h1>} />
          <Route render={() => <h1>404 Not found</h1>} />
        </Switch>
      </Layout>
    </Router>
  );
}

export default App;