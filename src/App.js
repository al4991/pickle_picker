import React from "react";
import { Route, Switch } from "react-router";
import { Router } from "react-router-dom";

import Home from "./components/Home";
import createBrowserHistory from "history/createBrowserHistory";
const history = createBrowserHistory();

function App() {
  return (
    <Router history={history}>
      <Switch>
        <Route path='/' component={Home} />
      </Switch>
    </Router>
  );
}

export default App;
