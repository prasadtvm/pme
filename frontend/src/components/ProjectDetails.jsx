// src/components/ProjectDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, projectSectionsAPI } from '../services/api.jsx';
import '../styles/tailwind.css';
const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Detect creation mode
  const creating = !id || id === "new";

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [message, setMessage] = useState('');
  const [remarks, setRemarks] = useState([]);
 const UPLOAD_BACK_URL = `${import.meta.env.VITE_UPLOAD_BACK_URL?.replace(/\/$/, '')}` || 'http://localhost:5000';
  // Core project details
  const [details, setDetails] = useState({
    roadshowName: '',    
    city: '',   
    event_date: '',
    associate: '',
    budget: '',
    // Optional: add description for create flow
    image_file: '',
    project_handiled_by:''
  });

  const [venues, setVenues] = useState([{ name: '', currency: 'INR',rate:'', budget: '', selected: false }]);
 
  const [associates, setAssociates] = useState([{ name: '',  selected: false }]);
  const [tradeDatabase, setTradeDatabase] = useState([{ trade_name: '', nos: '' }]);
  const [rsvp, setRsvp] = useState([{ 
    save_the_date: '',
    save_the_date_confirmation_date: '',
    save_the_date_ta_nos: 0,
    save_the_date_to_nos: 0,
    save_the_date_travel_counsellors_nos: 0,
    save_the_date_influencers_nos: 0,
    save_the_date_total_nos: 0,
    main_invitation_date: '',
    main_invitation_confirmation_date: '',
    main_invitation_ta_nos: 0,
    main_invitation_to_nos: 0,
    main_invitation_travel_counsellors_nos: 0,
    main_invitation_influencers_nos: 0,
    main_invitation_total_nos: 0, }]);
  const [invitationFile, setInvitationFile] = useState(null);
  const [hotels, setHotels] = useState([{sponsor:'', name: '',  selected: false }]);
  const [progress, setProgress] = useState(0);
  const [avSetup, setAvSetup] = useState({
    backdrop: '',
    screen: '',
    mic: '',
    projector: '',
    stage: ''
  });

  const [embassy, setEmbassy] = useState({
    cheif_guest: '',
    cheif_guest_designation: '',
    cheif_guest_phone: '',
    accommodation_contact: '',
    accommodation_address: '',
    accommodation_phone:''
  });

  const [clients, setClients] = useState({
    name: '',
    hotel: '',
    address: ''
  });
const [checklists, setChecklists] = useState([{ name: '',  selected: false }]);
const [menuFile, setMenuFile] = useState({
    fileName: '',
    fileType: '',
    fileSize: '',
    filePath:''
  });
  
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
       const formData = new FormData();
          formData.append('name', details.roadshowName || "Untitled Project");
          formData.append('event_date', details.event_date || new Date().toISOString().slice(0, 10));
      
          if (details.image_file instanceof File) {
            formData.append('image_file', details.image_file);
          }
          else {
      console.warn("⚠️ No valid File found in details.image_file");
    }            
      
          const projectResponse = await projectAPI.create(formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      // Optionally, also insert to projectdetails table here if needed via a separate API
    
      navigate(`/project/${projectResponse.data.id}`);
      showMessage("Project created! You can now edit all details.");
    } catch (err) {
      alert("Project creation failed: " + (err.response?.data?.error || err.message));
    }
  };

  // Fetch details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const [projectRes, detailsRes,remarks] = await Promise.all([
          projectAPI.getById(id),
          projectAPI.getDetails(id) ,     
          projectAPI.getRemarks(id)    
        ]);

        setProject(projectRes.data);
          const progress = await projectAPI.getProgress(id);       
      setProgress(progress.data.progress || 0);
        if (detailsRes.data) {
          const d = detailsRes.data;

          // normalize date for <input type="date">
          let formattedDate = "";
          if (d.event_date) {
            formattedDate = new Date(d.event_date).toISOString().split("T")[0];
          }
          setDetails({
            roadshowName: d.roadshow_name || '',          
            city: d.city || '',            
            event_date: formattedDate,          
            budget: d.budget || '',
            image_file:projectRes.data.image_file || "",
            project_handiled_by:d.project_handiled_by ||'',
          });
          
          setAssociates(d.associates || []);
          setVenues(d.venues || []);
          setTradeDatabase(d.trade_database || []);
          setHotels(d.hotels || []);
          setRsvp(d.rsvp || []);        
          setInvitationFile(d.rsvp?.[0]?.invitation_design_file_path || '');
          
          setAvSetup(d.av_setup || {});
          setEmbassy(d.embassy || {});         
          setClients(d.clients || {});        
          setChecklists(d.checklist || []);
         
          //setMenuFile(d.menuFile || {});
          //setMenuFile(d.menuFile || '');
          setMenuFile({
  fileName: d.menuFile[0]?.filename || '',
  filePath: d.menuFile[0]?.file_path || '',
  fileSize: d.menuFile[0]?.file_size || '',
  fileType: d.menuFile[0]?.mime_type || ''
});
          setRemarks(remarks.data||[]);
        }   
       //  console.log(menuFile.fileName)   
      // console.log('projectDetails fetch',menuFile); 
       
      } catch (err) {
        setProject(null);
        console.error('Error fetching project details:', err);
        alert('Failed to load project details.');
      } finally {
        setLoading(false);
      }
    };

    if (id && id !== 'new') {
    fetchProjectDetails();
  } else {
    setLoading(false); // Skip fetch when creating new project
  }
  }, [id]);

  // Fetch remarks for this project
const fetchRemarks = async () => {
  try {
    const res = await projectAPI.getRemarks(id);
    setRemarks(res.data || []);
  } catch (err) {
    console.error("Error loading remarks:", err);
  }
};

  // Show message helper
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  // Save handlers
  const saveRoadshowInfo = async () => {
    try {
      setSaving('roadshow');      
      await projectSectionsAPI.updateRoadshow(id, {
        roadshow_name: details.roadshowName,        
        city: details.city,
        event_date: details.event_date,
        budget: details.budget,
        project_handiled_by:details.project_handiled_by       
      });
      showMessage('Roadshow information saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save roadshow information');
    } finally {
      setSaving('');
    }
  };

  const saveAssociates = async () => {
    try {
      setSaving('associates');
      await projectSectionsAPI.updateAssociates(id, associates);
      showMessage('Associates saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save associates');
    } finally {
      setSaving('');
    }
  };

  const saveVenues = async () => {
    try {
      setSaving('venues');
      await projectSectionsAPI.updateVenues(id, venues);
      showMessage('Venues saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save venues');
    } finally {
      setSaving('');
    }
  };

  const saveTradeDatabase = async () => {
    try {
      setSaving('trade');
      
      await projectSectionsAPI.updateTradeDatabase(id, tradeDatabase);
     
      showMessage('Trade database saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save trade database');
    } finally {
      setSaving('');
    }
  };
/*
  const saveRSVP = async () => {
    try {
      setSaving('rsvp');
      await projectSectionsAPI.updateRSVP(id, rsvp);      
      showMessage('RSVP saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save RSVP');
    } finally {
      setSaving('');
    }
  };*/
  const saveRSVP = async () => {
  try {
    setSaving('rsvp');
    const formData = new FormData();
    formData.append('invitation_design_file', invitationFile);
    formData.append('rsvp', JSON.stringify(rsvp));
    console.log( JSON.stringify(rsvp));
    await projectSectionsAPI.updateRSVP(id, formData);
    showMessage('RSVP saved successfully!');
  } catch (e) {
    console.error(e);
    alert('Failed to save RSVP');
  } finally {
    setSaving('');
  }
};


  const saveAVSetup = async () => {
    try {
      setSaving('av');
      await projectSectionsAPI.updateAVSetup(id, avSetup);
      showMessage('AV setup saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save AV setup');
    } finally {
      setSaving('');
    }
  };
  
  const saveHotels = async () => {
    try {
      setSaving('hotels');
      await projectSectionsAPI.updateHotels(id, hotels);
      showMessage('Hotels saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save hotels');
    } finally {
      setSaving('');
    }
  };

  const saveEmbassy = async () => {
    try {
      setSaving('embassy');
      await projectSectionsAPI.updateEmbassy(id, embassy);
      showMessage('Embassy info saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save embassy info');
    } finally {
      setSaving('');
    }
  };

  const saveClient = async () => {
    try {
      setSaving('clients');
      await projectSectionsAPI.updateClients(id, clients);
      showMessage('Clients  saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save clients');
    } finally {
      setSaving('');
    }
  };

  const saveChecklists = async () => {
    try {
      setSaving('checklists');
      await projectSectionsAPI.updateChecklists(id, checklists);
      showMessage('Checklists saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save checklists');
    } finally {
      setSaving('');
    }
  };

  const saveMenu = async () => {
    if (!menuFile) {
      alert('Please select a file first.');
      return;
    }
    try {
      setSaving('menu');
      const formData = new FormData();
      formData.append('menu', menuFile);
      await projectSectionsAPI.uploadMenu(id, formData);
      showMessage('Menu uploaded successfully!');
      setMenuFile(null);
    } catch (e) {
      console.error(e);
      alert('Failed to upload menu');
    } finally {
      setSaving('');
    }
  };

  // Associate handlers
  const handleAddAssociate = () => {
    setAssociates([...associates, { name: '', selected: false }]);
  };
  const handleAssociateChange = (index, field, value) => {
    setAssociates(associates.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };
  const handleRemoveAssociate = (index) => {
    setAssociates(associates.filter((_, i) => i !== index));
  };

  // Venue handlers
  const handleAddVenue = () => {
    setVenues([...venues, { name: '', currency: 'INR',rate:'', budget: '', selected: false }]);
  };
  const handleVenueChange = (index, field, value) => {
    setVenues(venues.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };
  const handleRemoveVenue = (index) => {
    setVenues(venues.filter((_, i) => i !== index));
  };

  // Trade handlers
  const handleAddTrade = () => {
    setTradeDatabase([...tradeDatabase, { trade_name: '', nos: '' }]);
  };
  const handleTradeChange = (index, field, value) => {
    setTradeDatabase(tradeDatabase.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  };
  const handleRemoveTrade = (index) => {
    setTradeDatabase(tradeDatabase.filter((_, i) => i !== index));
  };

  // Hotel handlers
  const handleAddHotel = () => {
    setHotels([...hotels, { sponsor: '',name:'', selected: false }]);
  };
  const handleHotelChange = (index, field, value) => {
    setHotels(hotels.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };
  const handleRemoveHotel = (index) => {
    setHotels(hotels.filter((_, i) => i !== index));
  };

  // Client handlers
  const handleAddClient = () => {
    setClients([...clients, { name: '',hotel:'', address:'' }]);
  };
  const handleClientChange = (index, field, value) => {
    setClients(clients.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };
  const handleRemoveClient = (index) => {
    setClients(clients.filter((_, i) => i !== index));
  };

  // RSVP handlers
  /*const handleAddRSVP = () => {
    setRsvp([...rsvp, { date: '', nos: '' }]);
  };
  const handleRSVPChange = (index, field, value) => {
    setRsvp(rsvp.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };
  const handleRemoveRSVP = (index) => {
    setRsvp(rsvp.filter((_, i) => i !== index));
  };*/
  const handleAddRSVP = () => {
  setRsvp([
    ...rsvp,
    {
      save_the_date: '',
      save_the_date_confirmation_date: '',
      save_the_date_ta_nos: 0,
      save_the_date_to_nos: 0,
      save_the_date_travel_counsellors_nos: 0,
      save_the_date_influencers_nos: 0,
      save_the_date_total_nos: 0,
      main_invitation_date: '',
      main_invitation_confirmation_date: '',
      main_invitation_ta_nos: 0,
      main_invitation_to_nos: 0,
      main_invitation_travel_counsellors_nos: 0,
      main_invitation_influencers_nos: 0,
      main_invitation_total_nos: 0
    }
  ]);
};

const handleRSVPChange = (index, field, value) => {
  setRsvp(rsvp.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
};

const handleRemoveRSVP = (index) => {
  setRsvp(rsvp.filter((_, i) => i !== index));
};


  // Checklist handlers
  const handleAddChecklist = () => {
    setChecklists([...checklists, { name: '', selected: false }]);
  };
  const handleChecklistChange = (index, field, value) => {
    setChecklists(checklists.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };
  const handleRemovechecklist = (index) => {
    setChecklists(checklists.filter((_, i) => i !== index));
  };

  const handleToggleRemark = async (remarkId) => {
  try {
    await projectAPI.resolveRemark(remarkId);
    await fetchRemarks(); // refresh after update
  } catch (err) {
    console.error("Error toggling remark status:", err);
    alert("Failed to update remark status");
  }
};

  
  
  const handleBack = () => navigate('/projects');

  // === UI rendering ===
   if (loading) {
    return (
      <div className="loading-container">
        <p>Loading project details...</p>
      </div>
    );
  }

  if (creating) {
    return (
      <div className="page-container" style={{ maxWidth: '600px' }}>
        <h2>Create New Project</h2>
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              value={details.roadshowName}
              onChange={e => setDetails({ ...details, roadshowName: e.target.value })}
              required
              className="form-input"
            />
          </div>
          {/* Image File */}
        <div className="form-group">
          <label className="form-label">Project Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setDetails({ ...details, image_file: e.target.files[0] })}
            className="form-input"
            required
          />
        </div>
          {/* Event Date */}
        <div className="form-group">
          <label className="form-label">Event Date</label>
          <input
            type="date"
            value={details.event_date || ''}
            onChange={e => setDetails({ ...details, event_date: e.target.value })}
            required
            className="form-input"
          />
        </div>
          <button className="action-button" type="submit">Create Project</button>
        </form>
      </div>
    );
  }

  if (!project) {
    return (
     <div className="p-6">
        <h2>Project not found</h2>
        <button onClick={handleBack} className="back-button">Back to Projects</button>
      </div>
    );
  }
return (
  <div className="p-6">
      {/* Header   progress bar percentage & budget*/}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="back-button"
          >
            ← Back to Projects
          </button>
          <h1 className="page-title">{project.name} - Project Details</h1>          
        </div>

         {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      <div className="text-right">
          <label style={{ fontWeight: 500 }}>Completion Progress</label>
            <div
              style={{
                width: '100%',
                background: '#eee',
                borderRadius: '8px',
                overflow: 'hidden',
                height: '20px',
                marginTop: '6px'
              }}
            >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: progress === 100 ? '#007bff' : '#28a745',
              transition: 'width 0.5s ease',
            }}
            />
         </div>


          
          <div style={{ textAlign: 'right', fontSize: '14px', marginTop: '4px' }}>
            {progress}% Completed
          </div>
        </div>
      </div>

     

      {/* Roadshow Information Section 
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">Information</h2>
          <button 
            onClick={saveRoadshowInfo}
            disabled={saving === 'roadshow'}
            className={`action-button ${saving === 'roadshow' ? 'disabled' : ''}`}
          >
            {saving === 'roadshow' ? 'Saving...' : 'Save Roadshow Info'}
          </button>
        </div>
         
        <div className="grid-form">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              value={details.roadshowName}
              onChange={(e) => setDetails({...details, roadshowName: e.target.value})}
              className="form-input"
            />
          </div>          

          <div className="form-group">
            <label className="form-label">City</label>
            <input
              type="text"
              value={details.city}
              onChange={(e) => setDetails({...details, city: e.target.value})}
              className="form-input"
            />
          </div>

           {/* Event Date 
          <div className="form-group">
            <label className="form-label">Event Date</label>
            <input
              type="date"
              value={details.event_date || ""}
              onChange={(e) =>
                setDetails({
                  ...details,
                  event_date: e.target.value,
                })
              }
              className="form-input"
            />
          </div>         

        
        </div>       
      </div>*/}
      {/* 🧭 Sidebar + Main Layout */}
      <div className="flex gap-0">
        {/* Sidebar */}
        <div className="w-48 bg-gray-100 p-5 border-r border-gray-200 min-h-screen sticky top-0 rounded-lg shadow-sm h-fit">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-gray-700">
            <a href="#information" className="hover:text-blue-600">Information</a>
            <a href="#associate" className="hover:text-blue-600">Associate</a>
            <a href="#venue" className="hover:text-blue-600">Venue</a>            
            <a href="#database" className="hover:text-blue-600">Database</a>
             <a href="#rsvp" className="hover:text-blue-600">RSVP</a>
             <a href="#av" className="hover:text-blue-600">Hotel Av Setup</a>
            <a href="#av_supplier" className="hover:text-blue-600">Av Supplier</a>
            <a href="#embassy" className="hover:text-blue-600">Embassy / Consulate</a>
            <a href="#client" className="hover:text-blue-600">Client</a>
            <a href="#checklist" className="hover:text-blue-600">Check List</a>
             <a href="#menu" className="hover:text-blue-600">Menu (image upload)</a>
            <a href="#remarks" className="hover:text-blue-600">Remarks</a>
            <a href="#print" className="hover:text-blue-600">Print</a>
          </nav>
        </div>
        {/* Main Content */}
        <div className="flex-1 space-y-8">

      {/* Roadshow Information Section */}
      <div id="information" className="section-container">
        <div className="section-header">
          <h2 className="section-title">Information</h2>
          <button
            onClick={saveRoadshowInfo}
            disabled={saving === "roadshow"}
            className={`action-button ${saving === "roadshow" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {saving === "roadshow" ? "Saving..." : "Save Roadshow Info"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Name */}
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              value={details.roadshowName}
              onChange={(e) => setDetails({ ...details, roadshowName: e.target.value })}
              className="form-input"
            />
          </div>
          {/*{`${UPLOAD_BACK_URL}/uploads/project/$*/}
          {details.image_file && (
  <div className="col-span-full mt-2">
    <p className="text-sm text-gray-700">Uploaded Project Image:</p>
    <img
      src={details.image_file}
      alt="Project"
      className="mt-2 w-40 rounded border"
    />
  </div>
)}
           {/* Project handiled by */}
          <div className="form-group">
            <label className="form-label">Project handled by</label>
            <input
              type="text"
              value={details.project_handiled_by}
              onChange={(e) => setDetails({ ...details, project_handiled_by: e.target.value })}
              className="form-input"
            />
          </div>

          {/* City */}
          <div className="form-group">
            <label className="form-label">City</label>
            <input
              type="text"
              value={details.city}
              onChange={(e) => setDetails({ ...details, city: e.target.value })}
              className="form-input"
            />
          </div>

          {/* Event Date */}
          <div className="form-group">
            <label className="form-label">Event Date</label>
            <input
              type="date"
              value={details.event_date || ""}
              onChange={(e) => setDetails({ ...details, event_date: e.target.value })}
              className="form-input"
            />
          </div>

          {/* Budget */}
          <div className="form-group">
            <label className="form-label">Budget (INR)</label>
            <input
              type="number"
              value={details.budget}
              onChange={(e) => setDetails({ ...details, budget: e.target.value })}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Associates Section */}
      <div id="associate" className="section-container">
        <div className="section-header">
          <h2 className="section-title">Associate Considered</h2>
          <button
            onClick={saveAssociates}
            disabled={saving === "associates"}
            className={`action-button ${saving === "associates" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {saving === "associates" ? "Saving..." : "Save Associates"}
          </button>
        </div>

        {associates.map((associate, index) => (
          <div
            key={index}
            className="grid grid-cols-[2fr_auto_auto] gap-3 items-center mb-3 p-3 bg-gray-50 rounded-lg"
          >
            {/* Associate Name */}
            <input
              type="text"
              placeholder="Associate"
              value={associate.name}
              onChange={(e) => handleAssociateChange(index, "name", e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md"
            />

            {/* Select Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={associate.selected}
                onChange={(e) => handleAssociateChange(index, "selected", e.target.checked)}
              />
              <span className="text-sm">Select</span>
            </div>

            {/* Delete Button */}
            {associates.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveAssociate(index)}
                className="small-delete-btn"
                title="Remove"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="small-delete-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}

        {/* Add Associate Button */}
        <button
          type="button"
          onClick={handleAddAssociate}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 mt-3"
        >
          + Add Associate
        </button>
      </div>
     
      {/* Venues Section */}
      <div id="venue" className="section-container">
        <div className="section-header">
          <h2 className="section-title">Venue Considered</h2>
          <button
            onClick={saveVenues}
            disabled={saving === "venues"}
            className={`action-button ${saving === "venues" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {saving === "venues" ? "Saving..." : "Save Venues"}
          </button>
        </div>

        {venues.map((venue, index) => (
          <div
            key={index}
            className="grid grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_auto_auto] gap-3 items-center mb-3 p-3 bg-gray-50 rounded-lg"
          >
            {/* Venue Name */}
            <input
              type="text"
              placeholder="Venue Name"
              value={venue.name}
              onChange={(e) => handleVenueChange(index, "name", e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md"
            />

            {/* Currency Dropdown */}
            <select
              value={venue.currency || "INR"}
              onChange={(e) => handleVenueChange(index, "currency", e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md"
            >
              <option value="INR">INR</option>
              <option value="EUR">Euro</option>
              <option value="GBP">Pound</option>
            </select>

            {/* Rate */}
            <input
              type="number"
              placeholder="Rate"
              value={venue.rate || ""}
              onChange={(e) => handleVenueChange(index, "rate", e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md"
            />

            {/* Budget */}
            <input
              type="number"
              placeholder="Budget"
              value={venue.budget}
              onChange={(e) => handleVenueChange(index, "budget", e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md"
            />

            {/* Select Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={venue.selected}
                onChange={(e) => handleVenueChange(index, "selected", e.target.checked)}
              />
              <span className="text-sm">Select</span>
            </div>

            {/* Delete Button */}
            {venues.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveVenue(index)}
                className="small-delete-btn"
                title="Remove"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="small-delete-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}

        {/* Add Venue Button */}
        <button
          type="button"
          onClick={handleAddVenue}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 mt-3"
        >
          + Add Venue
        </button>
      </div>
{/*Database Section*/}  

<div id="database" className="section-container">
  {/* Header */}
  <div className="flex justify-between items-center mb-5">
    <h2 className="text-xl font-semibold text-slate-800">Database</h2>
    <button
      onClick={saveTradeDatabase}
      disabled={saving === 'trade'}
      className={`action-button ${saving === "trade" ? "opacity-50 cursor-not-allowed" : ""}`}     
    >
      {saving === 'trade' ? 'Saving...' : 'Save Trade Database'}
    </button>
  </div>

  {/* Database Rows */}
  <div className="space-y-3">
    {tradeDatabase.map((trade, index) => (
      <div
        key={index}
        className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-3 items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
      >
        {/* Trade Name */}
        <input
          type="text"
          placeholder="Trade Name"
          value={trade.trade_name}
          onChange={(e) => handleTradeChange(index, 'trade_name', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Nos */}
        <input
          type="number"
          placeholder="Nos"
          value={trade.nos}
          onChange={(e) => handleTradeChange(index, 'nos', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Delete Button */}
        {tradeDatabase.length > 1 && (
          <button
            type="button"
            onClick={() => handleRemoveTrade(index)}
            title="Remove"
            className="p-2 text-red-600 hover:text-red-800 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
    ))}
  </div>

  {/* Add Button */}
  <button
    type="button"
    onClick={handleAddTrade}
    className="mt-4 px-5 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
  >
    + Add Trade
  </button>
</div>
{/*RSVP SECTION*/}    
     <div id="rsvp" className="section-container">
  <div className="section-header">
    <h2 className="section-title">RSVP</h2>
    <button
      onClick={saveRSVP}
      disabled={saving === 'rsvp'}
      className="action-button"
    >
      {saving === 'rsvp' ? 'Saving...' : 'Save RSVP'}
    </button>
  </div>

  {/*File Upload  href={`http://localhost:5000/uploads/rsvp/${invitationFile}`}*/}
  <div className="form-group">
    <label className="block font-medium text-gray-700">Invitation Design File</label>
    <input type="file" onChange={(e) => setInvitationFile(e.target.files[0])} />
  </div>


{invitationFile && typeof invitationFile === "string" && (() => {
 // console.log('invitationfile in projectdetails', invitationFile);
  //const _fileName = invitationFile.split('\\').pop().split('/').pop();
  //const cleanPath = invitationFile.replace(/.*uploads[\\/]/, 'uploads/rsvp/');href={`http://localhost:5000/${cleanPath}`}

  return (  // ✅ this was missing <img style="display:none;" src={invitationFile}></img>
    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
      <span className="font-medium">Uploaded Invitation Design:</span>
      <a
        href={invitationFile}  // 🔥 Direct Cloudinary URL
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 underline ml-2"
      >
        {invitationFile}
      </a>
      
    </div>
  );
})()}


 {rsvp.map((item, index) => (
  <div key={index} className="p-4 mb-6 bg-gray-50 border rounded-lg shadow-sm">
    <div className="flex justify-between items-center mb-3">
      <h3 className="text-lg font-semibold text-gray-800">RSVP #{index + 1}</h3>
      {rsvp.length > 1 && (
        <button
          type="button" title="Remove"
          onClick={() => handleRemoveRSVP(index)}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
        >
          <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className="small-delete-icon" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
    />
  </svg>
        </button>
      )}
    </div>

    {/* Save The Date Section */}
    <h4 className="text-md font-medium text-blue-700 mb-2">Save The Date</h4>
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
      <div>
        <label className="block text-sm text-gray-600 mb-1">Save The Date</label>
        <input
          type="date"
          value={item.save_the_date || ''}
          onChange={(e) => handleRSVPChange(index, 'save_the_date', e.target.value)}
          className="form-input w-full"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Confirmation Date</label>
        <input
          type="date"
          value={item.save_the_date_confirmation_date || ''}
          onChange={(e) =>
            handleRSVPChange(index, 'save_the_date_confirmation_date', e.target.value)
          }
          className="form-input w-full"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">TA Nos</label>
        <input
          type="number"
          min="0"
          value={item.save_the_date_ta_nos || 0}
          onChange={(e) =>
            handleRSVPChange(index, 'save_the_date_ta_nos', e.target.value)
          }
          className="form-input w-full"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">TO Nos</label>
        <input
          type="number"
          min="0"
          value={item.save_the_date_to_nos || 0}
          onChange={(e) =>
            handleRSVPChange(index, 'save_the_date_to_nos', e.target.value)
          }
          className="form-input w-full"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Travel Counsellors</label>
        <input
          type="number"
          min="0"
          value={item.save_the_date_travel_counsellors_nos || 0}
          onChange={(e) =>
            handleRSVPChange(index, 'save_the_date_travel_counsellors_nos', e.target.value)
          }
          className="form-input w-full"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Influencers</label>
        <input
          type="number"
          min="0"
          value={item.save_the_date_influencers_nos || 0}
          onChange={(e) =>
            handleRSVPChange(index, 'save_the_date_influencers_nos', e.target.value)
          }
          className="form-input w-full"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Total</label>
        <input
          type="number"
          min="0"
          value={item.save_the_date_total_nos || 0}
          onChange={(e) =>
            handleRSVPChange(index, 'save_the_date_total_nos', e.target.value)
          }
          className="form-input w-full"
        />
      </div>
    </div>

    {/* Main Invitation Section */}
    <h4 className="text-md font-medium text-blue-700 mb-2">Main Invitation</h4>
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm text-gray-600 mb-1">Invitation Date</label>
        <input
          type="date"
          value={item.main_invitation_date || ''}
          onChange={(e) =>
            handleRSVPChange(index, 'main_invitation_date', e.target.value)
          }
          className="form-input w-full"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Confirmation Date</label>
        <input
          type="date"
          value={item.main_invitation_confirmation_date || ''}
          onChange={(e) =>
            handleRSVPChange(index, 'main_invitation_confirmation_date', e.target.value)
          }
          className="form-input w-full"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">TA Nos</label>
        <input
          type="number"
          min="0"
          value={item.main_invitation_ta_nos || 0}
          onChange={(e) =>
            handleRSVPChange(index, 'main_invitation_ta_nos', e.target.value)
          }
          className="form-input w-full"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">TO Nos</label>
        <input
          type="number"
          min="0"
          value={item.main_invitation_to_nos || 0}
          onChange={(e) =>
            handleRSVPChange(index, 'main_invitation_to_nos', e.target.value)
          }
          className="form-input w-full"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Travel Counsellors</label>
        <input
          type="number"
          min="0"
          value={item.main_invitation_travel_counsellors_nos || 0}
          onChange={(e) =>
            handleRSVPChange(index, 'main_invitation_travel_counsellors_nos', e.target.value)
          }
          className="form-input w-full"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Influencers</label>
        <input
          type="number"
          min="0"
          value={item.main_invitation_influencers_nos || 0}
          onChange={(e) =>
            handleRSVPChange(index, 'main_invitation_influencers_nos', e.target.value)
          }
          className="form-input w-full"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Total</label>
        <input
          type="number"
          min="0"
          value={item.main_invitation_total_nos || 0}
          onChange={(e) =>
            handleRSVPChange(index, 'main_invitation_total_nos', e.target.value)
          }
          className="form-input w-full"
        />
      </div>
    </div>
  </div>
))}


  <button
    type="button"
    onClick={handleAddRSVP}
    className="mt-3 px-5 py-2 bg-gray-700 text-white rounded"
  >
    + Add RSVP
  </button>
</div>

      {/* 1)AV & Setting up Section @2Hotel supe name  */}

      <div id="av" className="section-container">
  {/* Header */}
  <div className="flex justify-between items-center mb-5">
    <h2 className="text-xl font-semibold text-slate-800">Hotel AV Setup</h2>
    <button
      onClick={saveAVSetup}
      disabled={saving === 'av'}
      className={`action-button ${saving === "av" ? "opacity-50 cursor-not-allowed" : ""}`}      
    >
      {saving === 'av' ? 'Saving...' : 'Save Hotel AV Setup'}
    </button>
  </div>

  {/* Form Grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    <div>
      <label className="block mb-1 font-medium text-slate-700">Backdrop</label>
      <input
        type="text"
        value={avSetup.backdrop}
        onChange={(e) => setAvSetup({ ...avSetup, backdrop: e.target.value })}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <div>
      <label className="block mb-1 font-medium text-slate-700">Screen</label>
      <input
        type="text"
        value={avSetup.screen}
        onChange={(e) => setAvSetup({ ...avSetup, screen: e.target.value })}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <div>
      <label className="block mb-1 font-medium text-slate-700">Mic</label>
      <input
        type="text"
        value={avSetup.mic}
        onChange={(e) => setAvSetup({ ...avSetup, mic: e.target.value })}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <div>
      <label className="block mb-1 font-medium text-slate-700">Projector</label>
      <input
        type="text"
        value={avSetup.projector}
        onChange={(e) => setAvSetup({ ...avSetup, projector: e.target.value })}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <div>
      <label className="block mb-1 font-medium text-slate-700">Stage</label>
      <input
        type="text"
        value={avSetup.stage}
        onChange={(e) => setAvSetup({ ...avSetup, stage: e.target.value })}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  </div>
</div>

 {/* Hotel av supplier Section */}
      <div id="av_supplier" className="section-container">
        <div className="section-header">
          <h2 className="section-title">Av Supplier</h2>
          <button  
            onClick={saveHotels}
            disabled={saving === "hotels"}
            className={`action-button ${saving === "hotels" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {saving === "hotels" ? "Saving..." : "Save Av Supplier"}
          </button>
        </div>

        {hotels.map((hotel, index) => (
          <div
            key={index}
            className="grid grid-cols-[2fr_1fr_auto_auto] gap-2 items-center mb-3 p-3 bg-gray-50 rounded-lg"
          >
             {/* Sponsor supplier */}
            <input
              type="text"
              placeholder="supplier"
              value={hotel.sponsor}
              onChange={(e) => handleHotelChange(index, "sponsor", e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md"
            />
            {/* Hotel Name */}
            <input
              type="text"
              placeholder="name"
              value={hotel.name}
              onChange={(e) => handleHotelChange(index, "name", e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md"
            />

            {/* Select Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={hotel.selected}
                onChange={(e) => handleHotelChange(index, "selected", e.target.checked)}
              />
              <span className="text-sm">Select</span>
            </div>

            {/* Delete Button */}
            {hotels.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveHotel(index)}
                className="small-delete-btn"
                title="Remove"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="small-delete-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}

        {/* Add Hotel Button */}
        <button
          type="button"
          onClick={handleAddHotel}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 mt-3"
        >
          + Add Av Supplier
        </button>
      </div>

    
{/*embassy*/}

      <div id="embassy" className="section-container">
  {/* Header */}
  <div className="flex justify-between items-center mb-5">
    <h2 className="text-xl font-semibold text-slate-800">Embassy / Consulate</h2>
    <button
      onClick={saveEmbassy}
      disabled={saving === 'embassy'}
      className={`action-button ${saving === "embassy" ? "opacity-50 cursor-not-allowed" : ""}`}     
    >
      {saving === 'embassy' ? 'Saving...' : 'Save Embassy'}
    </button>
  </div>

  {/* Input Fields */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
    {/* Chief Guest */}
    <div>
      <label className="block mb-1 font-medium text-gray-700">Chief Guest</label>
      <input
        type="text"
        value={embassy.cheif_guest || ''}
        onChange={(e) => setEmbassy({ ...embassy, cheif_guest: e.target.value })}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    {/* Chief Guest Designation */}
    <div>
      <label className="block mb-1 font-medium text-gray-700">Chief Guest Designation</label>
      <input
        type="text"
        value={embassy.cheif_guest_designation || ''}
        onChange={(e) => setEmbassy({ ...embassy, cheif_guest_designation: e.target.value })}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    {/* Chief Guest Phone */}
    <div>
      <label className="block mb-1 font-medium text-gray-700">Chief Guest Phone</label>
      <input
        type="text"
        value={embassy.cheif_guest_phone || ''}
        onChange={(e) => setEmbassy({ ...embassy, cheif_guest_phone: e.target.value })}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    {/* Accommodation Contact */}
    <div>
      <label className="block mb-1 font-medium text-gray-700">Accommodation Contact</label>
      <input
        type="text"
        value={embassy.accommodation_contact || ''}
        onChange={(e) => setEmbassy({ ...embassy, accommodation_contact: e.target.value })}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    {/* Accommodation Address */}
    <div>
      <label className="block mb-1 font-medium text-gray-700">Accommodation Address</label>
      <input
        type="text"
        value={embassy.accommodation_address || ''}
        onChange={(e) => setEmbassy({ ...embassy, accommodation_address: e.target.value })}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    {/* Accommodation Phone */}
    <div>
      <label className="block mb-1 font-medium text-gray-700">Accommodation Phone</label>
      <input
        type="text"
        value={embassy.accommodation_phone || ''}
        onChange={(e) => setEmbassy({ ...embassy, accommodation_phone: e.target.value })}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  </div>
</div>    


{/* Client Section */}
      <div id="client" className="section-container">
        <div className="section-header">
          <h2 className="section-title">Client</h2>
          <button  
            onClick={saveClient}
            disabled={saving === "clients"}
            className={`action-button ${saving === "clients" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {saving === "clients" ? "Saving..." : "Save clients"}
          </button>
        </div>

        {clients.map((client, index) => (
          <div
            key={index}
            className="grid grid-cols-[2fr_1fr_auto_auto] gap-3 items-center mb-3 p-3 bg-gray-50 rounded-lg"
          >
             {/* client name */}
            <input
              type="text"
              placeholder="name"
              value={client.name}
              onChange={(e) => handleClientChange(index, "name", e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md"
            />
            {/* client Hotel  */}
            <input
              type="text"
              placeholder="hotel"
              value={client.hotel}
              onChange={(e) => handleClientChange(index, "hotel", e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md"
            />

             {/* client address  */}
            <input
              type="text"
              placeholder="address"
              value={client.address}
              onChange={(e) => handleClientChange(index, "address", e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md"
            />


            {/* Delete Button */}
            {clients.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveClient(index)}
                className="small-delete-btn"
                title="Remove"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="small-delete-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}

        {/* Add Client Button */}
        <button
          type="button"
          onClick={handleAddClient}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 mt-3"
        >
          + Add Client
        </button>
      </div>

      {/* Checklists Section */}
      <div id="checklist" className="section-container">
        <div className="section-header">
          <h2 className="section-title">Check List</h2>
          <button
            onClick={saveChecklists}
            disabled={saving === "checklists"}
            className={`action-button ${saving === "checklists" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {saving === "checklists" ? "Saving..." : "Save Checklists"}
          </button>
        </div>

        {checklists.map((checklist, index) => (
          <div
            key={index}
            className="grid grid-cols-[2fr_auto_auto] gap-3 items-center mb-3 p-3 bg-gray-50 rounded-lg"
          >
            {/* checklist Name */}
            <input
              type="text"
              placeholder="name"
              value={checklist.name}
              onChange={(e) => handleChecklistChange(index, "name", e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md"
            />

            {/* Select Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={checklist.selected}
                onChange={(e) => handleChecklistChange(index, "selected", e.target.checked)}
              />
              <span className="text-sm">Select</span>
            </div>

            {/* Delete Button */}
            {checklists.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemovechecklist(index)}
                className="small-delete-btn"
                title="Remove"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="small-delete-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}

        {/* Add Checklist Button */}
        <button
          type="button"
          onClick={handleAddChecklist}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 mt-3"
        >
          + Add Checklist
        </button>
      </div>

      {/* Menu File Upload Section 
      <div className="section-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#2c3e50', margin: 0 }}>Menu</h2>
          <button 
            onClick={saveMenu}
            disabled={saving === 'menu'}
            style={{
              padding: '8px 20px',
              background: saving === 'menu' ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: saving === 'menu' ? 'not-allowed' : 'pointer'
            }}
          >
            {saving === 'menu' ? 'Uploading...' : 'Upload Menu'}
          </button>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Upload Menu File</label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={(e) => setMenuFile(e.target.files[0])}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '5px'
            }}
          />
          <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
            Upload file size 1MB, format files: jpg, jpeg, png
          </small>
          {menuFile && (
            <div style={{ marginTop: '10px', padding: '10px', background: '#d1ecf1', borderRadius: '5px' }}>
              Selected file: {menuFile.name}
            </div>
          )}
        </div>
      </div>*/}

      {/* Menu File Upload Section 
<div id="menu" className="section-container">
   Header 
  <div className="flex justify-between items-center mb-5">
    <h2 className="text-xl font-semibold text-slate-800">Menu</h2>
    <button
      onClick={saveMenu}
      disabled={saving === 'menu'}
      className={`px-5 py-2 rounded-md text-white font-medium transition-colors duration-200 ${
        saving === 'menu'
          ? 'bg-gray-500 cursor-not-allowed'
          : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
      }`}
    >
      {saving === 'menu' ? 'Uploading...' : 'Upload Menu'}
    </button>
  </div>
 
  {menuFile && menuFile.fileName &&   (
  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
    <span className="font-medium">Uploaded Menu File:</span>
    <a
      href={`http://localhost:5000/uploads/menu/${menuFile.filePath.replace(/.*uploads[\\/]/, 'uploads/')}`}
      target="_blank"
      rel="noreferrer"
      className="text-blue-600 underline ml-2"
    >
      {menuFile.fileName}
    </a>
  </div>
)}

 File Upload Input 
  <div className="space-y-3">
    <label className="block font-medium text-gray-700">Upload Menu File</label>
    <input
      type="file"
      accept=".jpg,.jpeg,.png"
      onChange={(e) => setMenuFile(e.target.files[0])}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />

    <small className="text-gray-500 block">
      Upload file size up to <span className="font-semibold">1MB</span>, supported formats: <span className="font-semibold">.jpg, .jpeg, .png</span>
    </small>

     Selected File Preview 
   
    {menuFile && (
      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
        <span className="font-medium">Selected file:</span> {menuFile.name}
      </div>
    )}
  </div>
</div>*/}

<div id="menu" className="section-container">
  {/* Header */}
  <div className="flex justify-between items-center mb-5">
    <h2 className="text-xl font-semibold text-slate-800">Menu</h2>
    <button
      onClick={saveMenu}
      disabled={saving === 'menu'}
      className={`px-5 py-2 rounded-md text-white font-medium transition-colors duration-200 ${
        saving === 'menu'
          ? 'bg-gray-500 cursor-not-allowed'
          : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
      }`}
    >
      {saving === 'menu' ? 'Uploading...' : 'Upload Menu'}
    </button>
  </div>

  {/* File Upload Input */}
  <div className="space-y-3">
    <label className="block font-medium text-gray-700">Upload Menu File</label>
    <input
      type="file"
      accept=".jpg,.jpeg,.png"
      onChange={(e) => setMenuFile(e.target.files[0])}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />

    <small className="text-gray-500 block">
      Upload file size up to <span className="font-semibold">1MB</span>, supported formats:
      <span className="font-semibold">.jpg, .jpeg, .png</span>
    </small>

    {/* ✅ Show either selected file (File object) or previously uploaded one */}
    {menuFile && (
      typeof menuFile === "object" && menuFile.name ? (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
          <span className="font-medium">Selected file:</span> {menuFile.name}
        </div>
      ) : menuFile.fileName ? (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
          <span className="font-medium">Uploaded Menu File:</span>
          <a
            href={`http://localhost:5000/${menuFile.filePath.replace(/.*uploads[\\/]/, 'uploads/menu/')}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline ml-2"
          >
            {menuFile.fileName}
          </a>
        </div>
      ) : null
    )}
  </div>
</div>


      {/* Remarks Section for Admin 
    <div id="remarks"className="section-container">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h2 className="text-xl font-semibold text-slate-800">Viewer Remarks</h2>
      </div>

      {remarks.length > 0 ? (
        remarks.map((r) => (
          <div
            key={r.id}
            style={{
              background: '#f8f9fa',
              padding: '12px',
              marginBottom: '8px',
              borderRadius: '5px',
              border: '1px solid #ddd',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <strong>{r.username || 'Viewer'}:</strong> {r.remarktext}
            </div>
            <button
              onClick={() => handleToggleRemark(r.id)}
              style={{
                background: r.isapproved ? '#28a745' : '#ffc107',
                color: r.isapproved ? 'white' : 'black',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {r.isapproved ? 'Resolved (Click to Pending)' : 'Pending (Click to Resolve)'}
            </button>
          </div>
        ))
      ) : (
        <p>No remarks yet.</p>
      )}
    </div>*/}
{/* Remarks Section for Admin */}
<div id="remarks" className="section-container">
  <div className="flex justify-between items-center mb-5">
    <h2 className="text-xl font-semibold text-slate-800">Viewer Remarks</h2>
  </div>

  {remarks.length > 0 ? (
    remarks.map((r) => (
      <div
        key={r.id}
        className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-md p-3 mb-2 shadow-sm"
      >
        <div className="text-gray-800">
          <strong className="font-medium">{r.username || 'Viewer'}:</strong>{' '}
          <span className="text-gray-700">{r.remarktext}</span>
        </div>
        <button
          onClick={() => handleToggleRemark(r.id)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition duration-200 ${
            r.isapproved
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-yellow-400 text-black hover:bg-yellow-500'
          }`}
        >
          {r.isapproved
            ? 'Resolved (Click to Pending)'
            : 'Pending (Click to Resolve)'}
        </button>
      </div>
    ))
  ) : (
    <p className="text-gray-500">No remarks yet.</p>
  )}
</div>


    

    {/* Print Section */}
<div id="print" className="flex justify-center mt-8 mb-10">
  <button
    onClick={() => window.print()}
    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow-md hover:bg-blue-700 transition duration-200 flex items-center gap-2"
  >
    <span role="img" aria-label="print">🖨️</span>
    Print Page
  </button>
</div>
      </div>
     </div>

    </div>
  );
    
};

export default ProjectDetails;
