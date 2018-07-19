import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios'
import  { Redirect } from 'react-router-dom'

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

class Register extends Component {

  handleClick (event) {
    event.preventDefault();
    const data = new FormData(event.target);
    
    //console.log(data.get('username'))

    axios.post('http://127.0.0.1:3100/register', data, {headers: {
      'Content-Type': 'application/json',
    }})
    .then(response => console.log(response))
  }


  render() {
    return (
      <div className="Register">
        <form onSubmit={this.handleClick} method="post">
          <label htmlFor="username">Username</label>
          <input name="username" id="username" required />
          <label htmlFor="password">Password</label>
          <input type="password" name="password" id="password" required />
          <input type="submit" value="Register" />
        </form>
      </div>
    );
  }
}

class Login extends Component {

  handleClick (event) {
    event.preventDefault();
    const data = new FormData(event.target);
    
    //console.log(data.get('username'))

    axios.post('http://127.0.0.1:3100/login', data, {headers: {
      'Content-Type': 'application/json',
    }})
    .then(response => {
      if (response.message === "Success") {
        return <Redirect to='/game'  />
      }
    })
  }

  render() {
    return (
      <div className="Login">
        <form onSubmit={this.handleClick} method="post">
        <label htmlFor="username">Username</label>
        <input name="username" id="username" required />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" required />
        <input type="submit" value="Log In" />
      </form>
      </div>
    );
  }
}


export default { App, Register, Login};
