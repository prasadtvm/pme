import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../services/api.jsx';  // ✅ use centralized API
//import { sendChatMessage } from "../services/chatAPI";
import '../styles/tailwind.css';

const ProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getAll();   // ✅ no need to add token manually
      // ✅ Handle both array or object responses safely
      console.log(JSON.stringify(response.data));
      const fetchedProjects = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      alert('Failed to load projects. Please login again.');
    } finally {
      setLoading(false);
    }
  };

// Basic project data structure
  const [projectData, setProjectData] = useState({
    name: '',
    image_file: null,
    event_date: '',
  });

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      //const basicProject = {
      //  name: projectData.name,
      //  description: projectData.description,
      //  year: projectData.year,
      //};

    const formData = new FormData();
    formData.append('name', projectData.name);
    formData.append('event_date', projectData.event_date);

    if (projectData.image_file instanceof File) {
      formData.append('image_file', projectData.image_file);    }
    

    const projectResponse = await projectAPI.create(formData);

    const createdProject = projectResponse.data;   

      setProjects([...projects, createdProject]);
      setShowCreateForm(false);
      resetForm();
      alert('Project created successfully! You can add details later.');

      navigate(`/project/${createdProject.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project: ' + (error.response?.data?.error || error.message));
    }
  };

  const resetForm = () => {
    setProjectData({
      name: '',
      image_file: null,       // was description
       event_date: '',
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    //navigate('/login');
    window.location.href = "/login";
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };
  const handleCreateClick = () => {
    navigate("/project/new");
  };

   return (
    <div className="page-container">
      <div className="header-container">    
        <h1 className="text-3xl font-bold text-green-500">Roadshow Project Management</h1>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleCreateClick}
            className="action-button"
            style={{ fontSize: '16px' }}
          >
            + Create New Project 
          </button>
          <button 
            onClick={handleLogout}
           className="danger-button"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Simple Create Project Form */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Project</h2>
              <button 
                onClick={() => setShowCreateForm(false)}
                className="close-button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label className="form-label">
                  Project Name * 
                </label>
                <input
                  type="text"
                  value={projectData.name}
                  onChange={(e) => setProjectData({...projectData, name: e.target.value})}
                  required
                  className="form-input"
                />
              </div>
              
              {/* Image Upload */}
            <div className="form-group">
              <label className="form-label">Image File</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setProjectData({
                    ...projectData,
                    image_file: e.target.files[0] || null,
                  })
                }
                className="form-input"
              />
            </div>
              
             {/* Event Date */}
              <div className="form-group">
                <label className="form-label">Event Date *</label>
                <input
                  type="date"
                  value={projectData.event_date || ''}
                  onChange={(e) =>
                    setProjectData({ ...projectData, event_date: e.target.value })
                  }
                  required
                  className="form-input"
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="submit"
                  className="primary-button"
                >
                  Create Project
                </button>
                <button 
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                   className="secondary-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects List */}
      {loading ? (
        <div className="loading-text">
          <p>Loading projects...</p>
        </div>
      ) : (
        <div className="projects-grid">
          
          {Array.isArray(projects) && projects.length > 0 ? (
            projects.map((project) => (
            <div 
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className="project-card"
            >
              <div className="project-header">
                <h3 className="project-name">{project.name}</h3>
                {/*<span className={`status-badge ${
                  project.status === 'completed' ? 'status-completed' : 'status-draft'
                }`}>
                  {project.status || 'Draft'}
                </span>*/}
                {/* ✅ Progress Bar replacing status */}
                    <div
                      style={{
                        width: '100%',
                        background: '#e0e0e0',     // grey background
                        borderRadius: '8px',
                        overflow: 'hidden',
                        height: '14px',
                        marginTop: '8px',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          width: `${project.progress || 0}%`,
                          height: '100%',
                          background: '#28a745',    // green bar
                          transition: 'width 0.5s ease',
                        }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '11px',
                          color: 'white',
                          fontWeight: 600,
                          lineHeight: '14px',
                        }}
                      >
                        {project.progress ? `${project.progress}%` : '0%'}
                      </span>
                    </div>

              </div>
            <div className="project-image-container">
                {project.image_file ? (
                  <img
                    src={`http://localhost:5000/uploads/project/${project.image_file}`}
                    alt={project.name}
                    style={{
                      width: '100%',
                      height: '180px',
                      objectFit: 'cover',
                      borderRadius: '8px 8px 0 0',
                    }}
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                {/* Show placeholder if no image or if image fails to load */}
                <div
                  style={{
                    width: '100%',
                    height: '180px',
                    background: '#f0f0f0',
                    display: project.image_file ? 'none' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#888',
                    borderRadius: '8px 8px 0 0',
                  }}
                >
                  No Image
                </div>
              </div>
              <div className="project-meta">
                <div>Event Date: {project.event_date}</div>                
              </div>
            </div>
          ))
        ):(
          <div className="empty-state">
              <p>No projects found. Click "Create New Project" to get started!</p>
            </div>
        )}
          
          
        </div>
      )}
    </div>
  );
};

export default ProjectPage;