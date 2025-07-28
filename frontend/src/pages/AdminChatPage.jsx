import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './AdminChatPage.css';

const AdminChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    // Check if user is developer
    if (user && user.email === 'ayushmaurya2003@gmail.com') {
      fetchConversations();
    } else {
      setError('Access denied. Developer access required.');
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId);
    }
  }, [selectedUserId]);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/chat/admin/conversations');
      setConversations(response.data);
    } catch (err) {
      setError('Failed to load conversations');
      console.error('Conversations fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await api.get(`/chat/admin/${userId}`);
      setMessages(response.data);
    } catch (err) {
      setError('Failed to load messages');
      console.error('Messages fetch error:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !selectedUserId) return;

    setSending(true);
    setError('');

    try {
      const response = await api.post(`/chat/admin/${selectedUserId}`, { 
        message: newMessage 
      });
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      // Refresh conversations to update unread counts
      fetchConversations();
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
      <div className="admin-chat-container">
        <div className="admin-chat-loading">Loading admin chat...</div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="admin-chat-container">
        <div className="admin-chat-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-chat-container">
      <h1 className="admin-chat-title">Admin Chat Management</h1>
      
      <div className="admin-chat-layout">
        <div className="conversations-panel">
          <h3>Conversations</h3>
          {conversations.length === 0 ? (
            <div className="no-conversations">No conversations yet</div>
          ) : (
            <div className="conversations-list">
              {conversations.map((conv) => (
                <div
                  key={conv.userId}
                  className={`conversation-item ${selectedUserId === conv.userId ? 'active' : ''}`}
                  onClick={() => setSelectedUserId(conv.userId)}
                >
                  <div className="conversation-info">
                    <div className="conversation-name">{conv.User.name}</div>
                    <div className="conversation-email">{conv.User.email}</div>
                    <div className="conversation-time">
                      {formatTime(conv.lastMessageTime)}
                    </div>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="unread-badge">{conv.unreadCount}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="chat-panel">
          {selectedUserId ? (
            <>
              <div className="chat-header">
                <h4>
                  Chat with {conversations.find(c => c.userId === selectedUserId)?.User.name}
                </h4>
              </div>
              
              <div className="admin-messages">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`admin-message ${message.isFromDev ? 'admin-message-dev' : 'admin-message-user'}`}
                  >
                    <div className="admin-message-content">
                      <p>{message.message}</p>
                      <span className="admin-message-time">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="admin-chat-input-form">
                {error && <div className="admin-chat-error">{error}</div>}
                <div className="admin-chat-input-container">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="admin-chat-input"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="admin-chat-send-btn"
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChatPage;
