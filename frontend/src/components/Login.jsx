import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/tailwind.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: 'admin@pme.com', password: 'password' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Sending login request:', credentials);
      
      const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
      const { token, user } = response.data;

    //  console.log('Login successful:', user);

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

    //console.log('Token stored in localStorage:', localStorage.getItem('authToken'));
    //console.log('About to redirect...');

    // navigate('/projects', { replace: true });
    // With this:
      //window.location.href = '/projects';
      if (user.role === 1) {
        window.location.href = '/projects';  // admin
      } else if (user.role === 2) {
        window.location.href = '/viewprojects'; // viewer
      } else {
        alert('Unknown role. Please contact admin.');
      }
    } catch (error) {
      console.error('Full login error:', error);
      
      if (error.response) {
        // Server responded with error status
        setError(error.response.data.error || `Server error: ${error.response.status}`);
        console.log('Error response data:', error.response.data);
      } else if (error.request) {
        // Request was made but no response received
        setError('No response from server. Check if backend is running on http://localhost:5000');
      } else {
        // Something else happened
        setError('Login failed: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const testBackendConnection = async () => {
    try {
      setError('Testing backend connection...');
      const response = await axios.get('http://localhost:5000/api/health');
      setError(`✅ Backend is running: ${response.data.message}`);
    } catch (error) {
      setError('❌ Backend is not reachable. Make sure it\'s running on http://localhost:5000');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2 className="login-title">
          PME System Login
        </h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="form-group">
          <label className="form-label">
            Email:
          </label>
          <input
            type="email"
            value={credentials.email}
            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
            required
            disabled={loading}
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">
            Password:
          </label>
          <input
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            required
            disabled={loading}
            className="form-input"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className={`login-button ${loading ? 'disabled' : ''}`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <button 
          type="button"
          onClick={testBackendConnection}
          className="test-button"
        >
          Test Backend Connection
        </button>
        
        <div className="demo-credentials">
          <p className="demo-title">Demo Credentials:</p>
          <p className="demo-text">Email: admin@pme.com</p>
          <p className="demo-text">Password: password</p>
        </div>
      </form>
    </div>
  );
};

export default Login;