import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../services/api.jsx';
import '../styles/tailwind.css';
import companyLogo from '../assets/images/company_logo.png';

const ProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
const [editProject, setEditProject] = useState({
  id: "",
  roadshow_name: "",
  project_handiled_by: "",
  event_date: "",
  image_file: ""
});
const [editImageFile, setEditImageFile] = useState(null);


  // ⭐ ADDED
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const navigate = useNavigate();
  const UPLOAD_BACK_URL = `${import.meta.env.VITE_UPLOAD_BACK_URL?.replace(/\/$/, '')}` || 'http://localhost:5000';

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getAll();
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

  // ⭐ MODIFY projectData to include project_handiled_by
  const [projectData, setProjectData] = useState({
    name: '',
    image_file: null,
    event_date: '',
    project_handiled_by: '' // ⭐ ADDED
  });

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', projectData.name);
      formData.append('event_date', projectData.event_date);
      formData.append('project_handiled_by', projectData.project_handiled_by); // ⭐ ADDED

      if (projectData.image_file instanceof File) {
        formData.append('image_file', projectData.image_file);
      }
console.log('propje page',JSON.stringify(formData));

      const projectResponse = await projectAPI.create(formData);
      const createdProject = projectResponse.data;

      setProjects([...projects, createdProject]);
      setShowCreateForm(false);
      resetForm();
      alert('Project created successfully!');

      navigate(`/project/${createdProject.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project: ' + (error.response?.data?.error || error.message));
    }
  };

  const resetForm = () => {
    setProjectData({
      name: '',
      image_file: null,
      event_date: '',
      project_handiled_by: ''
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = "/login";
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  // ⭐ SIMPLE LOCAL FILTERING
  const filteredProjects = projects.filter(p =>
    (searchTerm ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) : true) &&
    (yearFilter ? p.event_date?.startsWith(yearFilter) : true)
  );

  return (
    // Updated container class to make it full screen and enable flex for sidebar/main layout
    <div className="flex min-h-screen">
      
      {/* ⭐ LEFT SIDEBAR (GREEN) */}
      <div className="w-64 bg-[#7FB200] p-4 flex flex-col items-center">
        <div className="w-full">
          {/* Logo at the top of the sidebar */}
          <img
            src={companyLogo}
            alt="Company Logo"
            className="w-20 max-w-[100px] object-contain mb-8 rounded-lg bg-white p-1"
          />
          
          {/* "Road show List" button/link with grey background */}
          <div className="mt-4">
            <button className="w-full text-left p-2 rounded bg-gray-600 text-white font-semibold hover:bg-gray-500">
              Road show List
            </button>
          </div>
        </div>
      </div>
      {/* END LEFT SIDEBAR */}


      {/* MAIN CONTENT */}
      <div className="flex-1 p-6">
        
        {/* ⭐ TOP RIGHT ACTION BUTTONS */}
        <div className="flex justify-end gap-3 mb-4">
          <button
            onClick={() => setShowCreateForm(true)}
            className="action-button bg-green-600 text-white font-semibold py-2 px-4 rounded hover:bg-green-700 transition-colors"
          >
            + Create New Project
          </button>
          <button
            onClick={handleLogout}
            className="danger-button bg-red-600 text-white font-semibold py-2 px-4 rounded hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>


        {/* ⭐ HEADING and SEARCH/FILTER ALIGNMENT */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          
          {/* "Roadshow Project Management" aligned with search box area */}
          <h1 className="text-3xl font-bold text-green-500 mb-4 md:mb-0">Roadshow Project Management</h1>
          
          {/* Search and Filter box */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search project..."
              className="border p-2 rounded"
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              className="border p-2 rounded"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="">All Years</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
        </div>
        {/* END HEADING and SEARCH/FILTER ALIGNMENT */}


        {/* CREATE PROJECT MODAL (Existing logic remains) */}
        {showCreateForm && (
          <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="modal-content bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
              <div className="modal-header flex justify-between items-center border-b pb-2 mb-4">
                <h2 className="text-2xl font-semibold">Create New Project</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-500 hover:text-gray-800 text-3xl leading-none"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateProject}>

                {/* Project Name */}
                <div className="form-group mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                  <input
                    type="text"
                    value={projectData.name}
                    onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                    required
                    className="form-input w-full border border-gray-300 p-2 rounded"
                  />
                </div>

                {/* ⭐ PROJECT HANDLED BY */}
                <div className="form-group mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Handled By *</label>
                  <input
                    type="text"
                    value={projectData.project_handiled_by}
                    onChange={(e) =>
                      setProjectData({ ...projectData, project_handiled_by: e.target.value })
                    }
                    required
                    className="form-input w-full border border-gray-300 p-2 rounded"
                  />
                </div>

                {/* Image Upload */}
                <div className="form-group mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setProjectData({ ...projectData, image_file: e.target.files[0] || null })
                    }
                    className="form-input w-full border border-gray-300 p-2 rounded"
                  />
                </div>

                {/* Event Date */}
                <div className="form-group mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
                  <input
                    type="date"
                    value={projectData.event_date}
                    onChange={(e) =>
                      setProjectData({ ...projectData, event_date: e.target.value })
                    }
                    required
                    className="form-input w-full border border-gray-300 p-2 rounded"
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <button type="submit" 
                    className="action-button bg-green-600 text-white font-semibold py-2 px-4 rounded hover:bg-green-700 transition-colors">
                      Create Project
                  </button>
                  <button type="button" onClick={() => setShowCreateForm(false)} 
                    className="secondary-button bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded hover:bg-gray-400 transition-colors">
                      Cancel
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}
      {/* EDIT PROJECT MODAL (Existing logic remains) */}
        {showEditModal && (
  <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="modal-content bg-white p-6 rounded-lg shadow-xl max-w-lg w-full relative">

      {/* Close Button */}
      <button
        className="absolute top-2 right-3 text-gray-500 text-2xl hover:text-black"
        onClick={() => setShowEditModal(false)}
      >
        ×
      </button>

      <h2 className="text-2xl font-semibold mb-4">Edit Project</h2>

      {/* Project Name */}
      <div className="mb-3">
        <label className="block text-sm font-medium">Project Name</label>
        <input
          type="text"
          value={editProject.roadshow_name}
          onChange={(e) =>
            setEditProject({ ...editProject, roadshow_name: e.target.value })
          }
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Project Handled By */}
      <div className="mb-3">
        <label className="block text-sm font-medium">Handled By</label>
        <input
          type="text"
          value={editProject.project_handiled_by}
          onChange={(e) =>
            setEditProject({ ...editProject, project_handiled_by: e.target.value })
          }
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Event Date */}
      <div className="mb-3">
        <label className="block text-sm font-medium">Event Date</label>
        <input
          type="date"
          value={editProject.event_date?.slice(0, 10) || ""}
          onChange={(e) =>
            setEditProject({ ...editProject, event_date: e.target.value })
          }
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Image Upload + Preview */}
      <div className="mb-3">
        <label className="block text-sm font-medium">Project Image</label>

        <label className="cursor-pointer inline-block px-3 py-2 bg-gray-200 rounded-md shadow-sm hover:bg-gray-300 mt-1">
          Choose File
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => setEditImageFile(e.target.files[0])}
          />
        </label>

        <div className="mt-3">
          <img
            src={
              editImageFile
                ? URL.createObjectURL(editImageFile)
                : editProject.image_file || ""
            }
            alt="Preview"
            className="w-32 h-20 object-cover rounded border"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="text-right mt-4">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={async () => {
            try {
              const formData = new FormData();
              formData.append("roadshow_name", editProject.roadshow_name);
              formData.append("event_date", editProject.event_date);
              formData.append("project_handiled_by", editProject.project_handiled_by);

              if (editImageFile) {
                formData.append("image_file", editImageFile);
              }
            for (let [key, value] of formData.entries()) {
              console.log(key, value);
            }
              await projectAPI.updateRoadshowInfo(editProject.id, formData);

              alert("Project updated!");
              setShowEditModal(false);
              fetchProjects(); // refresh list
            } catch (err) {
              console.error(err);
              alert("Update failed");
            }
          }}
        >
          Update
        </button>
      </div>

    </div>
  </div>
        )}


        {/* PROJECT LIST */}
        {loading ? (
          <div className="loading-text text-center text-gray-500 mt-10"><p>Loading projects...</p></div>
        ) : (
          // projects-grid uses Tailwind CSS grid classes for the card layout
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">


            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleProjectClick(project.id)}
                  className="project-card border rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                >

                  <button
                className="absolute top-2 right-2 text-gray-700 hover:text-black text-2xl font-bold z-20 p-1"
                onClick={(e) => {
                  e.stopPropagation();       // prevent card click
                  setEditProject(project);   // load project info
                  setShowEditModal(true);    // open modal
                }}
              >
  ⋮
</button>
                  <div className="p-4">
                    <div className="project-header">
                      <h3 className="project-name text-lg font-semibold truncate mb-1">{project.name}</h3>

                      <div className="w-full bg-gray-300 rounded-lg overflow-hidden h-3.5 mt-2 relative">
                        <div
                          className="h-full bg-green-600 transition-all duration-500"
                          style={{ width: `${project.progress || 0}%` }}
                        />
                        <span className="absolute top-0 left-1/2 -translate-x-1/2 text-[11px] text-white font-semibold leading-[14px]">
                          {project.progress ? `${project.progress}%` : '0%'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="project-image-container">

                    

                    {/* Simplified Image display logic */}
                    <div className="w-full h-48 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
                        {project.image_file ? (
                          <img
                            src={project.image_file}
                            alt={project.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                            No Image
                          </div>
                        )}
                    </div>
                  </div>
                  
                  <div className="project-meta p-4 text-sm text-gray-600 border-t">
                    <div className="mb-1">Event Date: {project.event_date || "—"}</div>
                    <div>Handiled By: {project.project_handiled_by || "—"}</div> {/* ⭐ NEW */}
                  </div>

                </div>
              ))
            ) : (
              <div className="empty-state col-span-full text-center text-gray-500 mt-10">
                <p>No projects found matching the criteria.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ProjectPage;