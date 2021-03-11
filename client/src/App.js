import React, { Fragment } from 'react';
import './App.css';
import NavBar from './components/layout/NavBar';
import Landing from './components/layout/Landing';

const App = () => (
  <Fragment>
    <h1>App</h1>
    <NavBar/>
    <Landing/>
  </Fragment>
)

export default App;
