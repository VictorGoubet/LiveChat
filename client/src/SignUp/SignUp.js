import React, { Component } from 'react';
import './SignUp.css';

class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {};

  }

  render() {
    return (
      <div class="container">
        <h1 class='signup-h1'>Sign Up</h1>
        <form class='signup-form' action="/signin" method="POST">
          <div class="form-group">
            <input type="text" placeholder='username' class="signup-input" id="username" name="username"/>
          </div>
          <button type="submit" class="signup-button">Sign Up</button>
        </form>
        <a href="/login">Already have an account?</a>
      </div>

    );
  }
}

export default SignUp;
