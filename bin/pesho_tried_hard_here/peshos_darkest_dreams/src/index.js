import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
//import axios from 'axios'

ReactDOM.render(<App.Register />, document.getElementById('register'));
ReactDOM.render(<App.Login />, document.getElementById('login'));

registerServiceWorker();
