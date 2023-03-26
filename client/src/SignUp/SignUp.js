import React, { Component } from 'react';
import './SignUp.css';


class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      qrData:null,
      username:'',
      is_available:null,
      token_mode:false,
      configKey:'None'
    };
  }



  generateQRCode = async() => {
    let response = await fetch('/api/generateGoogleAutQRCode', {method:'POST', 
                                                                headers:{'Content-Type':'application/json'}, 
                                                                body:JSON.stringify({username:this.state.username})});

    if (response.status === 200){
      response = await response.json();
      this.setState({configKey:response.configKey});
      this.setState({qrData:response.qrCodeImage});
    }
    else{
      this.setState({is_available:false})
    }
  };


  handleTokenMode = () =>{
    this.setState({token_mode:!this.state.token_mode})
  }

  handleUsername = async (event) => {
    // check for availability
    let is_available = null;
    this.setState({username: event.target.value, qrData:null, is_available:is_available});
    
    if (event.target.value !== ''){
      let res = await fetch('/api/isUsernameAvailable', {method:'POST',
                                                         headers:{'Content-Type':'application/json'}, 
                                                         body:JSON.stringify({username:event.target.value})});
      res = await res.json();
      is_available = res.is_available;
    }
    
    this.setState({is_available:is_available})
  };



  validateUser = async (event) => {
    await fetch('/api/validateUser', {method:'POST', 
                                      headers:{'Content-Type':'application/json'}, 
                                      body:JSON.stringify({username:this.state.username})});
    window.location.href = '/login'
  }


  render() {
    return (
      <div className="container">
        <h1 className='signup-h1'>Sign Up</h1>
        {this.state.qrData && 
          <div className='qrcode'>
          {!this.state.token_mode && <img src={this.state.qrData} id="qrcode" alt="QR code" />}
          {this.state.token_mode && <div className='config-key-container'>
                                      <p className='config-key'>{this.state.configKey}</p>
                                      <button className="copy-btn" onClick={navigator.clipboard.writeText(this.state.configKey)}>Copy</button>
                                    </div>}
          <div className="toggle-container">
            <label className="toggle-button">
              <span className="label-text">View setup key</span>
              <input type="checkbox" defaultChecked={this.state.token_mode} onChange={this.handleTokenMode}/>
              <div className="slider-container">
                <div className="slider"></div>
              </div>
            </label>
          </div>
        </div>
        }
        <div className="form-group">
            <input type="text" placeholder='username' className="signup-input" id="username"
                   name="username" onChange={this.handleUsername} value={this.state.username}/>
            {this.state.is_available === false && <label className='username-label'>username not available</label>}
            {!this.state.qrData && this.state.is_available && <button className="signup-button" onClick={this.generateQRCode}>Generate QR code</button>}
            {this.state.qrData && this.state.is_available && <button className="signup-button" onClick={this.validateUser}>OK</button>}
        </div>
        
        <a href="/login">Already have an account?</a>
      </div>
    )
  }
}

export default SignUp;
