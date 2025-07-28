import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import api from '../utils/api';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const pollInterval = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = React.useCallback(async () => {
    try {
      const response = await api.get('/chat');
      setMessages(response.data);
      if (loading) setLoading(false);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      if (loading) {
        setError('Failed to load chat messages');
        setLoading(false);
      }
    }
  }, [loading]);

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 3 seconds
    pollInterval.current = setInterval(fetchMessages, 3000);
    
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [fetchMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    // Client-side validation
    if (newMessage.length > 1000) {
      setError('Message is too long (maximum 1000 characters)');
      return;
    }

    setSending(true);
    setError('');

    try {
      const response = await api.post('/chat', { message: newMessage });
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="chat-container">
        <div className="chat-loading">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Ayush Maurya</h3>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.isFromDev ? 'message-dev' : 'message-user'}`}
            >
              <div className="message-content">
                <p dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(message.message, {
                    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
                    ALLOWED_ATTR: []
                  })
                }} />
                <span className="message-time">
                  {formatTime(message.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-form">
        {error && <div className="chat-error">{error}</div>}
        <div className="chat-input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            maxLength="1000"
            className="chat-input"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending || newMessage.length > 1000}
            className="chat-send-btn"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
        <div className="char-count" style={{
          fontSize: '0.75rem', 
          color: newMessage.length > 900 ? '#ef4444' : '#6b7280',
          textAlign: 'right',
          marginTop: '0.25rem'
        }}>
          {newMessage.length}/1000
        </div>
      </form>
    </div>
  );
};

export default Chat;
