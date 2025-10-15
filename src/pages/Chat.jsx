import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';
import './Chat.css';

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    initializeSocket();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('/chat-messages');
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeSocket = () => {
    const newSocket = io('http://localhost:8000');
    
    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      newSocket.emit('join_chat');
    });

    newSocket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post('/chat-messages', {
        message: newMessage
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Community Chat</h1>
          <p>Connect with other freelancers</p>
        </div>

        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.user_id === user?.id ? 'own' : 'other'}`}
              >
                <div className="message-header">
                  <strong>{message.username}</strong>
                  <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                </div>
                <div>{message.message}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={!socket}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!newMessage.trim() || !socket}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat; 