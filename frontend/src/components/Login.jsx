import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/tailwind.css';


// Get the base URL and ensure it's properly formatted
  //const API_BASE_URL = import.meta.env.VITE_API_BACK_URL || 'http://localhost:5000';
  const API_BASE_URL = `${import.meta.env.VITE_API_BACK_URL?.replace(/\/$/, '')}/api` || 'http://localhost:5000/api';
 // const cleanBaseUrl = API_BASE_URL.replace(/\/$/, ''); // Remove trailing slash if present

  console.log('login line 12-API Base URL:', API_BASE_URL);

const Login = () => {
  const [credentials, setCredentials] = useState({ email: 'admin@pme.com', password: 'password' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });
   const [registerMsg, setRegisterMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
     // console.log('Sending login request:', credentials);
      //console.log('Sending login request to:', `${cleanBaseUrl}/api/auth/login`);
     
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      const { token, user } = response.data;

    //  console.log('Login successful:', user);
      if (!user.role) {
      alert('Your account has no role assigned. Please contact admin.');
      return;
    }

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      

    //console.log('Token stored in localStorage:', localStorage.getItem('authToken'));
    //console.log('About to redirect...');

    // navigate('/projects', { replace: true });
    // With this:
      //window.location.href = '/projects';
      if (String(user.role) === '1') {
        navigate('/projects', { replace: true });
        setTimeout(() => (window.location.href = '/projects'), 100);
       // window.location.href = '/projects';  // admin
      } else if (String(user.role) === '2') {
        navigate('/viewprojects', { replace: true });
        setTimeout(() => (window.location.href = '/viewprojects'), 100);
       // window.location.href = '/viewprojects'; // viewer
      } else {
        alert('Unknown role. Please contact admin.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Full login error:', error);
      
      if (error.response) {
        // Server responded with error status
        setError(error.response.data.error || `Server error: ${error.response.status}`);
        console.log('Error response data:', error.response.data);
      } else if (error.request) {
        // Request was made but no response received
        setError('No response from server. Check if backend is running on',API_BASE_URL);
      } else {
        // Something else happened
        setError('Login failed: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------- REGISTER ----------
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterMsg("Registering...");
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, registerData);
      if (res.data?.user) {
        setRegisterMsg("✅ Registration successful! You can now log in.");
        setTimeout(() => setShowRegister(false), 2000);
      }
    } catch (err) {
      console.error(err);
      setRegisterMsg(
        err.response?.data?.error || "Registration failed. Try again."
      );
    }
  };

  const testBackendConnection = async () => {
    try {
      setError('Testing backend connection...');
      const response = await axios.get(`${API_BASE_URL}/health`);

      const testUrls = [
    `${API_BASE_URL}/health`,
    'http://localhost:5000/api/health',
    'http://127.0.0.1:5000/api/health'
  ];
  for (const url of testUrls) {
    try {
      console.log(`Testing: ${url}`);
      const response = await axios.get(url, { timeout: 5000 });
      setError(`✅ Backend is running at: ${url}`);
      console.log('Backend response:', response.data);
      break;
    } catch (error) {
      console.log(`Failed for ${url}:`, error.message);
      if (url === testUrls[testUrls.length - 1]) {
        setError('❌ Backend is not reachable at any tested URL. Please ensure:\n1. Backend server is running\n2. Correct port (usually 5000)\n3. No firewall blocking\n4. CORS is configured');
      }
    }
  }

  console.log('VITE_API_BACK_URL:', API_BASE_URL);
  console.log('All env vars:', import.meta.env);
      setError(`✅ Backend is running: ${response.data.message}`);
    } catch (error) {
      setError('❌ Backend is not reachable. Make sure it\'s running on ',API_BASE_URL);
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
        <p className="text-center text-sm mt-3">
          Don’t have an account?{" "}
          <button
            type="button"
            onClick={() => setShowRegister(true)}
            className="text-blue-600 hover:underline"
          >
            Register
          </button>
        </p>
     {/*
        <button  
          type="button"
          onClick={testBackendConnection}
          className="test-button"
        >
          Test Backend Connection
        </button>
       
        <div className="demo-credentials" >
          <p className="demo-title">Demo Credentials:</p>
          <p className="demo-text">Email: admin@pme.com</p>
          <p className="demo-text">Password: password</p>
        </div>*/}
      </form>    

      {/* -------- REGISTER MODAL -------- */}
      {showRegister && (
        <div className="modal-overlay">
          <div className="modal-content relative">
            <div className="modal-header">
              <h3 className="text-xl font-semibold">Create Account</h3>
              <button
                onClick={() => setShowRegister(false)}
                className="close-button"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your name"
                  value={registerData.name}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Create a password"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      password: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <button type="submit" className="primary-button w-full">
                Register
              </button>
            </form>

            {registerMsg && (
              <p className="text-center text-sm mt-3 text-gray-700">
                {registerMsg}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;