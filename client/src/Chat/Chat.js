import React, { Component } from 'react';
import EmojiPicker from 'emoji-picker-react';
import io from 'socket.io-client';
import './Chat.css';

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      message: '',
      showPicker: false,
      k_messages:100,
      isPC: window.innerWidth > 900,
    };
    this.socket = io();
    this.socket.addEventListener('message', this.handleMessage);
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
    const { message } = this.state;
    const data = JSON.stringify({ message });
    this.socket.send(data);
    this.setState({ message: '', showPicker: false });
  };

  handleEmojiClick = () => {
    this.setState((prevState) => ({
      showPicker: !prevState.showPicker,
    }));
  };


  async loadHistory() {
    let messages = await fetch('/api/load_history', {
                                                      method:'POST', 
                                                      headers:{'Content-Type':'application/json'}, 
                                                      body:JSON.stringify({k:this.state.k_messages})
                                                    });
    messages = await messages.json();
    messages = messages.data;
    this.setState({messages});
  };

  render() {
    const { messages, message, showPicker, isPC } = this.state;
    return (
      <div className="chat-container">
        <div className="chat-header">
          <h1>Elite Chat</h1>
        </div>
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div className={`message ${msg.type === 'sent' ? 'sent' : 'received'}`}>
              {msg.type !== 'sent' && (
                <div className="message-username">{msg.username}</div>
              )}
              <div className="message-content">{msg.message}</div>
            </div>
          ))}
        </div>
        {isPC && showPicker && (
          <div className="emoji-picker">
            <EmojiPicker onEmojiClick={this.handleEmojiSelect} theme="dark" />
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
