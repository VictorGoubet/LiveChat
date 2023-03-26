import './Chat.css';
import Cookies from 'js-cookie'
import io from 'socket.io-client';
import React, { Component } from 'react';
import EmojiPicker from 'emoji-picker-react';



class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      message: '',
      showPicker: false,
      k_messages:100,
      n_users:0,
      isPC: window.innerWidth > 900,
    };
    this.socket = io();
    this.socket.addEventListener('message', this.handleMessage);
    this.socket.addEventListener('connection', this.handleNUsers);
    window.addEventListener('resize', this.handleResize);
  }

  

  componentDidMount(){
    this.loadHistory();
  };


  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  };

  handleResize = () => {
    const isPC = window.innerWidth > 900;
    if (isPC !== this.state.isPC) {
      this.setState({ isPC });
    }
  };
  

  handleMessage = (event) => {
    this.setState((prevState) => ({
      messages: [...prevState.messages, event],
    }));
  };

  handleNUsers = (event) => {
    this.setState({n_users:event});
  };

  handleEmojiSelect = (emojiData, event) => {
    this.setState((prevState) => ({
      message: prevState.message + emojiData.emoji,
    }));
  };

  handleChange = (event) => {
    this.setState({ message: event.target.value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const data = JSON.stringify({message:this.state.message, username:this.props.userInfo.username});
    this.socket.send(data);
    this.setState({ message: '', showPicker: false });
  };

  handleEmojiClick = () => {
    this.setState((prevState) => ({
      showPicker: !prevState.showPicker,
    }));
  };


  handleLogOut = () => {
    Cookies.remove('live-chat')
    window.location.href = '/login'
  }

  async loadHistory() {
    let messages = await fetch('/api/load_history', {
                                                      method:'POST', 
                                                      headers:{'Content-Type':'application/json'}, 
                                                      body:JSON.stringify({k:this.state.k_messages})
                                                    });
    messages = await messages.json();
    messages = messages.data;
    for (let i=0; i<messages.length; i++){
      messages[i].type = messages[i].username === this.props.userInfo.username?'sent':'received'
    }
    this.setState({messages});
  };

  render() {
    const { messages, message, showPicker, isPC } = this.state;
    return (
      <div className="chat-container">
        <div className="chat-header">
        <button className='button-logout' onClick={this.handleLogOut}>Log out</button>
          <h1>Elite Chat</h1>
          <h4> 🟢 {this.state.n_users} users</h4>
          
        </div>
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type === 'sent' ? 'sent' : 'received'}`}>
              {msg.type !== 'sent' && (
                <div className="message-username">{msg.username}</div>
              )}
              <div className="message-content">{msg.message}</div>
            </div>
          ))}
        </div>
        {isPC && showPicker && (
          <div className="emoji-picker">
            <EmojiPicker lazyLoadEmojis={true} onEmojiClick={this.handleEmojiSelect} theme="dark"/>
          </div>
        )}
        <form onSubmit={this.handleSubmit} className="chat-form">
          <input
            className="chat-input"
            type="text"
            placeholder="Type your message"
            value={message}
            onChange={this.handleChange}
          />
          {isPC && (
            <i className="emoji-btn" onClick={this.handleEmojiClick}></i>
          )}
          <button className="chat-button" type="submit">
            Send
          </button>
        </form>
      </div>
    );
  }
}

export default Chat;
