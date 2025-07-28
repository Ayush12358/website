import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const AdminChatComponent = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    console.log('AdminChatComponent mounted, user:', user);
    // Check if user is developer
    if (user && user.profile && user.profile.email === 'ayushmaurya2003@gmail.com') {
      console.log('User is developer, fetching conversations...');
      fetchConversations();
    } else {
      console.log('User is not developer or no user:', user);
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
      console.log('Fetching admin conversations...');
      const response = await api.get('/chat/admin/conversations');
      console.log('Admin conversations response:', response.data);
      setConversations(response.data);
    } catch (err) {
      console.error('Conversations fetch error:', err);
      console.error('Error response:', err.response?.data);
      setError('Failed to load conversations');
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
      <div style={{textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)'}}>
        Loading admin chat...
      </div>
    );
  }

  if (error && !user) {
    return (
      <div style={{textAlign: 'center', padding: '2rem', color: 'var(--color-error)'}}>
        {error}
      </div>
    );
  }

  return (
    <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', height: '500px'}}>
      <div style={{background: 'var(--color-surface)', borderRadius: '8px', padding: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
        <h4 style={{margin: '0 0 1rem 0', color: 'var(--color-text)', fontSize: '1rem'}}>Conversations</h4>
        {conversations.length === 0 ? (
          <div style={{color: 'var(--color-text-secondary)', textAlign: 'center', padding: '2rem'}}>No conversations yet</div>
        ) : (
          <div style={{flex: 1, overflowY: 'auto'}}>
            {conversations.map((conv) => (
              <div
                key={conv.userId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginBottom: '0.5rem',
                  backgroundColor: selectedUserId === conv.userId ? 'var(--color-primary-light)' : 'var(--color-background-secondary)',
                  border: selectedUserId === conv.userId ? '1px solid var(--color-primary)' : '1px solid transparent'
                }}
                onClick={() => setSelectedUserId(conv.userId)}
              >
                <div style={{flex: 1}}>
                  <div style={{fontWeight: '500', color: 'var(--color-text)', marginBottom: '0.25rem'}}>
                    {conv.User.name}
                  </div>
                  <div style={{fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem'}}>
                    {conv.User.email}
                  </div>
                  <div style={{fontSize: '0.75rem', color: 'var(--color-text-secondary)'}}>
                    {formatTime(conv.lastMessageTime)}
                  </div>
                </div>
                {conv.unreadCount > 0 && (
                  <div style={{
                    background: 'var(--color-error)',
                    color: 'var(--color-surface)',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    {conv.unreadCount}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{background: 'var(--color-surface)', borderRadius: '8px', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
        {selectedUserId ? (
          <>
            <div style={{padding: '1rem', background: 'var(--color-background-secondary)', borderBottom: '1px solid var(--color-border)'}}>
              <h4 style={{margin: 0, color: 'var(--color-text)', fontSize: '1rem'}}>
                Chat with {conversations.find(c => c.userId === selectedUserId)?.User.name}
              </h4>
            </div>
            
            <div style={{flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    maxWidth: '80%',
                    alignSelf: message.isFromDev ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '18px',
                    backgroundColor: message.isFromDev ? 'var(--color-primary)' : 'var(--color-background-secondary)',
                    color: message.isFromDev ? 'var(--color-surface)' : 'var(--color-text)',
                    borderBottomLeftRadius: message.isFromDev ? '18px' : '4px',
                    borderBottomRightRadius: message.isFromDev ? '4px' : '18px'
                  }}>
                    <p style={{margin: '0 0 0.25rem 0', wordWrap: 'break-word'}} 
                       dangerouslySetInnerHTML={{
                         __html: DOMPurify.sanitize(message.message, {
                           ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
                           ALLOWED_ATTR: []
                         })
                       }} 
                    />
                    <span style={{fontSize: '0.75rem', opacity: 0.7}}>
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} style={{borderTop: '1px solid var(--color-border)', padding: '1rem'}}>
              {error && (
                <div style={{color: 'var(--color-error)', fontSize: '0.875rem', marginBottom: '0.5rem', textAlign: 'center'}}>
                  {error}
                </div>
              )}
              <div style={{display: 'flex', gap: '0.5rem'}}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply..."
                  maxLength="1000"
                  disabled={sending}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending || newMessage.length > 1000}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: (!newMessage.trim() || sending || newMessage.length > 1000) ? 'var(--color-text-secondary)' : 'var(--color-primary)',
                    color: 'var(--color-surface)',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: (!newMessage.trim() || sending || newMessage.length > 1000) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
              <div style={{
                fontSize: '0.75rem', 
                color: newMessage.length > 900 ? 'var(--color-error)' : 'var(--color-text-secondary)',
                textAlign: 'right',
                marginTop: '0.25rem'
              }}>
                {newMessage.length}/1000
              </div>
            </form>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-secondary)',
            fontSize: '1rem'
          }}>
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatComponent;
