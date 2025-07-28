import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState({ name: '', email: '' });
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setUser(response.data);
      setFormData({ name: response.data.name, email: response.data.email });
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put('/users/profile', formData);
      setUser(response.data.user);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page-container">
        <div className="profile-card">
          <p className="text-center">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      <div className="profile-card">
        <h1 className="profile-title">My Profile</h1>
        
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label className="label" htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name"
              name="name"
              className="input" 
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email"
              name="email"
              className="input" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          {error && <div className="error">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <div className="button-group">
            <button type="submit" className="btn" disabled={updating}>
              {updating ? 'Updating...' : 'Update Profile'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/dashboard')}
            >
              Done
            </button>
          </div>
          <div className="profile-info">
            <p>Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
