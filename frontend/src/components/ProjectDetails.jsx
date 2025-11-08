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

 const [saveDate, setSaveDate] = useState({ date: "", ta: 0, tc: 0, to: 0, media: 0, total: 0 });
const [mainInvites, setMainInvites] = useState([{ date: "", ta: 0, tc: 0, to: 0, media: 0, total: 0 }]);
const [totals, setTotals] = useState({ ta: 0, tc: 0, to: 0, media: 0 });
const [saveTheDateImage, setSaveTheDateImage] = useState(null);
const [saveTheDateImageURL, setSaveTheDateImageURL] = useState("");
const [mainInviteImage, setMainInviteImage] = useState(null);
const [mainInviteImageURL, setMainInviteImageURL] = useState("");

const [columnTotals, setColumnTotals] = useState({
  ta: 0,
  tc: 0,
  to: 0,
  media: 0,
  total: 0,
});
const handleSaveDateChange = (field, value) => {
  const updated = { ...saveDate, [field]: Number(value) || 0 };
  updated.total = updated.ta + updated.tc + updated.to + updated.media;
  setSaveDate(updated);
  updateTotals(updated, mainInvites);
};

const handleMainInviteChange = (index, field, value) => {

  const updatedInvites = mainInvites.map((invite, i) =>
    i === index ? { ...invite, [field]: Number(value) || 0 } : invite
  );
  updatedInvites[index].total =
    updatedInvites[index].ta + updatedInvites[index].tc + updatedInvites[index].to + updatedInvites[index].media;
  setMainInvites(updatedInvites);
  updateTotals(saveDate, updatedInvites);
};

// Compute Column Totals (like in your DB)
const updateColumnTotals = (invites) => {
  const totals = { ta: 0, tc: 0, to: 0, media: 0, total: 0 };
  invites.forEach((invite) => {
    totals.ta += Number(invite.ta || 0);
    totals.tc += Number(invite.tc || 0);
    totals.to += Number(invite.to || 0);
    totals.media += Number(invite.media || 0);
    totals.total += Number(invite.total || 0);
  });
  setColumnTotals(totals);
};

const addMainInvite = () =>
  setMainInvites([...mainInvites, { date: "", ta: 0, tc: 0, to: 0, media: 0, total: 0 }]);

const removeMainInvite = (index) =>
  setMainInvites(mainInvites.filter((_, i) => i !== index));

const updateTotals = (saveDate, mainInvites) => {
  const totals = { ta: saveDate.ta, tc: saveDate.tc, to: saveDate.to, media: saveDate.media };
  mainInvites.forEach((invite) => {
    totals.ta += invite.ta;
    totals.tc += invite.tc;
    totals.to += invite.to;
    totals.media += invite.media;
  });
  setTotals(totals);
};

  // Core project details
  const [details, setDetails] = useState({
    roadshowName: '',    event_date: '',    associate: '',
    budget: '',
    // Optional: add description for create flow
    image_file: '',    project_handiled_by:''
  });

  const [venues, setVenues] = useState([{ name: '', currency: 'INR', rate: '', rateInput:'', budget: '', bugetInput:'',
       selected: false , venue_rental:false, av:false, food:false, bar:false}]);
 
  const [associates, setAssociates] = useState([{ name: '',city:'',  selected: false }]);
 // const [tradeDatabase, setTradeDatabase] = useState([{ trade_name: '', travel_operator: '' ,travel_agent:'',travel_counsellor:'',media_influencers:''}]); 
  const defaultTrades = [
  { trade_name: 'Associate', travel_operator: '', travel_agent: '', travel_counsellor: '', media_influencers: '' },
  { trade_name: 'Stark', travel_operator: '', travel_agent: '', travel_counsellor: '', media_influencers: '' },
  { trade_name: 'Consulate / embassy', travel_operator: '', travel_agent: '', travel_counsellor: '', media_influencers: '' },
  { trade_name: 'Kerala trade', travel_operator: '', travel_agent: '', travel_counsellor: '', media_influencers: '' },
  { trade_name: 'KTM', travel_operator: '', travel_agent: '', travel_counsellor: '', media_influencers: '' },
  { trade_name: 'Others', travel_operator: '', travel_agent: '', travel_counsellor: '', media_influencers: '' },
];
const [tradeDatabase, setTradeDatabase] = useState(defaultTrades);

const defaultChecklists = [
          { name: 'Visiting Card', selected: false },
          { name: 'Mementos', selected: false },
          { name: 'Presentation', selected: false },
          { name: 'Gifts', selected: false },
          { name: 'Others', selected: false },
        ];

const [checklists, setChecklists] = useState(defaultChecklists);
       
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
  const [avSetup, setAvSetup] = useState({    backdrop: '',    screen: '',    mic: '',    type:'',    projector: false,    podium: false,   backdrop_image:null,screen_image:null,stage_image:null });

  const [embassy, setEmbassy] = useState({    cheif_guest: '',    cheif_guest_designation: '',    cheif_guest_phone: '',    accommodation_contact: '',
    accommodation_address: '',    accommodation_phone:''  });

  const [clients, setClients] = useState({name: '',designation:'', contact:'',hotel:''});
//const [checklists, setChecklists] = useState([{ name: '',  selected: false }]);
const [menuFile, setMenuFile] = useState({    fileName: '',    fileType: '',    fileSize: '',    filePath:''  });
  const [workingDaysLeft, setWorkingDaysLeft] = useState(0);
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

  // Utility to count working days (Mon–Fri) between today and the event date
const calculateWorkingDays = (eventDateStr) => {
  if (!eventDateStr) return 0;
  const today = new Date();
  const eventDate = new Date(eventDateStr);

  // If event date is before today, show 0
  if (eventDate < today) return 0;

  let count = 0;
  let current = new Date(today);

  // Move day by day until event date
  while (current < eventDate) {
    const day = current.getDay();
    // 0 = Sunday, 6 = Saturday
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  // Optionally deduct 1 if you want to *exclude the event day itself*
  // (for example, if the event is on the 14th and today is the 4th)
  // Uncomment if desired:
  // count = Math.max(0, count - 1);

  return count;
};
  
  // Initialize on mount
useEffect(() => {
  updateColumnTotals(mainInvites);
}, [mainInvites]);
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
            event_date: formattedDate,          
            budget: d.budget || '',
            image_file:projectRes.data.image_file || "",
            project_handiled_by:d.project_handiled_by ||'',
          });
          
          setAssociates(d.associates || []);
          setVenues(d.venues || []);
         // setTradeDatabase(d.trade_database || []);
         setTradeDatabase(d.trade_database && d.trade_database.length > 0
        ? d.trade_database
        : defaultTrades
        );
          setHotels(d.hotels || []);
          setRsvp(d.rsvp || []);        
          setInvitationFile(d.rsvp?.[0]?.invitation_design_file_path || '');
          
          setAvSetup(d.av_setup || {});
          setEmbassy(d.embassy || {});         
          setClients(d.clients || {});   
          
          

          setChecklists(d.checklist && d.checklist.length > 0
          ? d.checklist 
          : defaultChecklists
        );

          
        
         
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

  useEffect(() => {
  if (details.event_date) {
    const days = calculateWorkingDays(details.event_date);
    setWorkingDaysLeft(days);
  }
}, [details.event_date]);

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
      const formData = new FormData();
     // roadshow_name: details.roadshowName,
       // event_date: details.event_date,
       // image_file: details.image_file || null, // add this line  

    formData.append('roadshow_name', details.roadshowName);
    formData.append('event_date', details.event_date);
    formData.append('budget', details.budget);
    formData.append('project_handiled_by', details.project_handiled_by);

    if (details.image_file instanceof File) {
      formData.append('image_file', details.image_file);
    }
      await projectSectionsAPI.updateRoadshow(id, formData);
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
  //console.log( JSON.stringify(rsvp));
    await projectSectionsAPI.updateRSVP(id, formData);
    showMessage('RSVP saved successfully!');
  } catch (e) {
    console.error(e);
    alert('Failed to save RSVP');
  } finally {
    setSaving('');
  }
};
const saveMainInvites =async() =>{
  try {
    setSaving('main invites');
    showMessage('main invites successfully!');
    //Impliement APi call here
  } catch (e) {
    console.error(e);
    alert('Failed to save main invites');
  } finally {
    setSaving('');
  }

};

  const saveAVSetup = async () => {
    try {
      setSaving('av');
      const formData = new FormData();
      formData.append("backdrop", avSetup.backdrop);
      formData.append("screen", avSetup.screen);
      formData.append("mic", avSetup.mic);
      formData.append("type", avSetup.type);
      formData.append("projector", avSetup.projector);
      formData.append("podium", avSetup.podium);      

      if (avSetup.backdrop_image instanceof File)
        formData.append("backdrop_image", avSetup.backdrop_image);
      if (avSetup.screen_image instanceof File)
        formData.append("screen_image", avSetup.screen_image);
      if (avSetup.stage_image instanceof File)
        formData.append("stage_image", avSetup.stage_image);


      await projectSectionsAPI.updateAVSetup(id, formData);
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
    setAssociates([...associates, { name: '',city:'', selected: false }]);
  };
  const handleAssociateChange = (index, field, value) => {
    setAssociates(associates.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };
  const handleRemoveAssociate = (index) => {
    setAssociates(associates.filter((_, i) => i !== index));
  };

  // Venue handlers
  const handleAddVenue = () => {
    setVenues([...venues, { name: '', currency: 'INR',rate: '',    rateInput:'',   budget: '',  budgetInput:'',
      selected: false , venue_rental: false, av: false, food: false, bar: false}]);
  };
  const handleVenueChange = (index, field, value) => {
    setVenues(venues.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };
  const handleRemoveVenue = (index) => {
    setVenues(venues.filter((_, i) => i !== index));
  };

  const parseNumberInput = (value, currency) => { 
  if (!value) return "";
  let v = value.toString().trim();
  if (currency === "EUR") {
    v = v.replace(/\./g, "").replace(",", ".");
  } else {
    v = v.replace(/,/g, "");
  }
  const num = parseFloat(v);
  return isNaN(num) ? "" : num;
};

const formatNumberOutput = (value, currency) => {
  if (value === null || value === undefined || value === "") return "";

  const num = Number(value);
  if (isNaN(num)) return "";

  // Use locale formatting rules
  return num.toLocaleString(
    currency === "INR"
      ? "en-IN"
      : currency === "EUR"
      ? "de-DE" // Euro format: 1.234,56
      : "en-GB", // Pound: 1,234.56
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
};




  // Trade handlers
  const handleAddTrade = () => {
    setTradeDatabase([...tradeDatabase, { trade_name: '', travel_operator: '' ,travel_agent:'',travel_counsellor:'',media_influencers:'' }]);
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
    setClients([...clients, { name: '',designation:'', contact:'',hotel:'' }]);
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



  // ✅ Add this new useEffect below (do not put inside any other)
  useEffect(() => {
    const handleEnterKey = (e) => {
      if (e.key === "Enter") {
        const allowed = ["text", "number", "date"];
        if (!allowed.includes(e.target.type)) return;

        e.preventDefault();
             // Get all input and select fields in the document
      const inputs = Array.from(
        document.querySelectorAll(
          "input:not([type=hidden]):not([disabled]), select, textarea"
        )
      ).filter((el) => el.offsetParent !== null); // skip hidden
       const index = inputs.indexOf(e.target);
        const next = inputs[index + 1];
        if (next) {
        next.focus();
        // Optional scroll to view
        next.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    };

    document.addEventListener("keydown", handleEnterKey);
    return () => document.removeEventListener("keydown", handleEnterKey);
  }, []);

  
  
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
          <h1 className="page-title">{project.name}</h1>          
        </div>

         {message && (
        <div className="success-message">
          {message}
        </div>
      )}
       {/*Progress Bar*/}
          <div className="text-right">
        <label className="font-medium text-slate-700">Completion Progress</label>

        <div className="w-full bg-gray-200 rounded-lg h-5 overflow-hidden mt-1.5">
          <div
            className={`h-full transition-all duration-500 ${
              progress === 100 ? 'bg-blue-600' : 'bg-green-600'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-right text-sm text-gray-700 mt-1">
          {progress}% Completed
        </div>
      </div>
      </div>
       
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
{/* ✅ Roadshow Information Section */}
<div id="information" className="section-container">
  {/* Header */}
  <div className="section-header">
    <h2 className="section-title">Information</h2>
    <button
      onClick={saveRoadshowInfo}
      disabled={saving === "roadshow"}
      className={`action-button ${
        saving === "roadshow" ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {saving === "roadshow" ? "Saving..." : "Save Roadshow Info"}
    </button>
  </div>

  {/* Body */}
  <div className="grid grid-cols-1 gap-5 mt-4">
    {/* ✅ Row 1: Name + Image */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
      {/* Name */}
      <div className="form-group">
        <label className="form-label">Name</label>
        <input
          type="text"
          value={details.roadshowName}
          onChange={(e) =>
            setDetails({ ...details, roadshowName: e.target.value })
          }
          className="form-input"
        />
      </div>

      {/* Image + Upload */}
      <div className="form-group flex flex-col items-start">
        <label className="form-label">Project Image</label>
        <div className="flex items-center gap-4">
          {details.image_file ? (
            <>
              <img
                src={
                  typeof details.image_file === "object"
                    ? URL.createObjectURL(details.image_file)
                    : details.image_file
                }
                alt={details.roadshowName}
                style={{
                  width: "220px",
                  display:"none",
                  height: "190px",
                  objectFit: "cover",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
                onError={(e) => (e.target.style.display = "none")}
              />

              {typeof details.image_file === "string" && (
                <a
                  href={details.image_file}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  View Full Image
                </a>
              )}
            </>
          ) : (
            <div className="text-gray-500 text-sm">No image</div>
          )}
        </div>

        {/* Upload new file */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setDetails({ ...details, image_file: e.target.files[0] })
          }
          className="mt-2 text-xs"
        />
      </div>
    </div>

    {/* ✅ Row 2: Project handled by + Event Date + Budget */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Project handled by */}
      <div className="form-group">
        <label className="form-label">Project handled by</label>
        <input
          type="text"
          value={details.project_handiled_by}
          onChange={(e) =>
            setDetails({ ...details, project_handiled_by: e.target.value })
          }
          className="form-input"
        />
      </div>

      {/* Event Date */}
      <div className="form-group">
        <label className="form-label">Event Date</label>
        <input
          type="date"
          value={details.event_date || ""}
          onChange={(e) =>
            setDetails({ ...details, event_date: e.target.value })
          }
          className="form-input"
        />
      </div>

      {/* Budget */}
      <div className="form-group">
        <label className="form-label">Budget (INR)</label>
        <input
           type="text"
          value={
            details.budget
              ? Number(details.budget).toLocaleString('en-IN') // 👈 comma format for Indian locale
              : ''
          }
          onChange={(e) => {
            // Remove commas before saving to state
            const rawValue = e.target.value.replace(/,/g, '');
            if (!isNaN(rawValue)) {
              setDetails({ ...details, budget: rawValue });
            }
          }}
          className="form-input text-right"
        />
      </div>
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
            className="flex flex-wrap md:flex-nowrap items-center gap-4 mb-2 p-3 bg-gray-50 rounded-lg"
          >
            {/* Associate Name */}
            <input
              type="text"
              placeholder="Associate"
              value={associate.name}
              onChange={(e) => handleAssociateChange(index, "name", e.target.value)}
              className="flex-1 min-w-[140px] px-2 py-2 border border-gray-300 rounded-md"
            />

            {/* Associate City */}
            <input
              type="text"
              placeholder="City"
              value={associate.city}
              onChange={(e) => handleAssociateChange(index, "city", e.target.value)}
              className="flex-1 min-w-[140px] px-2 py-2 border border-gray-300 rounded-md"
            />

            {/* Select Checkbox */}
            <div className="flex items-center gap-2 ml-2 mr-3 whitespace-nowrap">
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
                className="ml-auto p-1.5 text-red-600 hover:text-red-800 transition"
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
     
      {/* Venues Section  add after hotel checkboxes of rental,av,food,bar*/}
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
            className="grid grid-cols-[1.2fr_1.4fr_0.6fr_0.7fr_0.7fr_auto_auto] gap-3 items-center mb-3 p-3 bg-gray-50 rounded-lg"
          >
            {/* Venue Name */}
            <input
              type="text"
              placeholder="Venue Name"
              value={venue.name}
              onChange={(e) => handleVenueChange(index, "name", e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md"
            />

        

   {/* ✅ Compact Checkboxes */}
{/* Checkbox group */}
<div className="flex flex-row flex-wrap gap-x-3 gap-y-1 items-center justify-start">
  {[
    { key: "venue_rental", label: "Venue Rental" },
    { key: "av", label: "AV" },
    { key: "food", label: "Food" },
    { key: "bar", label: "Bar" },
  ].map(({ key, label }) => (
    <label
      key={key}
      className="flex items-center gap-1 text-sm text-gray-700 whitespace-nowrap"
    >
      <input
        type="checkbox"
        checked={venue[key] || false}
        onChange={(e) => handleVenueChange(index, key, e.target.checked)}
        className="accent-blue-600 h-3 w-3"
      />
      {label}
    </label>
  ))}
</div>

{/* Currency Dropdown */}
<select
  value={venue.currency || "INR"}
  onChange={(e) => {
    const newCurrency = e.target.value;
    handleVenueChange(index, "currency", newCurrency);

    // ✅ Reformat displayed rate/budget when currency changes
    handleVenueChange(
      index,
      "rateInput",
      formatNumberOutput(venue.rate, newCurrency)
    );
    handleVenueChange(
      index,
      "budgetInput",
      formatNumberOutput(venue.budget, newCurrency)
    );
  }}
  className="px-2 py-2 border border-gray-300 rounded-md"
>
  <option value="INR">INR</option>
  <option value="EUR">Euro</option>
  <option value="GBP">Pound</option>
</select>

{/* Rate Input */}
<input
  type="text"
  placeholder="Rate"
  value={
    venue.rateInput !== undefined && venue.rateInput !== ""
      ? venue.rateInput
      : formatNumberOutput(venue.rate, venue.currency)
  }
  onChange={(e) => handleVenueChange(index, "rateInput", e.target.value)}
  onBlur={(e) => {
    const parsed = parseNumberInput(e.target.value, venue.currency);
    handleVenueChange(index, "rate", parsed);
    handleVenueChange(
      index,
      "rateInput",
      formatNumberOutput(parsed, venue.currency)
    );
  }}
  className="px-2 py-2 border border-gray-300 rounded-md text-right"
/>

{/* Budget Input */}
<input
  type="text"
  placeholder="Budget"
  value={
    venue.budgetInput !== undefined && venue.budgetInput !== ""
      ? venue.budgetInput
      : formatNumberOutput(venue.budget, venue.currency)
  }
  onChange={(e) => handleVenueChange(index, "budgetInput", e.target.value)}
  onBlur={(e) => {
    const parsed = parseNumberInput(e.target.value, venue.currency);
    handleVenueChange(index, "budget", parsed);
    handleVenueChange(
      index,
      "budgetInput",
      formatNumberOutput(parsed, venues.currency)
    );
  }}
  className="px-2 py-2 border border-gray-300 rounded-md text-right"
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
                className="ml-auto p-1.5 text-red-600 hover:text-red-800 transition"
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


  <div id="database" className="section-container">
  {/* Header */}
  <div className="flex justify-between items-center mb-5">
    <h2 className="text-xl font-semibold text-slate-800">Trade Database</h2>
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
    {tradeDatabase.map((trade, index) => {
      const categoryTotal = 
        (Number(trade.travel_operator) || 0) +
        (Number(trade.travel_agent) || 0) +
        (Number(trade.travel_counsellor) || 0) +
        (Number(trade.media_influencers) || 0);

      return (
        <div
          key={index}
          className="grid grid-cols-1 md:grid-cols-[2fr_repeat(4,1fr)_auto,_auto] gap-3 items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
        >
          {/* Trade Name */}
           
        <input
          type="text"
          placeholder="Trade Name"
          value={trade.trade_name}
          onChange={(e) => handleTradeChange(index, 'trade_name', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
          {/* Travel Operator */}
          <input
            type="number"
            placeholder="Travel Operator"
            value={trade.travel_operator}
            onChange={(e) => handleTradeChange(index, 'travel_operator', e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          />

          {/* Travel Agent */}
          <input
            type="number"
            placeholder="Travel Agent"
            value={trade.travel_agent}
            onChange={(e) => handleTradeChange(index, 'travel_agent', e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          />

          {/* Counsellor */}
          <input
            type="number"
            placeholder="Travel Counselor"
            value={trade.travel_counsellor}
            onChange={(e) => handleTradeChange(index, 'travel_counsellor', e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          />

          {/* Media_influencers */} 
          <input
            type="number"
            placeholder="Media / Influence"
            value={trade.media_influencers}
            onChange={(e) => handleTradeChange(index, 'media_influencers', e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          />

          {/* Category Total */}
          <div className="font-semibold text-center text-slate-800">
            {categoryTotal}
          </div>

          {/* Delete Button (optional) */}
          {tradeDatabase.length > 1 && (
            <button
              onClick={() => handleRemoveTrade(index)}
              title="Remove"
              className="ml-auto p-1.5 text-red-600 hover:text-red-800 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          )}
        </div>
      );
    })}
  </div>

  {/* Grand Total */}
  <div className="grid grid-cols-[2fr_repeat(4,1fr)_auto] gap-3 items-center mt-5 p-3 bg-gray-200 rounded-lg font-semibold text-slate-900">
      <div>Column Totals →</div>
  <div>
    {tradeDatabase.reduce((sum, t) => sum + (Number(t.travel_operator) || 0), 0)}
  </div>
  <div>
    {tradeDatabase.reduce((sum, t) => sum + (Number(t.travel_agent) || 0), 0)}
  </div>
  <div>
    {tradeDatabase.reduce((sum, t) => sum + (Number(t.travel_counsellor) || 0), 0)}
  </div>
  <div>
    {tradeDatabase.reduce((sum, t) => sum + (Number(t.media_influencers) || 0), 0)}
  </div>
     <div className="text-right">
   
    {
      tradeDatabase.reduce(
        (sum, t) =>
          sum +
          (Number(t.travel_operator) || 0) +
          (Number(t.travel_agent) || 0) +
          (Number(t.travel_counsellor) || 0) +
          (Number(t.media_influencers) || 0),
        0
      )
    }
  </div>
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






{/*RSVP SECTION right total of ta..etc Total Readonly totla of ta to etc.. RSVP1 ->add image for main invitation-> save the date remove confirm date singe save ->remove main inviation RSVP2 multiple of main invitation remove confim date   
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

  {/*File Upload  href={`http://localhost:5000/uploads/rsvp/${invitationFile}`}
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
    </div>*/}

    {/* Save The Date Section 
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

      <div style={{ display: item.save_the_date_confirmation_date ? 'none' : 'block' }}>
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
    </div>*/}

    {/* Main Invitation Section
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
</div>*/} 

{/* RSVP SECTION 
<div id="rsvp" className="section-container">
  <div className="section-header">
    <h2 className="section-title">RSVP</h2>
  </div>

  {/* === SAVE THE DATE (single record) === 
  <div className="p-4 mb-6 bg-gray-50 border rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold text-gray-800 mb-2">Save The Date</h3>

    {/* Upload Save The Date image 
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">Save The Date Image Upload:</label>
      <input type="file" onChange={(e) => setSaveTheDateImage(e.target.files[0])} />
      {saveTheDateImageURL && (
        <div className="flex items-center gap-3 mt-2">
          <img
            src={saveTheDateImageURL}
            alt="Save The Date"
            className="w-24 h-16 object-cover rounded border"
          />
          <a href={saveTheDateImageURL} target="_blank" rel="noreferrer" className="text-blue-600 underline">
            View Full Image
          </a>
        </div>
      )}
    </div>

    {/* Save The Date fields 
    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-3">
      <input type="date" value={saveDate.date || ""} onChange={(e) => handleSaveDateChange("date", e.target.value)} className="form-input" />
      <input type="number" placeholder="Tour Operator" value={saveDate.to } onChange={(e) => handleSaveDateChange("to", e.target.value)} className="form-input" />
      <input type="number" placeholder="Travel Agent" value={saveDate.ta } onChange={(e) => handleSaveDateChange("ta", e.target.value)} className="form-input" />
      <input type="number" placeholder="Travel Counselor" value={saveDate.tc } onChange={(e) => handleSaveDateChange("tc", e.target.value)} className="form-input" />      
      <input type="number" placeholder="Media Influencers" value={saveDate.media } onChange={(e) => handleSaveDateChange("media", e.target.value)} className="form-input" />
      <input type="text" readOnly value={saveDate.total || 0} className="form-input bg-gray-100 font-semibold" />
    </div>

    <button onClick={saveRSVP} className="action-button">Save RSVP</button>
  </div>

  {/* === MAIN INVITATIONS (multiple) === 
  <div className="section-header mt-6">
    <h3 className="section-title">Main Invitations</h3>
    <button onClick={saveMainInvites} className="action-button">Save Main Invites</button>
  </div>

  {/* Upload Main Invite image 
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">Main Invite Image Upload:</label>
    <input type="file" onChange={(e) => setMainInviteImage(e.target.files[0])} />
    {mainInviteImageURL && (
      <div className="flex items-center gap-3 mt-2">
        <img src={mainInviteImageURL} alt="Main Invite" className="w-24 h-16 object-cover rounded border" />
        <a href={mainInviteImageURL} target="_blank" rel="noreferrer" className="text-blue-600 underline">View Full Image</a>
      </div>
    )}
  </div>

  {/* Table of Main Invites 
  {mainInvites.map((invite, index) => (
    const main_categoryTotal = 
        (Number(invite.to) || 0) +
        (Number(invite.ta) || 0) +
        (Number(invite.tc) || 0) +
        (Number(invite.media) || 0);
        return(
    <div key={index} className="p-3 mb-3 bg-gray-50 border rounded-lg grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
      <input type="date" value={invite.date || ""} onChange={(e) => handleMainInviteChange(index, "date", e.target.value)} className="form-input" />
      <input type="number" placeholder="Tour Operator" value={invite.to } onChange={(e) => handleMainInviteChange(index, "to", e.target.value)} className="form-input" />
      <input type="number" placeholder="Travel Agent" value={invite.ta } onChange={(e) => handleMainInviteChange(index, "ta", e.target.value)} className="form-input" />
      <input type="number" placeholder="Travel Counselor" value={invite.tc } onChange={(e) => handleMainInviteChange(index, "tc", e.target.value)} className="form-input" />      
      <input type="number" placeholder="Media Influencers" value={invite.media } onChange={(e) => handleMainInviteChange(index, "media", e.target.value)} className="form-input" />
      <input type="text" readOnly value={invite.total || 0} className="form-input bg-gray-100 font-semibold" />

      {/* Delete button 
      {mainInvites.length > 1 && (
        <button onClick={() => removeMainInvite(index)} className="text-red-600 ml-2">🗑</button>
      )}
    </div>)
        
  ))}
  

{/* Column Totals Row 
<div className="grid grid-cols-7 font-semibold text-sm bg-yellow-100 border-t border-gray-400">
  <div className="p-2 text-right pr-4">Column Totals →</div>
  <div className="p-2 text-center">{columnTotals.to}</div>
  <div className="p-2 text-center">{columnTotals.ta}</div>
  <div className="p-2 text-center">{columnTotals.tc}</div> 
  <div className="p-2 text-center">{columnTotals.media}</div>
  <div className="p-2 text-center">{columnTotals.total}</div>
  <div></div>
</div>*/}


{/* Grand Total 
  <div className="grid grid-cols-[2fr_repeat(4,1fr)_auto] gap-3 items-center mt-5 p-3 bg-gray-200 rounded-lg font-semibold text-slate-900">
      <div>Column Totals →</div>
  <div>
    {mainInvites.reduce((sum, t) => sum + (Number(t.travel_operator) || 0), 0)}
  </div>
  <div>
    {mainInvites.reduce((sum, t) => sum + (Number(t.travel_agent) || 0), 0)}
  </div>
  <div>
    {mainInvites.reduce((sum, t) => sum + (Number(t.travel_counsellor) || 0), 0)}
  </div>
  <div>
    {mainInvites.reduce((sum, t) => sum + (Number(t.media_influencers) || 0), 0)}
  </div>
     <div className="text-right">
   
    {
      mainInvites.reduce(
        (sum, t) =>
          sum +
          (Number(t.travel_operator) || 0) +
          (Number(t.travel_agent) || 0) +
          (Number(t.travel_counsellor) || 0) +
          (Number(t.media_influencers) || 0),
        0
      )
    }
  </div>
  </div>


  <button onClick={addMainInvite} className="px-4 py-2 bg-green-600 text-white rounded mt-2">+ Add Main Invite</button>

  {/* === Floating Totals Panel === 
  <div className="fixed right-5 top-1/3 bg-yellow-200 border border-yellow-400 rounded-lg shadow-lg p-3 text-sm">
    <h4 className="font-semibold text-gray-800 mb-2">Save The Date + Main Invite Nos</h4>
     <p>Tour Operator (TO): {totals.to}</p>
    <p>Travel Agent (TA): {totals.ta}</p>
    <p>Travel Counselor (TC): {totals.tc}</p>   
    <p>Media Influencers: {totals.media}</p>
  </div>
</div>*/}
 {/*<div id="rsvp" className="section-container">
  <div className="section-header">
    <h2 className="section-title">RSVP #1</h2>
  </div>
  === SAVE THE DATE (single record) === 
  <div className="p-4 mb-6 bg-gray-50 border rounded-lg shadow-sm">
    {/* Title + Save button aligned right 
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-semibold text-gray-800">Save The Date</h3>
      <button onClick={saveRSVP} className="action-button">
        Save RSVP
      </button>
    </div>*/}

  {/* === SAVE THE DATE (single record) === 
  <div className="p-4 mb-6 bg-gray-50 border rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold text-gray-800 mb-2">Save The Date</h3>
*/}
    {/* Upload Save The Date image 
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
        Save The Date Image Upload:
      </label>
      <input type="file" onChange={(e) => setSaveTheDateImage(e.target.files[0])} />
      {saveTheDateImageURL && (
        <div className="flex items-center gap-3 mt-2">
          <img
            src={saveTheDateImageURL}
            alt="Save The Date"
            className="w-24 h-16 object-cover rounded border"
          />
          <a
            href={saveTheDateImageURL}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            View Full Image
          </a>
        </div>
      )}
    </div>*/}

    {/* Fields 
    <div className="grid grid-cols-1 md:grid-cols-[1.5fr_repeat(4,1fr)_auto] gap-3 items-center mb-3">
      <input
        type="date"
        value={saveDate.date || ""}
        onChange={(e) => handleSaveDateChange("date", e.target.value)}
        className="form-input"
      />
      <input
        type="number"
        placeholder="Tour Operator"
        value={saveDate.to || ""}
        onChange={(e) => handleSaveDateChange("to", e.target.value)}
        className="form-input"
      />
      <input
        type="number"
        placeholder="Travel Agent"
        value={saveDate.ta || ""}
        onChange={(e) => handleSaveDateChange("ta", e.target.value)}
        className="form-input"
      />
      <input
        type="number"
        placeholder="Travel Counselor"
        value={saveDate.tc || ""}
        onChange={(e) => handleSaveDateChange("tc", e.target.value)}
        className="form-input"
      />
      <input
        type="number"
        placeholder="Media / Influence"
        value={saveDate.media || ""}
        onChange={(e) => handleSaveDateChange("media", e.target.value)}
        className="form-input"
      />
      {/* Total label 
      <div className="text-center font-semibold text-slate-800 bg-gray-100 rounded-md py-2">
        {(Number(saveDate.to) || 0) +
          (Number(saveDate.ta) || 0) +
          (Number(saveDate.tc) || 0) +
          (Number(saveDate.media) || 0)}
      </div>
    </div>
  <div className="text-right text-sm">
    <div className="text-gray-700 font-medium">Countdown</div>
    <div className="text-red-600 font-bold text-lg border border-red-500 inline-block px-3 py-1 rounded">
      {workingDaysLeft}
    </div>
    <div className="text-xs text-gray-500">working days</div>
  </div> 
         
   
  </div>*/}

  {/* === MAIN INVITATIONS (multiple) === 
  <div className="section-header mt-6">
    <h3 className="section-title">RSVP #2 Main Invite</h3>
    <button onClick={saveMainInvites} className="action-button">
      Save Main Invites
    </button>
  </div>*/}

  {/* Upload Main Invite image 
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">
      Main Invite Image Upload:
    </label>
    <input type="file" onChange={(e) => setMainInviteImage(e.target.files[0])} />
    {mainInviteImageURL && (
      <div className="flex items-center gap-3 mt-2">
        <img
          src={mainInviteImageURL}
          alt="Main Invite"
          className="w-24 h-16 object-cover rounded border"
        />
        <a
          href={mainInviteImageURL}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline"
        >
          View Full Image
        </a>
      </div>
    )}
  </div>*/}

  {/* === Main Invite Rows === 
  <div className="space-y-3">
    {mainInvites.map((invite, index) => {
      const rowTotal =
        (Number(invite.to) || 0) +
        (Number(invite.ta) || 0) +
        (Number(invite.tc) || 0) +
        (Number(invite.media) || 0);

      return (
        <div
          key={index}
          className="grid grid-cols-1 md:grid-cols-[1.5fr_repeat(4,1fr)_auto] gap-3 items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
        >
          <input
            type="date"
            value={invite.date || ""}
            onChange={(e) => handleMainInviteChange(index, "date", e.target.value)}
            className="form-input"
          />
          <input
            type="number"
            placeholder="Tour Operator"
            value={invite.to || ""}
            onChange={(e) => handleMainInviteChange(index, "to", e.target.value)}
            className="form-input"
          />
          <input
            type="number"
            placeholder="Travel Agent"
            value={invite.ta || ""}
            onChange={(e) => handleMainInviteChange(index, "ta", e.target.value)}
            className="form-input"
          />
          <input
            type="number"
            placeholder="Travel Counselor"
            value={invite.tc || ""}
            onChange={(e) => handleMainInviteChange(index, "tc", e.target.value)}
            className="form-input"
          />
          <input
            type="number"
            placeholder="Media / Influence"
            value={invite.media || ""}
            onChange={(e) => handleMainInviteChange(index, "media", e.target.value)}
            className="form-input"
          />
          {/* Total label 
          <div className="text-center font-semibold text-slate-800 bg-gray-100 rounded-md py-2">
            {rowTotal}
          </div>

          {/* Delete button 
          {mainInvites.length > 1 && (
            <button
              onClick={() => removeMainInvite(index)}
              className="text-red-600 hover:text-red-800"
              title="Remove"
            >
              🗑
            </button>
          )}
        </div>
      );
    })}
  </div>*/}

  {/* === Column Totals (computed directly like Trade Database) === 
  <div className="grid grid-cols-[1.5fr_repeat(4,1fr)_auto] gap-3 items-center mt-5 p-3 bg-gray-200 rounded-lg font-semibold text-slate-900">
    <div>Column Totals →</div>
    <div>{mainInvites.reduce((sum, t) => sum + (Number(t.to) || 0), 0)}</div>
    <div>{mainInvites.reduce((sum, t) => sum + (Number(t.ta) || 0), 0)}</div>
    <div>{mainInvites.reduce((sum, t) => sum + (Number(t.tc) || 0), 0)}</div>
    <div>{mainInvites.reduce((sum, t) => sum + (Number(t.media) || 0), 0)}</div>
    <div className="text-right">
      {mainInvites.reduce(
        (sum, t) =>
          sum +
          (Number(t.to) || 0) +
          (Number(t.ta) || 0) +
          (Number(t.tc) || 0) +
          (Number(t.media) || 0),
        0
      )}
    </div>
  </div>

  <button
    onClick={addMainInvite}
    className="px-4 py-2 bg-green-600 text-white rounded mt-2"
  >
    + Add Main Invite
  </button>*/}

  {/* === Floating Grand Total (Save Date + Main Invite) === 
  <div className="fixed right-5 top-1/3 bg-yellow-200 border border-yellow-400 rounded-lg shadow-lg p-3 text-sm">
    <p className="mt-2 border-t border-gray-300 pt-2 text-center">
  🕒 Countdown: <span className="font-bold">{workingDaysLeft}</span> working days
</p>
    
    <h4 className="font-semibold text-gray-800 mb-2">
      Grand Totals
    </h4>
    <p>
      Tour Operator (TO):{" "}
      {(Number(saveDate.to) || 0) +
        mainInvites.reduce((sum, t) => sum + (Number(t.to) || 0), 0)}
    </p>
    <p>
      Travel Agent (TA):{" "}
      {(Number(saveDate.ta) || 0) +
        mainInvites.reduce((sum, t) => sum + (Number(t.ta) || 0), 0)}
    </p>
    <p>
      Travel Counselor (TC):{" "}
      {(Number(saveDate.tc) || 0) +
        mainInvites.reduce((sum, t) => sum + (Number(t.tc) || 0), 0)}
    </p>
    <p>
      Media / Influence:{" "}
      {(Number(saveDate.media) || 0) +
        mainInvites.reduce((sum, t) => sum + (Number(t.media) || 0), 0)}
    </p>
  </div>
</div>*/}

{/* ================= RSVP SECTION ================= 
<div id="rsvp" className="section-container">
  {/* Section Header 
  <div className="section-header">
    <h2 className="section-title">RSVP #1</h2>
  </div>*/}

  {/* === SAVE THE DATE (single record) === 
  <div className="p-4 mb-6 bg-gray-50 border rounded-lg shadow-sm">
    {/* Header line: Title + Save button 
    <div className="flex justify-between items-center mb-3">
      <h3 className="text-lg font-semibold text-gray-800">Save The Date</h3>
      <button onClick={saveRSVP} className="action-button">
        Save RSVP
      </button>
    </div>*/}

    {/* Upload Save The Date image 
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
        Save The Date Image Upload:
      </label>
      <input type="file" onChange={(e) => setSaveTheDateImage(e.target.files[0])} />
      {saveTheDateImageURL && (
        <div className="flex items-center gap-3 mt-2">
          <img
            src={saveTheDateImageURL}
            alt="Save The Date"
            className="w-24 h-16 object-cover rounded border"
          />
          <a
            href={saveTheDateImageURL}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            View Full Image
          </a>
        </div>
      )}
    </div>*/}

    {/* Fields grid 
    <div className="grid grid-cols-1 md:grid-cols-[1.5fr_repeat(4,1fr)_auto] gap-3 items-center mb-3">
      <input
        type="date"
        value={saveDate.date || ""}
        onChange={(e) => handleSaveDateChange("date", e.target.value)}
        className="form-input"
      />
      <input
        type="number"
        placeholder="Tour Operator"
        value={saveDate.to || ""}
        onChange={(e) => handleSaveDateChange("to", e.target.value)}
        className="form-input"
      />
      <input
        type="number"
        placeholder="Travel Agent"
        value={saveDate.ta || ""}
        onChange={(e) => handleSaveDateChange("ta", e.target.value)}
        className="form-input"
      />
      <input
        type="number"
        placeholder="Travel Counselor"
        value={saveDate.tc || ""}
        onChange={(e) => handleSaveDateChange("tc", e.target.value)}
        className="form-input"
      />
      <input
        type="number"
        placeholder="Media / Influence"
        value={saveDate.media || ""}
        onChange={(e) => handleSaveDateChange("media", e.target.value)}
        className="form-input"
      />

      {/* Total 
      <div className="text-center font-semibold text-slate-800 bg-gray-100 rounded-md py-2">
        {(Number(saveDate.to) || 0) +
          (Number(saveDate.ta) || 0) +
          (Number(saveDate.tc) || 0) +
          (Number(saveDate.media) || 0)}
      </div>
    </div>

    {/* Countdown aligned right 
    <div className="flex justify-end items-center gap-4 text-sm mt-2">
      <div className="text-right">
        <div className="text-gray-700 font-medium">Countdown</div>
        <div className="text-red-600 font-bold text-lg border border-red-500 inline-block px-3 py-1 rounded">
          {workingDaysLeft}
        </div>
        <div className="text-xs text-gray-500">working days</div>
      </div>
    </div>
  </div>

  {/* === MAIN INVITATION SECTION === 
  <div className="flex justify-between items-center section-header mt-6">
    <h3 className="section-title">RSVP #2– Main Invite</h3>
    <button onClick={saveMainInvites} className="action-button">
      Save Main Invites
    </button>
  </div>

  {/* Upload Main Invite image 
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">
      Main Invite Image Upload:
    </label>
    <input type="file" onChange={(e) => setMainInviteImage(e.target.files[0])} />
    {mainInviteImageURL && (
      <div className="flex items-center gap-3 mt-2">
        <img
          src={mainInviteImageURL}
          alt="Main Invite"
          className="w-24 h-16 object-cover rounded border"
        />
        <a
          href={mainInviteImageURL}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline"
        >
          View Full Image
        </a>
      </div>
    )}
  </div>

  {/* === Main Invite Rows === 
  <div className="space-y-3">
    {mainInvites.map((invite, index) => {
      const rowTotal =
        (Number(invite.to) || 0) +
        (Number(invite.ta) || 0) +
        (Number(invite.tc) || 0) +
        (Number(invite.media) || 0);

      return (
        <div
          key={index}
          className="grid grid-cols-1 md:grid-cols-[1.5fr_repeat(4,1fr)_auto,_auto] gap-3 items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
        >
          {/* 🟩 Dynamic header for each Main Invite 
        <h3 className="text-md font-semibold text-gray-800">
          RSVP #{index + 2}
        </h3>
          <input
            type="date"
            value={invite.date || ""}
            onChange={(e) => handleMainInviteChange(index, "date", e.target.value)}
            className="form-input"
          />
          <input
            type="number"
            placeholder="Tour Operator"
            value={invite.to || ""}
            onChange={(e) => handleMainInviteChange(index, "to", e.target.value)}
            className="form-input"
          />
          <input
            type="number"
            placeholder="Travel Agent"
            value={invite.ta || ""}
            onChange={(e) => handleMainInviteChange(index, "ta", e.target.value)}
            className="form-input"
          />
          <input
            type="number"
            placeholder="Travel Counselor"
            value={invite.tc || ""}
            onChange={(e) => handleMainInviteChange(index, "tc", e.target.value)}
            className="form-input"
          />
          <input
            type="number"
            placeholder="Media / Influence"
            value={invite.media || ""}
            onChange={(e) => handleMainInviteChange(index, "media", e.target.value)}
            className="form-input"
          />
          {/* Total 
          <div className="text-center font-semibold text-slate-800 bg-gray-100 rounded-md py-2">
            {rowTotal}
          </div>

          {/* Delete Button 
          {mainInvites.length > 1 && (
            <button
              onClick={() => removeMainInvite(index)}
              className="text-red-600 hover:text-red-800"
              title="Remove"
            >
              🗑
            </button>
          )}
        </div>
      );
    })}
  </div>

  {/* === Column Totals === 
  <div className="grid grid-cols-[1.5fr_repeat(4,1fr)_auto] gap-3 items-center mt-5 p-3 bg-gray-200 rounded-lg font-semibold text-slate-900">
    <div>Column Totals →</div>
    <div>{mainInvites.reduce((sum, t) => sum + (Number(t.to) || 0), 0)}</div>
    <div>{mainInvites.reduce((sum, t) => sum + (Number(t.ta) || 0), 0)}</div>
    <div>{mainInvites.reduce((sum, t) => sum + (Number(t.tc) || 0), 0)}</div>
    <div>{mainInvites.reduce((sum, t) => sum + (Number(t.media) || 0), 0)}</div>
    <div className="text-right">
      {mainInvites.reduce(
        (sum, t) =>
          sum +
          (Number(t.to) || 0) +
          (Number(t.ta) || 0) +
          (Number(t.tc) || 0) +
          (Number(t.media) || 0),
        0
      )}
    </div>
  </div>

  {/* === Add Invite Button aligned right === 
  <div className="flex justify-end mt-4">
    <button
      onClick={addMainInvite}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      + Add Main Invite
    </button>
  </div>

  {/* === Floating Grand Total === 
  <div className="fixed right-5 top-1/3 bg-yellow-200 border border-yellow-400 rounded-lg shadow-lg p-3 text-sm">
    <p className="mt-2 border-t border-gray-300 pt-2 text-center">
      🕒 Countdown:{" "}
      <span className="font-bold">{workingDaysLeft}</span> working days
    </p>
    <h4 className="font-semibold text-gray-800 mb-2">Grand Totals</h4>
    <p>
      Tour Operator (TO):{" "}
      {(Number(saveDate.to) || 0) +
        mainInvites.reduce((sum, t) => sum + (Number(t.to) || 0), 0)}
    </p>
    <p>
      Travel Agent (TA):{" "}
      {(Number(saveDate.ta) || 0) +
        mainInvites.reduce((sum, t) => sum + (Number(t.ta) || 0), 0)}
    </p>
    <p>
      Travel Counselor (TC):{" "}
      {(Number(saveDate.tc) || 0) +
        mainInvites.reduce((sum, t) => sum + (Number(t.tc) || 0), 0)}
    </p>
    <p>
      Media / Influence:{" "}
      {(Number(saveDate.media) || 0) +
        mainInvites.reduce((sum, t) => sum + (Number(t.media) || 0), 0)}
    </p>
  </div>
</div>*/}
<div id="rsvp" className="section-container">
  {/* === RSVP #1 – Save The Date === */}
  <div className="section-header">
    <h2 className="section-title">RSVP #1 – Save The Date</h2>
  </div>

  <div className="p-4 mb-6 bg-gray-50 border rounded-lg shadow-sm">
    <div className="flex justify-between items-center mb-3">
      <h3 className="text-lg font-semibold text-gray-800">Save The Date</h3>
      <button onClick={saveRSVP} className="action-button">
        Save RSVP
      </button>
    </div>

    {/* Image Upload */}
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
        Save The Date Image Upload:
      </label>
      <input type="file" onChange={(e) => setSaveTheDateImage(e.target.files[0])} />
      {saveTheDateImageURL && (
        <div className="flex items-center gap-3 mt-2">
          <img
            src={saveTheDateImageURL}
            alt="Save The Date"
            className="w-24 h-16 object-cover rounded border"
          />
          <a
            href={saveTheDateImageURL}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            View Full Image
          </a>
        </div>
      )}
    </div>

    {/* Fields */}
    <div className="grid grid-cols-1 md:grid-cols-[1.5fr_repeat(4,1fr)_auto] gap-3 items-center mb-3">
      <input
        type="date"
        value={saveDate.date || ""}
        onChange={(e) => handleSaveDateChange("date", e.target.value)}
        className="form-input"
      />
      <input
        type="number"
        placeholder="Tour Operator"
        value={saveDate.to || ""}
        onChange={(e) => handleSaveDateChange("to", e.target.value)}
        className="form-input"
      />
      <input
        type="number"
        placeholder="Travel Agent"
        value={saveDate.ta || ""}
        onChange={(e) => handleSaveDateChange("ta", e.target.value)}
        className="form-input"
      />
      <input
        type="number"
        placeholder="Travel Counselor"
        value={saveDate.tc || ""}
        onChange={(e) => handleSaveDateChange("tc", e.target.value)}
        className="form-input"
      />
      <input
        type="number"
        placeholder="Media / Influence"
        value={saveDate.media || ""}
        onChange={(e) => handleSaveDateChange("media", e.target.value)}
        className="form-input"
      />

      <div className="text-center font-semibold text-slate-800 bg-gray-100 rounded-md py-2">
        {(Number(saveDate.to) || 0) +
          (Number(saveDate.ta) || 0) +
          (Number(saveDate.tc) || 0) +
          (Number(saveDate.media) || 0)}
      </div>
    </div>

    {/* Countdown */}
    <div className="flex justify-end items-center gap-4 text-sm mt-2">
      <div className="text-right">
        <div className="text-gray-700 font-medium">Countdown</div>
        <div className="text-red-600 font-bold text-lg border border-red-500 inline-block px-3 py-1 rounded">
          {workingDaysLeft}
        </div>
        <div className="text-xs text-gray-500">working days</div>
      </div>
    </div>
  </div>

  {/* === RSVP #2 – Main Invite (Image Upload + First Record) === */}
  <div className="flex justify-between items-center section-header mt-6">
    <h3 className="section-title">RSVP #2 – Main Invite</h3>
    <button onClick={saveMainInvites} className="action-button">
      Save Main Invites
    </button>
  </div>

  {/* Upload Main Invite image */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">
      Main Invite Image Upload:
    </label>
    <input type="file" onChange={(e) => setMainInviteImage(e.target.files[0])} />
    {mainInviteImageURL && (
      <div className="flex items-center gap-3 mt-2">
        <img
          src={mainInviteImageURL}
          alt="Main Invite"
          className="w-24 h-16 object-cover rounded border"
        />
        <a
          href={mainInviteImageURL}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline"
        >
          View Full Image
        </a>
      </div>
    )}
  </div>

  {/* === Dynamic Main Invite Rows (RSVP #2, #3, #4...) === */}
  <div className="space-y-6">
    {mainInvites.map((invite, index) => {
      const rowTotal =
        (Number(invite.to) || 0) +
        (Number(invite.ta) || 0) +
        (Number(invite.tc) || 0) +
        (Number(invite.media) || 0);

      return (
        <div
          key={index}
          className="p-4 bg-gray-50 border rounded-lg shadow-sm space-y-3"
        >
          {/* 🟩 Header per row */}
          <div className="flex justify-between items-center">
            <h3 className="text-md font-semibold text-gray-800">
              RSVP #{index + 2} – Main Invite
            </h3>
            {mainInvites.length > 1 && (
              <button
                onClick={() => removeMainInvite(index)}
                className="ml-auto p-1.5 text-red-600 hover:text-red-800 transition"
                title="Remove"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              </button>
            )}
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_repeat(4,1fr)_auto] gap-3 items-center">
            <input
              type="date"
              value={invite.date || ""}
              onChange={(e) => handleMainInviteChange(index, "date", e.target.value)}
              className="form-input"
            />
            <input
              type="number"
              placeholder="Tour Operator"
              value={invite.to || ""}
              onChange={(e) => handleMainInviteChange(index, "to", e.target.value)}
              className="form-input"
            />
            <input
              type="number"
              placeholder="Travel Agent"
              value={invite.ta || ""}
              onChange={(e) => handleMainInviteChange(index, "ta", e.target.value)}
              className="form-input"
            />
            <input
              type="number"
              placeholder="Travel Counselor"
              value={invite.tc || ""}
              onChange={(e) => handleMainInviteChange(index, "tc", e.target.value)}
              className="form-input"
            />
            <input
              type="number"
              placeholder="Media / Influence"
              value={invite.media || ""}
              onChange={(e) => handleMainInviteChange(index, "media", e.target.value)}
              className="form-input"
            />
            <div className="text-center font-semibold text-slate-800 bg-gray-100 rounded-md py-2">
              {rowTotal}
            </div>
          </div>
        </div>
      );
    })}
  </div>

  {/* Totals Row */}
  <div className="grid grid-cols-[1.5fr_repeat(4,1fr)_auto] gap-3 items-center mt-5 p-3 bg-gray-200 rounded-lg font-semibold text-slate-900">
    <div>Column Totals →</div>
    <div>{mainInvites.reduce((sum, t) => sum + (Number(t.to) || 0), 0)}</div>
    <div>{mainInvites.reduce((sum, t) => sum + (Number(t.ta) || 0), 0)}</div>
    <div>{mainInvites.reduce((sum, t) => sum + (Number(t.tc) || 0), 0)}</div>
    <div>{mainInvites.reduce((sum, t) => sum + (Number(t.media) || 0), 0)}</div>
    <div className="text-right">
      {mainInvites.reduce(
        (sum, t) =>
          sum +
          (Number(t.to) || 0) +
          (Number(t.ta) || 0) +
          (Number(t.tc) || 0) +
          (Number(t.media) || 0),
        0
      )}
    </div>
  </div>

  {/* Add button */}
  <div className="flex justify-end mt-4">
    <button
      onClick={addMainInvite}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      + Add Main Invite
    </button>
  </div>

  {/* Floating Totals */}
  <div className="fixed right-5 top-1/3 bg-yellow-200 border border-yellow-400 rounded-lg shadow-lg p-3 text-sm">
    <p className="mt-2 border-t border-gray-300 pt-2 text-center">
      🕒 Countdown: <span className="font-bold">{workingDaysLeft}</span> working days
    </p>
    <h4 className="font-semibold text-gray-800 mb-2">Grand Totals</h4>
    <p>
      Tour Operator (TO):{" "}
      {(Number(saveDate.to) || 0) +
        mainInvites.reduce((sum, t) => sum + (Number(t.to) || 0), 0)}
    </p>
    <p>
      Travel Agent (TA):{" "}
      {(Number(saveDate.ta) || 0) +
        mainInvites.reduce((sum, t) => sum + (Number(t.ta) || 0), 0)}
    </p>
    <p>
      Travel Counselor (TC):{" "}
      {(Number(saveDate.tc) || 0) +
        mainInvites.reduce((sum, t) => sum + (Number(t.tc) || 0), 0)}
    </p>
    <p>
      Media / Influence:{" "}
      {(Number(saveDate.media) || 0) +
        mainInvites.reduce((sum, t) => sum + (Number(t.media) || 0), 0)}
    </p>
  </div>
</div>


      {/* 1)AV & Setting up Section @2Hotel supe name  */}
<div id="av" className="section-container">
  {/* Header */}
  <div className="flex justify-between items-center mb-5">
    <h2 className="text-xl font-semibold text-slate-800">Hotel AV Setup</h2>
    <button
      onClick={saveAVSetup}
      disabled={saving === 'av'}
      className={`action-button ${saving === 'av' ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {saving === 'av' ? 'Saving...' : 'Save Hotel AV Setup'}
    </button>
  </div>

  {/* === LINE 1: Backdrop + Screen === */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    {/* Backdrop Section */}
    <div>
      <label className="block mb-1 font-medium text-slate-700">Backdrop</label>
      <input
        type="text"
        placeholder="Size 150cm * 100cm"
        maxLength={20}
        value={avSetup.backdrop || ''}
        onChange={(e) => setAvSetup({ ...avSetup, backdrop: e.target.value })}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-600">Upload Backdrop Design</label>
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={(e) => setAvSetup({ ...avSetup, backdrop_image: e.target.files[0] })}
          className="mt-1 w-full text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer focus:outline-none"
        />
      
        {avSetup.backdrop_image && (
        <img
          src={
            avSetup.backdrop_image instanceof File
             ? URL.createObjectURL(avSetup.backdrop_image)
             : avSetup.backdrop_image
          }
          alt="Backdrop Preview"
          className="h-24 w-auto rounded shadow"
        />
      )}
      </div>
    </div>

    {/* Screen Section */}
    <div>
      <label className="block mb-1 font-medium text-slate-700">Screen</label>
      <input
        type="text"
        placeholder="Size 150cm * 150cm"
        maxLength={20}
        value={avSetup.screen || ''}
        onChange={(e) => setAvSetup({ ...avSetup, screen: e.target.value })}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-600">Upload Screen Image</label>
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={(e) => setAvSetup({ ...avSetup, screen_image: e.target.files[0] })}
          className="mt-1 w-full text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer focus:outline-none"
        />
        {avSetup.screen_image && (
          <img
             src={
            avSetup.screen_image instanceof File
             ? URL.createObjectURL(avSetup.screen_image)
             : avSetup.screen_image
          }
            alt="Screen Preview"
            className="mt-2 rounded-md border border-gray-200 h-24 object-contain"
          />
        )}    

      </div>
    </div>
  </div>

  {/* === LINE 2: Mic, Type, Projector, Podium, Stage === */}
  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
    {/* Mic */}
    <div>
      <label className="block mb-1 font-medium text-slate-700">Mic (Nos)</label>
      <input
        type="number"
        placeholder="10"
        min="0"
        max="999"
        value={avSetup.mic || ''}
        onChange={(e) => setAvSetup({ ...avSetup, mic: e.target.value })}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    {/* Type */}
    <div>
      <label className="block mb-1 font-medium text-slate-700">Type</label>
      <input
        type="text"
        placeholder="Type"
        maxLength={20}
        value={avSetup.type || ''}
        onChange={(e) => setAvSetup({ ...avSetup, type: e.target.value })}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    {/* Projector */}
    <div className="flex items-center gap-1 mt-6 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={avSetup.projector || false}
        onChange={(e) => setAvSetup({ ...avSetup, projector: e.target.checked })}
        className="accent-blue-600 h-3 w-3"
      />
      <label className="whitespace-nowrap">Projector</label>
    </div>

    {/* Podium */}
    <div className="flex items-center gap-1 mt-6 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={avSetup.podium || false}
        onChange={(e) => setAvSetup({ ...avSetup, podium: e.target.checked })}
        className="accent-blue-600 h-3 w-3"
      />
      <label className="whitespace-nowrap">Podium</label>
    </div>

    {/* Stage Image */}
    <div>
      <label className="block mb-1 font-medium text-slate-700">Stage</label>
      <input
        type="file"
        accept=".jpg,.jpeg,.png"
        onChange={(e) => setAvSetup({ ...avSetup, stage_image: e.target.files[0] })}
        className="w-full text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer focus:outline-none"
      />
    
       {avSetup.stage_image && (
        <img
          src={
            avSetup.stage_image instanceof File
             ? URL.createObjectURL(avSetup.stage_image)
             : avSetup.stage_image
          }
          alt="Backdrop Preview"
          className="h-24 w-auto rounded shadow"
        />
      )}
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
            className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto_auto] gap-2 items-center mb-3 p-3 bg-gray-50 rounded-lg"
          >
             {/* Sponsor supplier */}
            <input
              type="text"
              placeholder="Supplier"
              value={hotel.sponsor}
              onChange={(e) => handleHotelChange(index, "sponsor", e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md"
            />
            {/* Hotel Name */}
            <input
              type="text"
              placeholder="Contact Name"
              value={hotel.name}
              onChange={(e) => handleHotelChange(index, "name", e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md"
            />
            {/* ITEm */}
            <input
              type="text"
              placeholder="Item"
              value={hotel.item}
              onChange={(e) => handleHotelChange(index, "item", e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md"
            />
            <select
  value={hotel.currency || "INR"}
 
  className="px-2 py-2 border border-gray-300 rounded-md"
>
  <option value="INR">INR</option>
  <option value="EUR">Euro</option>
  <option value="GBP">Pound</option>
</select>

            {/* Amount */}
            <input
              type="number"
              placeholder="Amount"
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
    <h2 className="text-xl font-semibold text-slate-800">Embassy / Counsulate</h2>
    <button
      onClick={saveEmbassy}
      disabled={saving === 'embassy'}
      className={`action-button ${saving === "embassy" ? "opacity-50 cursor-not-allowed" : ""}`}     
    >
      {saving === 'embassy' ? 'Saving...' : 'Save Embassy'}
    </button>
  </div>

  {/* Input Fields */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
    {/* Chief Guest */}
    <div>
      <label className="block mb-1 font-medium text-gray-700">Chief Guest</label>
      <input
        type="text" placeholder="Chief Guest"
        value={embassy.cheif_guest || ''}
        onChange={(e) => setEmbassy({ ...embassy, cheif_guest: e.target.value })}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    {/* Chief Guest Designation */}
    <div>
      <label className="block mb-1 font-medium text-gray-700">Designation</label>
      <input
        type="text" placeholder="Designation"
        value={embassy.cheif_guest_designation || ''}
        onChange={(e) => setEmbassy({ ...embassy, cheif_guest_designation: e.target.value })}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    {/* Chief Guest Phone */}
    <div>
      <label className="block mb-1 font-medium text-gray-700">Contact</label>
      <input
        type="text" placeholder="Contact"
        value={embassy.cheif_guest_phone || ''}
        onChange={(e) => setEmbassy({ ...embassy, cheif_guest_phone: e.target.value })}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
    </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
    {/* Accommodation Contact */}
    <div>
      <label className="block mb-1 font-medium text-gray-700">Accommodation Contact</label>
      <input
        type="text"  placeholder="Contact Name"
        value={embassy.accommodation_contact || ''}
        onChange={(e) => setEmbassy({ ...embassy, accommodation_contact: e.target.value })}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    {/* Accommodation Address */}
    <div>
      <label className="block mb-1 font-medium text-gray-700">Designation</label>
      <input
        type="text"  placeholder="Designation"
        value={embassy.accommodation_address || ''}
        onChange={(e) => setEmbassy({ ...embassy, accommodation_address: e.target.value })}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    {/* Accommodation Phone */}
    <div>
      <label className="block mb-1 font-medium text-gray-700">Contact</label>
      <input
        type="text" placeholder="Contact"
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
            className="grid grid-cols-[2fr_1fr_auto_auto_auto] gap-3 items-center mb-3 p-3 bg-gray-50 rounded-lg"
          >
             {/* client name */}
            <input
              type="text"
              placeholder="Name"
              value={client.name}
              onChange={(e) => handleClientChange(index, "name", e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md"
            />
          
            {/* client Designation  */}
            <input
              type="text"
              placeholder="Designation"
              value={client.designation}
              onChange={(e) => handleClientChange(index, "designation", e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md"
            />

             {/* client address  */}
            <input
              type="text"
              placeholder="Contact"
              value={client.contact}
              onChange={(e) => handleClientChange(index, "contact", e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md"
            />

                {/* client Hotel */}
            <input
              type="text"
              placeholder="Hotel"
              value={client.hotel}
              onChange={(e) => handleClientChange(index, "hotel", e.target.value)}
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
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
        {checklists.map((checklist, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-gray-50 p-2 rounded-lg shadow-sm"
          >
             <div className="flex items-center gap-2">
                {/* checklist Name */}
                <input
                  type="text"
                  placeholder="name"
                  value={checklist.name}
                  onChange={(e) => handleChecklistChange(index, "name", e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-md "
                />

                {/* Select Checkbox */}
                
                  <input
                    type="checkbox"
                    checked={checklist.selected}
                    onChange={(e) => handleChecklistChange(index, "selected", e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
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
 </div>
        {/* Add Checklist Button */}
        <button
          type="button"
          onClick={handleAddChecklist}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 mt-3"
        >
          + Add Checklist
        </button>
       
      </div>

   

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
