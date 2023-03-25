import './Login.css';
import Cookies from 'js-cookie'
import React, { Component } from 'react';


class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      is_good_token:null,
      token:'',
      label_message:'',
      username:''
    };
  }


  handleUsername = async (event) => {
    this.setState({username:event.target.value})
    if (event.target.value !== '' && this.state.token.length === 6){
      await this.authenticate(event.target.value, this.state.token)
    }
  }


  authenticate = async (username, secret) => {
    let res = await fetch('/api/authenticate', {method:'POST',
                                                headers:{'Content-Type':'application/json'}, 
                                                body:JSON.stringify({token:secret, username:username})});
    if (res.status === 200){
      res = await res.json();
      this.setState({is_good_token:true})
      // store login cookie
      Cookies.set('live-chat', JSON.stringify({username:this.state.username, accessToken:res.accessToken}), {expires: res.expire_in})
      window.location.href = '/'
    }
    else{
      res = await res.json();
      this.setState({is_good_token:false, label_message:res.error})
    }
  }

  handleToken = async (event) => {
    if (event.target.value.length <= 6) {
      this.setState({token:event.target.value, is_good_token:null})
    }
    if (this.state.username !== '' && event.target.value.length === 6){
      await this.authenticate(this.state.username, event.target.value)
    }
  };


  render() {
    return (
      <div className="container">
        <h1 className='login-h1'>Login</h1>
        <div className="form-group">
            <input type="text" placeholder='username' className="login-input" id="username"
                      name="username" onChange={this.handleUsername} value={this.state.username}/>
            <input type="text" placeholder='token' className="login-input" id="token"
                   name="token" onChange={this.handleToken} value={this.state.token}/>
            {this.state.is_good_token === false && <label className='token-label'>{this.state.label_message}</label>}
        </div>
        
        <a href="/signup">Want to create an account?</a>
      </div>
    )
  }
}

export default Login;
