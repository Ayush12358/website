import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Chat.css';

const AdminChatComponent = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const conversationsInterval = useRef(null);
  const messagesInterval = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    console.log('AdminChatComponent mounted, user:', user);
    // Check if user is developer
    if (user && user.profile && user.profile.email === 'ayushmaurya2003@gmail.com') {
      console.log('User is developer, fetching conversations...');
      fetchConversations();
      // Poll for new conversations every 2 seconds
      conversationsInterval.current = setInterval(() => fetchConversations(true), 2000);
    } else {
      console.log('User is not developer or no user:', user);
      setError('Access denied. Developer access required.');
      setLoading(false);
    }

    return () => {
      if (conversationsInterval.current) {
        clearInterval(conversationsInterval.current);
      }
    };
  }, [user]);

  const fetchMessages = useCallback(async (userId, silent = false) => {
    try {
      const response = await api.get(`/chat/admin/${userId}`);
      setMessages(response.data);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      if (!silent) {
        setError('Failed to load messages');
        console.error('Messages fetch error:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId);
      // Poll for new messages every 2 seconds for the selected conversation
      messagesInterval.current = setInterval(() => {
        fetchMessages(selectedUserId, true);
      }, 2000);
    } else {
      // Clear messages polling when no conversation is selected
      if (messagesInterval.current) {
        clearInterval(messagesInterval.current);
        messagesInterval.current = null;
      }
    }

    return () => {
      if (messagesInterval.current) {
        clearInterval(messagesInterval.current);
      }
    };
  }, [selectedUserId, fetchMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !selectedUserId) return;

    // Client-side validation
    if (newMessage.length > 1000) {
      setError('Message is too long (maximum 1000 characters)');
      return;
    }

    setSending(true);
    setError('');

    try {
      const response = await api.post(`/chat/admin/${selectedUserId}`, {
        message: newMessage
      });
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      setTimeout(scrollToBottom, 100);
      // Refresh conversations to update unread counts (silent refresh)
      fetchConversations(true);
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
        <div className="chat-loading">Loading admin chat...</div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="chat-container">
        <div className="chat-error" style={{ padding: '2rem' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-chat-container">
      <div className="admin-conversations">
        <h4>Conversations</h4>
        {conversations.length === 0 ? (
          <div className="chat-empty">No conversations yet</div>
        ) : (
          <div className="admin-conversations-list">
            {conversations.map((conv) => (
              <div
                key={conv.userId}
                className={`admin-conversation-item ${selectedUserId === conv.userId ? 'selected' : ''}`}
                onClick={() => setSelectedUserId(conv.userId)}
              >
                <div className="admin-conversation-info">
                  <div className="admin-conversation-name">
                    {conv.User.name}
                  </div>
                  <div className="admin-conversation-email">
                    {conv.User.email}
                  </div>
                  <div className="admin-conversation-time">
                    {formatTime(conv.lastMessageTime)}
                  </div>
                </div>
                {conv.unreadCount > 0 && (
                  <div className="admin-unread-badge">
                    {conv.unreadCount}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-chat-panel">
        {selectedUserId ? (
          <>
            <div className="chat-header">
              <h3>
                Chat with {conversations.find(c => c.userId === selectedUserId)?.User.name}
              </h3>
            </div>

            <div className="chat-messages">
              {messages.map((message) => (
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
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-form">
              {error && <div className="chat-error">{error}</div>}
              <div className="chat-input-container">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply..."
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
              <div className={`char-count ${newMessage.length > 900 ? 'warning' : ''}`}>
                {newMessage.length}/1000
              </div>
            </form>
          </>
        ) : (
          <div className="admin-chat-empty">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatComponent;
