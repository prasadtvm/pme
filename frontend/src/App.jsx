import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProjectPage from './components/ProjectPage';
import ProjectDetails from './components/ProjectDetails';
import ViewProjects from './components/viewprojects';
import Login from './components/Login';
import { checkAPIHealth } from './services/api';
import './App.css';

function App() {
  const [apiHealthy, setApiHealthy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      setLoading(true);
      await checkAPIHealth();
      setApiHealthy(true);
    } catch (error) {
      console.error('Backend health check failed:', error);
      setApiHealthy(false);
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem('authToken');
  };

 
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{ 
          border: '3px solid #f3f3f3', 
          borderTop: '3px solid #007bff', 
          borderRadius: '50%', 
          width: '40px', 
          height: '40px', 
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        
        <p>Checking backend connection...</p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (apiHealthy === false) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>Backend Server Connection Failed</h2>
        <p style={{ marginBottom: '20px', color: '#6c757d' }}>
          Unable to connect to the backend server at http://localhost:5000
        </p>
        <div style={{ marginBottom: '20px' }}>
          <p><strong>Please check:</strong></p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>✅ Backend server is running on port 5000</li>
            <li>✅ No firewall blocking the connection</li>
            <li>✅ Backend CORS is properly configured</li>
          </ul>
        </div>
        <button 
          onClick={checkBackendHealth}
          style={{
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated() ? <Navigate to="/projects" /> : <Login />} 
          />
          <Route 
            path="/projects" 
            element={isAuthenticated() ? <ProjectPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/project/:id" 
            element={isAuthenticated() ? <ProjectDetails /> : <Navigate to="/login" />} 
          />

          <Route 
            path="/viewprojects" 
             element={isAuthenticated() ? <ViewProjects /> : <Navigate to="/login" />} 
          />          
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated() ? "/projects" : "/login"} />} 
          />          
        </Routes>              
      </div>
    </Router>
  );
}

export default App;