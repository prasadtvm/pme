// src/components/ProjectDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, projectSectionsAPI } from '../services/api.jsx';
import '../styles/tailwind.css';
import logo from "../assets/images/company_logo.png";
import patternBg from "../assets/images/pattern.png";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Detect creation mode
  const creating = !id || id === "new";

  // Mobile menu toggle state
  const [showMobileMenu, setShowMobileMenu] = useState(false);
const [mobileMenu, setMobileMenu] = useState(false);

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [message, setMessage] = useState('');
  const [remarks, setRemarks] = useState([]);
  const UPLOAD_BACK_URL = `${import.meta.env.VITE_UPLOAD_BACK_URL?.replace(/\/$/, '')}` || 'http://localhost:5000';

  const [saveDate, setSaveDate] = useState({ 
    save_the_date: "",
    save_the_date_ta_nos: 0,
    save_the_date_to_nos: 0,
    save_the_date_travel_counsellors_nos: 0,
    save_the_date_influencers_nos: 0  
  });

  const [mainInvites, setMainInvites] = useState([{ main_invite_date: "", main_invite_to_nos: 0, main_invite_ta_nos: 0, main_invite_travel_counsellors_nos: 0, main_invite_influencers_nos: 0 }]);
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
    const updated = { ...saveDate};
    if (field === "save_the_date") {
      updated[field] = value; // keep raw string for <input type="date">
    } else {
      updated[field]= Number(value) || 0 
    }
    setSaveDate(updated);
  };

  const handleMainInviteChange = (index, field, value) => {
    const updatedInvites = mainInvites.map((invite, i) => {
      if (i !== index) return invite;
      const updated = { ...invite };
      if (field === "main_invite_date") {
        updated[field] = value;
      } else {
        // numeric fields
        updated[field] = Number(value) || 0;
      }
      updated.total =
        (updated.main_invite_to_nos || 0) +
        (updated.main_invite_ta_nos || 0) +      
        (updated.main_invite_travel_counsellors_nos || 0) +
        (updated.main_invite_influencers_nos || 0);

      return updated;
    });
    setMainInvites(updatedInvites);
  }

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
    setMainInvites([...mainInvites, { main_invitation_date: "", main_invitation_to_nos: 0, main_invitation_ta_nos: 0, main_invitation_travel_counsellors_nos: 0, main_invitation_influencers_nos: 0}]);

  const removeMainInvite = (index) =>
    setMainInvites(mainInvites.filter((_, i) => i !== index));

  // Core project details
  const [details, setDetails] = useState({
    roadshowName: '',    event_date: '',    associate: '',
    budget: '',
    image_file: '',    project_handiled_by:''
  });

  const [venues, setVenues] = useState([{ name: '', currency: 'INR', rate: '', rateInput:'', budget: '', bugetInput:'', selected: false , venue_rental:false, av:false, food:false, bar:false }]);
  const [associates, setAssociates] = useState([{ name: '',city:'',  selected: false }]);

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
    save_the_date_to_nos: 0,
    save_the_date_ta_nos: 0,   
    save_the_date_travel_counsellors_nos: 0,
    save_the_date_influencers_nos: 0,
  }]);
  const [invitationFile, setInvitationFile] = useState(null);
  const [hotels, setHotels] = useState([{sponsor:'', name: '',  selected: false,item:'',currency:'INR', amount: '' }]);
  const [progress, setProgress] = useState(0);
  const [avSetup, setAvSetup] = useState({ backdrop: '', screen: '', mic: '', type:'', projector: false, podium: false, backdrop_image:null,screen_image:null,stage_image:null });

  const [embassy, setEmbassy] = useState({ cheif_guest: '', cheif_guest_designation: '', cheif_guest_phone: '', accommodation_contact: '', accommodation_address: '', accommodation_phone:''  });

  const [clients, setClients] = useState({name: '',designation:'', contact:'',hotel:''});
  const [starks, setStarks] = useState({name: '',hotel:''});
  const [menuFile, setMenuFile] = useState({ fileName: '', fileType: '', fileSize: '', filePath:''  });
  const [workingDaysLeft, setWorkingDaysLeft] = useState(0);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
       const formData = new FormData();
       formData.append('name', details.roadshowName || "Untitled Project");
       formData.append('event_date', details.event_date || new Date().toISOString().slice(0, 10));
       if (details.image_file instanceof File) {
         formData.append('image_file', details.image_file);
       } else {
         console.warn("⚠️ No valid File found in details.image_file");
       }            
       const projectResponse = await projectAPI.create(formData, {
         headers: { "Content-Type": "multipart/form-data" },
       });
       navigate(`/project/${projectResponse.data.id}`);
       showMessage("Project created! You can now edit all details.");
    } catch (err) {
      alert("Project creation failed: " + (err.response?.data?.error || err.message));
    }
  };
  // Utility to count working days (Mon–Fri)
  const calculateWorkingDays = (eventDateStr) => {
    if (!eventDateStr) return 0;
    const today = new Date();
    const eventDate = new Date(eventDateStr);
    if (eventDate < today) return 0;
    let count = 0;
    let current = new Date(today);
    while (current < eventDate) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  useEffect(() => {
    updateColumnTotals(mainInvites);
  }, [mainInvites]);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const [projectRes, detailsRes,remarks] = await Promise.all([
          projectAPI.getById(id),
          projectAPI.getDetails(id),
          projectAPI.getRemarks(id)
        ]);

        setProject(projectRes.data);
        const progress = await projectAPI.getProgress(id);       
        setProgress(progress.data.progress || 0);
        if (detailsRes.data) {
          const d = detailsRes.data;
          let formattedDate = "";
          if (d.event_date) {
            formattedDate = new Date(d.event_date).toISOString().split("T")[0];
          }
          setDetails({
            roadshowName: d.roadshow_name || '',
            event_date: formattedDate,          
            budget: d.budget || '',
            image_file: projectRes.data.image_file || "",
            project_handiled_by: d.project_handiled_by || '',
          });

          setAssociates(d.associates || []);
          setVenues((d.venues || []).map(v => ({
            name: v.name || '',
            currency: v.currency || 'INR',
            rate: v.rate || '',
            rateInput: formatNumberOutput(v.rate, v.currency || 'INR'),
            budget: v.budget || '',
            budgetInput: formatNumberOutput(v.budget, v.currency || 'INR'),
            selected: v.selected || false,
            venue_rental: v.venue_rental || false,
            av: v.av || false,
            food: v.food || false,
            bar: v.bar || false,
          })));

          setTradeDatabase(d.trade_database && d.trade_database.length > 0 ? d.trade_database : defaultTrades);
          setHotels(d.hotels || []);
          setRsvp(d.rsvp || []);
          setInvitationFile(d.rsvp?.[0]?.invitation_design_file_path || '');
          if (d.rsvp && d.rsvp.length > 0) {
            const first = d.rsvp[0];
            setSaveDate({
              save_the_date: first.save_the_date || "",
              save_the_date_to_nos: first.save_the_date_to_nos || 0,
              save_the_date_ta_nos: first.save_the_date_ta_nos || 0,           
              save_the_date_travel_counsellors_nos: first.save_the_date_travel_counsellors_nos || 0,
              save_the_date_influencers_nos: first.save_the_date_influencers_nos || 0
            });
          } else {
            setSaveDate({
              save_the_date: "",  
              save_the_date_to_nos: 0,        
              save_the_date_ta_nos: 0,           
              save_the_date_travel_counsellors_nos: 0,
              save_the_date_influencers_nos: 0
            });
          }
          setMainInviteImage(d.mainInvites?.[0]?.main_invite_design_file_path || '');
          setMainInvites(d.mainInvites||[]);
          setAvSetup(d.av_setup || {});
          setEmbassy(d.embassy || {});
          setClients(d.clients || {});
          setStarks(d.starks || {});
          setChecklists(d.checklist && d.checklist.length > 0 ? d.checklist : defaultChecklists);
          setMenuFile({
            fileName: d.menuFile[0]?.filename || '',
            filePath: d.menuFile[0]?.file_path || '',
            fileSize: d.menuFile[0]?.file_size || '',
            fileType: d.menuFile[0]?.mime_type || ''
          });
          setRemarks(remarks.data||[]);
        }
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

  const fetchRemarks = async () => {
    try {
      const res = await projectAPI.getRemarks(id);
      setRemarks(res.data || []);
    } catch (err) {
      console.error("Error loading remarks:", err);
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  // Save handlers (preserved)
  const saveRoadshowInfo = async () => {
    try {
      setSaving('roadshow');   
      const formData = new FormData();
      formData.append('roadshow_name', details.roadshowName);
      formData.append('event_date', details.event_date);
      formData.append('budget', details.budget);
      formData.append('project_handiled_by', details.project_handiled_by);

      if (details.image_file instanceof File) {
        formData.append('image_file', details.image_file);
      }
      await projectSectionsAPI.updateRoadshow(id, formData);
      showMessage('Budget saved successfully!');
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
  const saveRSVP = async () => {
    try {
      setSaving('rsvp');
      const formData = new FormData();
      formData.append('invitation_design_file',saveTheDateImage);
      formData.append('rsvp', JSON.stringify(saveDate));
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
      const formData = new FormData();
      formData.append('main_invite_design_file', mainInviteImage);
      formData.append('Main_invite', JSON.stringify(mainInvites));
      await projectSectionsAPI.updateMainInvite(id, formData);
      showMessage('main invites successfully!');
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
      const cleanedHotels = hotels.map((h) => {
        const rawFloat = parseNumberInput(h.amount, h.currency);
        return {
            ...h,
            amount: rawFloat ?? 0, 
            currency: h.currency || "INR",
        };
      });
      await projectSectionsAPI.updateHotels(id, cleanedHotels);
      showMessage('Av Supplier saved successfully!');
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
  const saveStark = async () => {
    try {
      setSaving('starks');
      await projectSectionsAPI.updateStarks(id, starks);
      showMessage('Starks  saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save starks');
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
    setVenues([...venues, { name: '', currency: 'INR',rate: '', rateInput:'', budget: '', budgetInput:'', selected: false , venue_rental: false, av: false, food: false, bar: false}]);
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
      v = v.replace(/\./g, "_TEMP_").replace(/,/g, ".").replace(/_TEMP_/g, "");
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
    return num.toLocaleString(
      currency === "INR"
        ? "en-IN"
        : currency === "EUR"
        ? "de-DE"
        : "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true
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
    setHotels([...hotels, { sponsor: '',name:'', selected: false,item:'',currency:'INR', amount: '', _editing: false  }]);
  };
  const handleHotelChange = (index, field, value) => {
    setHotels((prevHotels) =>
      prevHotels.map((hotel, i) => {
        if (i !== index) return hotel;
        if (field === "currency") {
          const rawNumber = parseNumberInput(hotel.amount, hotel.currency);
          const formattedAmount = formatNumberOutput(rawNumber, value);
          return { ...hotel, currency: value, amount: formattedAmount };
        }
        return { ...hotel, [field]: value };
      })
    );
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

  // Stark handlers
  const handleAddStark = () => {
    setStarks([...starks, { name: '',hotel:'' }]);
  };
  const handleStarkChange = (index, field, value) => {
    setStarks(starks.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };
  const handleRemoveStark = (index) => {
    setStarks(starks.filter((_, i) => i !== index));
  };

  // RSVP handlers
  const handleAddRSVP = () => {
    setRsvp([
      ...rsvp,
      {
        save_the_date: '',
        save_the_date_confirmation_date: '',
        save_the_date_ta_nos: 0,
        save_the_date_to_nos: 0,
        save_the_date_travel_counsellors_nos: 0,
        save_the_date_influencers_nos: 0
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
      await fetchRemarks();
    } catch (err) {
      console.error("Error toggling remark status:", err);
      alert("Failed to update remark status");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = "/login";
  };

  // Totals for floating box
  const calculateTotalConfirmations = () => {
    const saveDateNos = (saveDate.save_the_date_ta_nos || 0) + (saveDate.save_the_date_to_nos || 0) + (saveDate.save_the_date_travel_counsellors_nos || 0) + (saveDate.save_the_date_influencers_nos || 0);
    const mainInvitesNos = mainInvites.reduce((sum, invite) => {
      return sum + (invite.main_invite_ta_nos || 0) + (invite.main_invite_to_nos || 0) + (invite.main_invite_travel_counsellors_nos || 0) + (invite.main_invite_influencers_nos || 0);
    }, 0);

    return {
      saveDateTotal: saveDateNos,
      mainInvitesTotal: mainInvitesNos,
      grandTotal: saveDateNos + mainInvitesNos,
      ta: (saveDate.save_the_date_ta_nos || 0) + mainInvites.reduce((sum, invite) => sum + (invite.main_invite_ta_nos || 0), 0),
      tc: (saveDate.save_the_date_travel_counsellors_nos || 0) + mainInvites.reduce((sum, invite) => sum + (invite.main_invite_travel_counsellors_nos || 0), 0),
      to: (saveDate.save_the_date_to_nos || 0) + mainInvites.reduce((sum, invite) => sum + (invite.main_invite_to_nos || 0), 0),
      media: (saveDate.save_the_date_influencers_nos || 0) + mainInvites.reduce((sum, invite) => sum + (invite.main_invite_influencers_nos || 0), 0),
    };
  };

  useEffect(() => {
    const handleEnterKey = (e) => {
      if (e.key === "Enter") {
        const allowed = ["text", "number", "date"];
        if (!allowed.includes(e.target.type)) return;
        e.preventDefault();
        const inputs = Array.from(
          document.querySelectorAll(
            "input:not([type=hidden]):not([disabled]), select, textarea"
          )
        ).filter((el) => el.offsetParent !== null);
        const index = inputs.indexOf(e.target);
        const next = inputs[index + 1];
        if (next) {
          next.focus();
          next.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    };

    document.addEventListener("keydown", handleEnterKey);
    return () => document.removeEventListener("keydown", handleEnterKey);
  }, []);

  const handleBack = () => navigate('/projects');
  const totalConfirmations = calculateTotalConfirmations();

  // === UI rendering ===
  if (loading) {
    return (
      <div className="loading-container p-6">
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

  // === Final render: UI redesigned to match image with mobile improvements ===
  return (
    <div className="min-h-screen bg-gray-50 p-6">
    {/* thin gray border wrapper like design */}
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">

      {/* TOP header: logo, top nav centered, projects dropdown (hover) */}
      <header className="px-8 pt-[100px] pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-10">
          <img src={logo} alt="STARK" className="h-22 w-auto object-contain" />

          {/* Centered nav (Dashboard) */}
          <nav className="hidden md:flex items-center gap-8 ml-6 text-[18px] font-semibold text-gray-800" style={{ marginLeft: "120px" }}>
            <button onClick={handleBack} className="text-lg font-medium text-gray-700 hover:opacity-90">Dashboard</button>

            {/* Projects with hover dropdown */}
            <div className="relative group">
              <button className="text-lg font-medium text-gray-700 hover:opacity-90">Projects</button>

              {/* Dropdown appears on hover (group-hover) */}
              <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
                <ul className="p-2">
                  {/* You should generate the list from your projects in-code if available */}
                  <li className="py-1 px-2 text-gray-700 hover:bg-gray-50 cursor-pointer">Hamburg Roadshow 2025</li>
                  <li className="py-1 px-2 text-gray-700 hover:bg-gray-50 cursor-pointer">London Roadshow 2025</li>
                  <li className="py-1 px-2 text-gray-700 hover:bg-gray-50 cursor-pointer">Munich Roadshow 2024</li>
                </ul>
              </div>
            </div>
          </nav>
          </div>
        </div>

        {/* small helper right side so nav stays centered visually */}
        <div className="hidden md:block w-28" />
      </header>

      {/* MAIN AREA (left sidebar + main column + floating right) */}
      <div className="flex">

        {/* LEFT SIDEBAR */}
        <aside
          className="w-152 bg-[#70AD47] text-white sticky top-0 self-start p-6 flex flex-col"
          style={{ fontSize: "15.5px", minHeight: "100vh", fontWeight: 600 }}
        >
          

          {/* menu items (larger font like design) */}
          <nav className="flex flex-col gap-4 tracking-wide text-sm font-bold text-[20px]">
            <a href="#associate" className="pl-5 pt-1 text-left">ASSOCIATE</a>
            <a href="#venue" className="pl-5 pt-1 text-left">VENUE</a>
            <a href="#database" className="pl-5 pt-1 text-left">DATABASE</a>
            <a href="#rsvp" className="pl-5 pt-1 text-left">RSVP</a>
            <a href="#av" className="pl-5 pt-1 text-left">HOTEL AV</a>
            <a href="#av_supplier" className="pl-5 pt-1 text-left">AV SUPPLIER</a>
            <a href="#embassy" className="pl-5 pt-1 text-left">EMBASSY / CONSULATE</a>
            <a href="#client" className="pl-5 pt-1 text-left">CLIENT</a>
            <a href="#stark" className="pl-5 pt-1 text-left">STARK</a>
            <a href="#checklist" className="pl-5 pt-1 text-left">CHECKLIST</a>
            <a href="#menu" className="pl-5 pt-1 text-left">MENU (IMAGE UPLOAD)</a>
            <a href="#remarks" className="pl-5 pt-1 text-left">REMARKS</a>
            <a href="#print" className="pl-5 pt-1 text-left">PRINT</a>




            <div className="mt-8">
              <div className="text-xs opacity-90 mb-2">Completion Progress</div>
              <div className="w-full bg-white/20 rounded h-3 overflow-hidden">
                <div style={{ width: `${progress}%` }} className="h-full transition-all duration-500 bg-green-600" />
              </div>
              <div className="text-xs mt-2"> {progress}% Completed</div>
            </div>

            <button onClick={handleLogout} className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded">Logout</button>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-0">
          



{/* HEADER (Yellow patterned background across both columns) */}
<div
  className="w-full"
  style={{
     backgroundImage: `url(${patternBg})`,
    backgroundRepeat: "repeat",
    backgroundSize: "auto",  
    minHeight: "241px",        
  }}
>
  <div className="flex">
    {/* TITLE SECTION */}
    <div className="flex-1 p-10">
      <h1 className="text-[40px] font-bold uppercase tracking-tight mb-6 text-left" style={{ letterSpacing: '0.5px' }}>
        {project?.name || details?.roadshowName || "Untitled Project"}
      </h1>

      <div className="flex items-center gap-16 text-[16px] text-lg font-semibold">
        <span className="uppercase">{details?.project_handiled_by || "N/A"}</span>
        <span className='ml-[100px]'>
          {details?.event_date
            ? new Date(details.event_date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }).toUpperCase()
            : ""}
        </span>
      </div>
    </div>

    {/* IMAGE SECTION */}
    <div className="w-[380px]">
      <div className="h-[238px] pb-1 pt-1 border-l border-gray-300 overflow-hidden">
        {details?.image_file ? (
          <img
            src={details.image_file}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-600">
            No Image
          </div>
        )}
      </div>
    </div>
  </div>
</div>

{/* BUDGET BOX — OUTSIDE YELLOW AREA */}
<div className="bg-white border-t border-gray-200 p-4 flex justify-end items-center gap-4">

  <span className="text-lg font-semibold">BUDGET</span>

  <input
    type="text"
    className="border border-gray-300 rounded px-3 py-1 text-right w-[150px]"
    value={
      details.budget
        ? Number(details.budget).toLocaleString("en-IN")
        : ""
    }
    onChange={(e) => {
      const raw = e.target.value.replace(/,/g, "");
      !isNaN(raw) &&
        setDetails({ ...details, budget: raw });
    }}
  />

  <button
    onClick={saveRoadshowInfo}
    className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
  >
    {saving === "roadshow" ? "Saving…" : "Save"}
  </button>

</div>


 
          <div className="h-6" />
{/* ===================== */}
{/* ASSOCIATES SECTION    */}
{/* ===================== */}
<div id="associate" className="section-container mt-8">

   <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold">ASSOCIATES</h2>

    <button
      onClick={saveAssociates}
      disabled={saving === "associates"}
      className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${
        saving === "associates" ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {saving === "associates" ? "Saving..." : "Save Associates"}
    </button>
   </div>
 

  {/* HEADER */}
  <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-3 mb-3 p-3 bg-gray-100 rounded font-semibold">
    <div>Associate Name</div>
    <div>City</div>
    <div className="text-center">Selected</div>
    <div></div>
  </div>

  {/* ROWS */}
  {associates.map((associate, index) => (
    <div
      key={index}
      className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-3 mb-3 p-3 bg-gray-50 rounded"
    >
      <input
        type="text"
        placeholder="Name"
        value={associate.name}
        onChange={(e) =>
          handleAssociateChange(index, "name", e.target.value)
        }
        className="px-3 py-2 border border-gray-300 rounded-md"
      />

      <input
        type="text"
        placeholder="City"
        value={associate.city}
        onChange={(e) =>
          handleAssociateChange(index, "city", e.target.value)
        }
        className="px-3 py-2 border border-gray-300 rounded-md"
      />

      <div className="flex justify-center items-center h-full">
        <input
          type="checkbox"
          checked={associate.selected}
          onChange={(e) =>
            handleAssociateChange(index, "selected", e.target.checked)
          }
          className="w-3.5 h-3.5 accent-green-600"
        />
      </div>

      {/* DELETE ICON */}
      {associates.length > 1 && (
        <div className="flex justify-center items-center">
        <button
          className="text-red-600"
          onClick={() => handleRemoveAssociate(index)}
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9 3V4H4V6H5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6Z" />
            <path d="M9 8H11V17H9V8ZM13 8H15V17H13V8Z" />
          </svg>
        </button>
        </div>
      )}
    </div>
  ))}

  <button
    onClick={handleAddAssociate}
    className="mt-3 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition duration-200 
             focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
  >
    Add New Associate
  </button>
</div>

{/* ===================== */}
{/* VENUE SECTION         */}
{/* ===================== */}
<div id="venue" className="section-container mt-8">

  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold">VENUE</h2>

    <button
      onClick={saveVenues}
      disabled={saving === "venues"}
      className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${
        saving === "venues" ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {saving === "venues" ? "Saving..." : "Save Venues"}
    </button>
  </div>

  {/* HEADER */}
  <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_2fr_1fr_1fr_1fr_1fr_auto] gap-3 mb-3 p-3 bg-gray-100 rounded font-semibold">
    <div>Venue Name</div>
    <div>Currency</div>
    <div className="text-right">Rate</div>
    <div className="text-right">Budget</div>
    <div className="text-center">Venue Rental</div>
    <div className="text-center">AV</div>
    <div className="text-center">Food</div>
    <div className="text-center">Bar</div>
    <div className="text-center">Selected</div>
    <div></div>
  </div>

  {/* ROWS */}
  {venues.map((venue, index) => (
    <div
      key={index}
      className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_2fr_1fr_1fr_1fr_1fr_auto] gap-3 mb-3 p-3 bg-gray-50 rounded"
    >
      {/* NAME */}
      <input
        type="text"
        placeholder="Venue Name"
        value={venue.name}
        onChange={(e) =>
          handleVenueChange(index, "name", e.target.value)
        }
        className="px-3 py-2 border border-gray-300 rounded-md"
      />

      {/* CURRENCY */}
      <select
        value={venue.currency}
        onChange={(e) =>
          handleVenueChange(index, "currency", e.target.value)
        }
        className="px-3 py-2 border border-gray-300 rounded-md bg-white"
      >
        <option value="INR">INR (₹)</option>
        <option value="USD">USD ($)</option>
        <option value="EUR">EUR (€)</option>
        <option value="GBP">GBP (£)</option>
      </select>

      {/* RATE */}
      <input
        type="text"
        placeholder="Rate"
        value={venue.rateInput}
        onBlur={(e) => {
          const raw = parseNumberInput(e.target.value, venue.currency);
          const formatted = formatNumberOutput(raw, venue.currency);
          handleVenueChange(index, "rate", raw);
          handleVenueChange(index, "rateInput", formatted);
        }}
        onChange={(e) => handleVenueChange(index, "rateInput", e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md text-right font-mono"
      />

      {/* BUDGET */}
      <input
        type="text"
        placeholder="Budget"
        value={venue.budgetInput}
        onBlur={(e) => {
          const raw = parseNumberInput(e.target.value, venue.currency);
          const formatted = formatNumberOutput(raw, venue.currency);
          handleVenueChange(index, "budget", raw);
          handleVenueChange(index, "budgetInput", formatted);
        }}
        onChange={(e) =>
          handleVenueChange(index, "budgetInput", e.target.value)
        }
        className="px-3 py-2 border border-gray-300 rounded-md text-right font-mono"
      />

      {/* RENTAL */}
      <div className="flex justify-center items-center h-full">
        <input
          type="checkbox"
          checked={venue.venue_rental}
          onChange={(e) =>
            handleVenueChange(index, "venue_rental", e.target.checked)
          }
          className="w-3.5 h-3.5 accent-green-600"
        />
      </div>

      {/* AV */}
      <div className="flex justify-center items-center h-full">
        <input
          type="checkbox"
          checked={venue.av}
          onChange={(e) =>
            handleVenueChange(index, "av", e.target.checked)
          }
          className="w-3.5 h-3.5 accent-green-600"
        />
      </div>

      {/* FOOD */}
      <div className="flex justify-center items-center h-full">
        <input
          type="checkbox"
          checked={venue.food}
          onChange={(e) =>
            handleVenueChange(index, "food", e.target.checked)
          }
          className="w-3.5 h-3.5 accent-green-600"
        />
      </div>

      {/* BAR */}
      <div className="flex justify-center items-center h-full">
        <input
          type="checkbox"
          checked={venue.bar}
          onChange={(e) =>
            handleVenueChange(index, "bar", e.target.checked)
          }
          className="w-3.5 h-3.5 accent-green-600"
        />
      </div>

      {/* SELECTED */}
      <div className="flex justify-center items-center h-full">
        <input
          type="checkbox"
          checked={venue.selected}
          onChange={(e) =>
            handleVenueChange(index, "selected", e.target.checked)
          }
          className="w-3.5 h-3.5"
        />
      </div>

      {/* DELETE */}
      {venues.length > 1 && (
        <button
          className="text-red-600"
          onClick={() => handleRemoveVenue(index)}
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9 3V4H4V6H5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6Z" />
            <path d="M9 8H11V17H9V8ZM13 8H15V17H13V8Z" />
          </svg>
        </button>
      )}
    </div>
  ))}

  <button
    onClick={handleAddVenue}
    className="mt-3 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition duration-200 
             focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
  >
    Add New Venue
  </button>
</div>
{/* ========================= */}
{/* TRADE DATABASE SECTION   */}
{/* ========================= */}
<div id="database" className="section-container mt-8">

  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold">TRADE DATABASE</h2>

    <button
      onClick={saveTradeDatabase}
      disabled={saving === "trade"}
      className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${
        saving === "trade" ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {saving === "trade" ? "Saving..." : "Save Database"}
    </button>
  </div>

  {/* HEADER */}
  <div className="grid grid-cols-1 md:grid-cols-[2fr_repeat(5,1fr)_auto] gap-3 p-3 bg-gray-100 rounded font-semibold">
    <div>Category</div>
    <div className="text-center">Tour Operator</div>
    <div className="text-center">Travel Agent</div>
    <div className="text-center">Counsellors</div>
    <div className="text-center">Media / Influence</div>
    <div className="text-center">Total</div>
  </div>

  {/* ROWS */}
  {tradeDatabase.map((trade, index) => {
    const total =
      (Number(trade.travel_operator) || 0) +
      (Number(trade.travel_agent) || 0) +
      (Number(trade.travel_counsellor) || 0) +
      (Number(trade.media_influencers) || 0);

    return (
      <div
        key={index}
        className="grid grid-cols-1 md:grid-cols-[2fr_repeat(5,1fr)_auto] gap-3 p-3 mt-3 bg-gray-50 rounded"
      >
        <input
          type="text"
          placeholder="Category Name"
          value={trade.trade_name}
          onChange={(e) =>
            handleTradeChange(index, "trade_name", e.target.value)
          }
          className="form-input"
        />

        <input
          type="number"
          value={trade.travel_operator}
          onChange={(e) =>
            handleTradeChange(index, "travel_operator", e.target.value)
          }
          className="form-input text-right"
        />

        <input
          type="number"
          value={trade.travel_agent}
          onChange={(e) =>
            handleTradeChange(index, "travel_agent", e.target.value)
          }
          className="form-input text-right"
        />

        <input
          type="number"
          value={trade.travel_counsellor}
          onChange={(e) =>
            handleTradeChange(index, "travel_counsellor", e.target.value)
          }
          className="form-input text-right"
        />

        <input
          type="number"
          value={trade.media_influencers}
          onChange={(e) =>
            handleTradeChange(index, "media_influencers", e.target.value)
          }
          className="form-input text-right"
        />

        <div className="font-semibold text-center">{total}</div>

        {tradeDatabase.length > 1 && (
          <button
            onClick={() => handleRemoveTrade(index)}
            className="text-red-600"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 3V4H4V6H5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6Z" />
              <path d="M9 8H11V17H9V8ZM13 8H15V17H13V8Z" />
            </svg>
          </button>
        )}
      </div>
    );
  })}

  {/* TOTALS ROW */}
  <div className="grid grid-cols-1 md:grid-cols-[2fr_repeat(5,1fr)_auto] gap-3 p-3 bg-gray-100 rounded mt-4 font-semibold">
    <div>Total →</div>

    <div className="text-center">
      {tradeDatabase.reduce(
        (sum, t) => sum + (Number(t.travel_operator) || 0),
        0
      )}
    </div>

    <div className="text-center">
      {tradeDatabase.reduce(
        (sum, t) => sum + (Number(t.travel_agent) || 0),
        0
      )}
    </div>

    <div className="text-center">
      {tradeDatabase.reduce(
        (sum, t) => sum + (Number(t.travel_counsellor) || 0),
        0
      )}
    </div>

    <div className="text-center">
      {tradeDatabase.reduce(
        (sum, t) => sum + (Number(t.media_influencers) || 0),
        0
      )}
    </div>

    <div className="text-center">
      {tradeDatabase.reduce(
        (sum, t) =>
          sum +
          (Number(t.travel_operator) || 0) +
          (Number(t.travel_agent) || 0) +
          (Number(t.travel_counsellor) || 0) +
          (Number(t.media_influencers) || 0),
        0
      )}
    </div>
  </div>
      {/* Add Button */}
  <button
    type="button"
    onClick={handleAddTrade}
    className="mt-4 px-5 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-800 transition duration-200 
             focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
  >
    + Add Trade
  </button>
</div>

{/* ========================= */}
{/* RSVP #1 – SAVE THE DATE   */}
{/* ========================= */}
<div id="rsvp" className="section-container mt-8">

  <div className="flex justify-between items-start mb-4">
    <h2 className="text-xl font-bold">RSVP #1 – SAVE THE DATE</h2>

    <button
      onClick={saveRSVP}
      disabled={saving === "rsvp"}
      className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${
        saving === "rsvp" ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {saving === "rsvp" ? "Saving..." : "Save The Date"}
    </button>
  </div>

  <div className="bg-white shadow-sm rounded-lg p-4 border border-yellow-300 mb-4">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-bold text-yellow-700">Save The Date</h3>

      <div className="text-right">
        <div className="text-sm font-medium">Countdown</div>

        <div className="inline-block rounded px-3 py-1 border border-yellow-400 bg-yellow-50 font-bold text-lg">
          {workingDaysLeft}
        </div>

        <div className="text-xs text-gray-500">working days left</div>
      </div>
    </div>

    {/* HEADER */}
    <div className="grid grid-cols-1 md:grid-cols-[1.5fr_repeat(5,1fr)] gap-4 items-end mb-4 font-semibold">
      <div>Date</div>
      <div>Tour Operator</div>
      <div>Travel Agent</div>
      <div>Travel Counsellors</div>
      <div>Media / Influence</div>
      <div>Total</div>
    </div>

    {/* ROW */}
    <div className="grid grid-cols-1 md:grid-cols-[1.5fr_repeat(5,1fr)] gap-3 items-center">
      <input
        type="date"
        value={saveDate.save_the_date || ""}
        onChange={(e) => handleSaveDateChange("save_the_date", e.target.value)}
        className="form-input"
      />

      <input
        type="number"
        value={saveDate.save_the_date_to_nos}
        onChange={(e) =>
          handleSaveDateChange("save_the_date_to_nos", e.target.value)
        }
        className="form-input text-right"
      />

      <input
        type="number"
        value={saveDate.save_the_date_ta_nos}
        onChange={(e) =>
          handleSaveDateChange("save_the_date_ta_nos", e.target.value)
        }
        className="form-input text-right"
      />

      <input
        type="number"
        value={saveDate.save_the_date_travel_counsellors_nos}
        onChange={(e) =>
          handleSaveDateChange(
            "save_the_date_travel_counsellors_nos",
            e.target.value
          )
        }
        className="form-input text-right"
      />

      <input
        type="number"
        value={saveDate.save_the_date_influencers_nos}
        onChange={(e) =>
          handleSaveDateChange("save_the_date_influencers_nos", e.target.value)
        }
        className="form-input text-right"
      />

      <div className="text-center font-bold bg-gray-100 py-2 rounded">
        {(Number(saveDate.save_the_date_to_nos) || 0) +
          (Number(saveDate.save_the_date_ta_nos) || 0) +
          (Number(saveDate.save_the_date_travel_counsellors_nos) || 0) +
          (Number(saveDate.save_the_date_influencers_nos) || 0)}
      </div>
    </div>
  </div>
</div>

{/* ========================= */}
{/* RSVP #2 – MAIN INVITE     */}
{/* ========================= */}
<div className="section-container mt-8">

  <div className="flex justify-between items-center mb-3">
    <h3 className="text-md font-bold text-purple-700">RSVP #2 – MAIN INVITE</h3>

    <button
      onClick={saveMainInvites}
      disabled={saving === "main invites"}
      className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${
        saving === "main invites" ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {saving === "main invites" ? "Saving..." : "Save Main Invites"}
    </button>
  </div>

  {/* IMAGE UPLOAD */}
  <div className="mb-3">
    <label className="block text-sm font-medium">Main Invite Image:</label>
    <input
      type="file"
      onChange={(e) => setMainInviteImage(e.target.files[0])}
      className="form-input"
    />

    {mainInviteImage && (
      <div className="flex items-center gap-3 mt-2">
        <img
          src={
            mainInviteImage instanceof File
              ? URL.createObjectURL(mainInviteImage)
              : mainInviteImage
          }
          alt="Main Invite"
          className="w-24 h-16 object-cover rounded border"
        />
      </div>
    )}
  </div>

  {/* HEADER */}
  <div className="grid grid-cols-1 md:grid-cols-[200px_150px_150px_150px_150px_auto_auto] bg-gray-100 p-2 rounded font-semibold">
    <div>Date</div>
    <div>Tour Operator</div>
    <div>Travel Agent</div>
    <div>Travel Counsellors</div>
    <div>Media / Influence</div>
    <div>Total</div>
    <div></div>
  </div>

  {/* ROWS */}
  {mainInvites.map((invite, index) => {
    const total =
      (Number(invite.main_invite_to_nos) || 0) +
      (Number(invite.main_invite_ta_nos) || 0) +
      (Number(invite.main_invite_travel_counsellors_nos) || 0) +
      (Number(invite.main_invite_influencers_nos) || 0);

    return (
      <div key={index} className="bg-gray-50 p-3 rounded-md mt-3">
        <h3 className="font-semibold text-left mb-2">RSVP #{index + 2} – Main Invite</h3>
        <div className="grid grid-cols-1 md:grid-cols-[200px_150px_150px_150px_150px_150px_80px] gap-2 items-center">

          <input
            type="date"
            value={invite.main_invite_date}
            onChange={(e) =>
              handleMainInviteChange(index, "main_invite_date", e.target.value)
            }
            className="form-input"
          />

          <input
            type="number"
            value={invite.main_invite_to_nos}
            onChange={(e) =>
              handleMainInviteChange(index, "main_invite_to_nos", e.target.value)
            }
            className="form-input text-right"
          />

          <input
            type="number"
            value={invite.main_invite_ta_nos}
            onChange={(e) =>
              handleMainInviteChange(index, "main_invite_ta_nos", e.target.value)
            }
            className="form-input text-right"
          />

          <input
            type="number"
            value={invite.main_invite_travel_counsellors_nos}
            onChange={(e) =>
              handleMainInviteChange(
                index,
                "main_invite_travel_counsellors_nos",
                e.target.value
              )
            }
            className="form-input text-right"
          />

          <input
            type="number"
            value={invite.main_invite_influencers_nos}
            onChange={(e) =>
              handleMainInviteChange(
                index,
                "main_invite_influencers_nos",
                e.target.value
              )
            }
            className="form-input text-right"
          />

          <div className="text-center font-bold bg-gray-100 py-2 rounded">
            {total}
          </div>

          {/* DELETE */}
          {mainInvites.length > 1 && (
            <button
              onClick={() => removeMainInvite(index)}
              className="text-red-600"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 3V4H4V6H5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6Z" />
                <path d="M9 8H11V17H9V8ZM13 8H15V17H13V8Z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  })}

  {/* TOTALS ROW */}
  <div className="grid grid-cols-1 md:grid-cols-[200px_150px_150px_150px_150px_150px] gap-2 items-center mt-4 p-3 bg-gray-100 rounded font-semibold">
    <div>Total →</div>

    <div>
      {mainInvites.reduce(
        (sum, t) => sum + (Number(t.main_invite_to_nos) || 0),
        0
      )}
    </div>

    <div>
      {mainInvites.reduce(
        (sum, t) => sum + (Number(t.main_invite_ta_nos) || 0),
        0
      )}
    </div>

    <div>
      {mainInvites.reduce(
        (sum, t) => sum + (Number(t.main_invite_travel_counsellors_nos) || 0),
        0
      )}
    </div>

    <div>
      {mainInvites.reduce(
        (sum, t) => sum + (Number(t.main_invite_influencers_nos) || 0),
        0
      )}
    </div>

    <div className="text-center">
      {mainInvites.reduce(
        (sum, t) =>
          sum +
          (Number(t.main_invite_to_nos) || 0) +
          (Number(t.main_invite_ta_nos) || 0) +
          (Number(t.main_invite_travel_counsellors_nos) || 0) +
          (Number(t.main_invite_influencers_nos) || 0),
        0
      )}
    </div>
  </div>

  <button
    onClick={addMainInvite}
    className="mt-3 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition duration-200 
             focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
  >
    Add New Main Invitation Date
  </button>
</div>

{/* ========================= */}
{/* HOTEL AV SECTION          */}
{/* ========================= */}
<div id="av" className="section-container mt-8">

  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold">HOTEL AV SETUP</h2>

    <button
      onClick={saveAVSetup}
      disabled={saving === "av"}
      className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${
        saving === "av" ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {saving === "av" ? "Saving..." : "Save AV Setup"}
    </button>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

    {/* LEFT: TEXT INPUTS */}
    <div className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Backdrop (Specs)</label>
        <input
          type="text"
          value={avSetup.backdrop || ""}
          onChange={(e) => setAvSetup({ ...avSetup, backdrop: e.target.value })}
          className="form-input"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Screen (Specs)</label>
        <input
          type="text"
          value={avSetup.screen || ""}
          onChange={(e) => setAvSetup({ ...avSetup, screen: e.target.value })}
          className="form-input"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Mic (Nos)</label>
        <input
          type="number"
          value={avSetup.mic || ""}
          onChange={(e) => setAvSetup({ ...avSetup, mic: e.target.value })}
          className="form-input"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Type (System)</label>
        <input
          type="text"
          value={avSetup.type || ""}
          onChange={(e) => setAvSetup({ ...avSetup, type: e.target.value })}
          className="form-input"
        />
      </div>

      {/* CHECKBOXES */}
      <div className="flex gap-6 mt-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={avSetup.projector || false}
            onChange={(e) =>
              setAvSetup({ ...avSetup, projector: e.target.checked })
            }
            className="w-3.5 h-3.5 accent-green-600"
          />
          Projector
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={avSetup.podium || false}
            onChange={(e) =>
              setAvSetup({ ...avSetup, podium: e.target.checked })
            }
            className="w-3.5 h-3.5 accent-green-600"
          />
          Podium
        </label>
      </div>
    </div>

    {/* RIGHT: UPLOADS */}
    <div className="space-y-4">

      {/* BACKDROP IMAGE */}
      <div>
        <label className="block mb-1 font-medium">Backdrop Image</label>
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={(e) =>
            setAvSetup({ ...avSetup, backdrop_image: e.target.files[0] })
          }
          className="form-input"
        />

        {avSetup.backdrop_image && (
          <img
            src={
              avSetup.backdrop_image instanceof File
                ? URL.createObjectURL(avSetup.backdrop_image)
                : avSetup.backdrop_image
            }
            className="h-24 mt-2 rounded shadow"
          />
        )}
      </div>

      {/* SCREEN IMAGE */}
      <div>
        <label className="block mb-1 font-medium">Screen Image</label>
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={(e) =>
            setAvSetup({ ...avSetup, screen_image: e.target.files[0] })
          }
          className="form-input"
        />

        {avSetup.screen_image && (
          <img
            src={
              avSetup.screen_image instanceof File
                ? URL.createObjectURL(avSetup.screen_image)
                : avSetup.screen_image
            }
            className="h-24 mt-2 rounded shadow"
          />
        )}
      </div>

      {/* STAGE IMAGE */}
      <div>
        <label className="block mb-1 font-medium">Stage Image</label>
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={(e) =>
            setAvSetup({ ...avSetup, stage_image: e.target.files[0] })
          }
          className="form-input"
        />

        {avSetup.stage_image && (
          <img
            src={
              avSetup.stage_image instanceof File
                ? URL.createObjectURL(avSetup.stage_image)
                : avSetup.stage_image
            }
            className="h-24 mt-2 rounded shadow"
          />
        )}
      </div>
    </div>
  </div>
</div>

{/* ========================= */}
{/* AV SUPPLIER SECTION       */}
{/* ========================= */}
<div id="av_supplier" className="section-container mt-8">

  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold">AV SUPPLIER</h2>

    <button
      onClick={saveHotels}
      disabled={saving === "hotels"}
      className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${
        saving === "hotels" ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {saving === "hotels" ? "Saving..." : "Save AV Supplier"}
    </button>
  </div>

  {/* HEADER */}
  <div className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-3 p-3 bg-gray-100 rounded font-semibold">
    <div>Supplier</div>
    <div>Item</div>
    <div>Currency</div>
    <div className="text-center">Amount</div>
    <div className="text-center">Selected</div>
    <div></div>
  </div>

  {/* ROWS */}
  {hotels.map((hotel, index) => (
    <div
      key={index}
      className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-3 mt-3 p-3 bg-gray-50 rounded"
    >
      <input
        type="text"
        placeholder="Supplier Name"
        value={hotel.sponsor}
        onChange={(e) =>
          handleHotelChange(index, "sponsor", e.target.value)
        }
        className="form-input"
      />

      <input
        type="text"
        placeholder="Item"
        value={hotel.item}
        onChange={(e) =>
          handleHotelChange(index, "item", e.target.value)
        }
        className="form-input"
      />

      <select
        value={hotel.currency}
        onChange={(e) =>
          handleHotelChange(index, "currency", e.target.value)
        }
        className="form-input bg-white"
      >
        <option value="INR">INR (₹)</option>
        <option value="USD">USD ($)</option>
        <option value="EUR">EUR (€)</option>
        <option value="GBP">GBP (£)</option>
      </select>

      <input
        type="text"
        placeholder="Amount"
        value={hotel.amount}
        onFocus={(e) => {
          const raw = parseNumberInput(e.target.value, hotel.currency);
          handleHotelChange(index, "amount", raw.toString());
        }}
        onBlur={(e) => {
          const raw = parseNumberInput(e.target.value, hotel.currency);
          const formatted = formatNumberOutput(raw, hotel.currency);
          handleHotelChange(index, "amount", formatted);
        }}
        onChange={(e) =>
          handleHotelChange(index, "amount", e.target.value)
        }
        className="form-input text-right font-mono"
      />

      <div className="flex justify-center items-center h-full">
        <input
          type="checkbox"
          checked={hotel.selected}
          onChange={(e) =>
            handleHotelChange(index, "selected", e.target.checked)
          }
          className="w-3.5 h-3.5 accent-green-600"
        />
      </div>

      {/* DELETE */}
      {hotels.length > 1 && (
        <button
          onClick={() => handleRemoveHotel(index)}
          className="text-red-600"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 3V4H4V6H5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6Z" />
            <path d="M9 8H11V17H9V8ZM13 8H15V17H13V8Z" />
          </svg>
        </button>
      )}
    </div>
  ))}

  <button
    onClick={handleAddHotel}
    className="mt-3 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition duration-200 
             focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
  >
    Add New Supplier
  </button>
</div>

{/* ========================= */}
{/* EMBASSY / CONSULATE       */}
{/* ========================= */}
<div id="embassy" className="section-container mt-8">

  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold">EMBASSY / CONSULATE</h2>

    <button
      onClick={saveEmbassy}
      disabled={saving === "embassy"}
      className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${
        saving === "embassy" ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {saving === "embassy" ? "Saving…" : "Save Embassy Info"}
    </button>
  </div>

  {/* CHIEF GUEST */}
  <h3 className="text-lg font-bold mb-3">Chief Guest Details</h3>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded p-4 mb-6">
    <input
      type="text"
      placeholder="Name"
      value={embassy.cheif_guest}
      onChange={(e) =>
        setEmbassy({ ...embassy, cheif_guest: e.target.value })
      }
      className="form-input"
    />

    <input
      type="text"
      placeholder="Designation"
      value={embassy.cheif_guest_designation}
      onChange={(e) =>
        setEmbassy({ ...embassy, cheif_guest_designation: e.target.value })
      }
      className="form-input"
    />

    <input
      type="text"
      placeholder="Phone"
      value={embassy.cheif_guest_phone}
      onChange={(e) =>
        setEmbassy({ ...embassy, cheif_guest_phone: e.target.value })
      }
      className="form-input"
    />
  </div>

  {/* ACCOMMODATION */}
  <h3 className="text-lg font-bold mb-3">Accommodation Details</h3>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded p-4">
    <input
      type="text"
      placeholder="Contact Name"
      value={embassy.accommodation_contact}
      onChange={(e) =>
        setEmbassy({
          ...embassy,
          accommodation_contact: e.target.value,
        })
      }
      className="form-input"
    />

    <input
      type="text"
      placeholder="Address"
      value={embassy.accommodation_address}
      onChange={(e) =>
        setEmbassy({
          ...embassy,
          accommodation_address: e.target.value,
        })
      }
      className="form-input"
    />

    <input
      type="text"
      placeholder="Phone"
      value={embassy.accommodation_phone}
      onChange={(e) =>
        setEmbassy({
          ...embassy,
          accommodation_phone: e.target.value,
        })
      }
      className="form-input"
    />
  </div>
</div>

{/* ========================= */}
{/* CLIENT SECTION            */}
{/* ========================= */}
<div id="client" className="section-container mt-8">

  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold">CLIENT</h2>

    <button
      onClick={saveClient}
      disabled={saving === "clients"}
      className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${
        saving === "clients" ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {saving === "clients" ? "Saving…" : "Save Client"}
    </button>
  </div>

  {/* HEADER */}
  <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 p-3 bg-gray-100 rounded font-semibold">
    <div>Name</div>
    <div>Designation</div>
    <div>Contact</div>
    <div>Hotel</div>
    <div></div>
  </div>

  {/* ROWS */}
  {Array.isArray(clients) &&
    clients.map((client, index) => (
      <div
        key={index}
        className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 mt-3 p-3 bg-gray-50 rounded"
      >
        <input
          type="text"
          placeholder="Name"
          value={client.name}
          onChange={(e) =>
            handleClientChange(index, "name", e.target.value)
          }
          className="form-input"
        />

        <input
          type="text"
          placeholder="Designation"
          value={client.designation}
          onChange={(e) =>
            handleClientChange(index, "designation", e.target.value)
          }
          className="form-input"
        />

        <input
          type="text"
          placeholder="Contact"
          value={client.contact}
          onChange={(e) =>
            handleClientChange(index, "contact", e.target.value)
          }
          className="form-input"
        />

        <input
          type="text"
          placeholder="Hotel"
          value={client.hotel}
          onChange={(e) =>
            handleClientChange(index, "hotel", e.target.value)
          }
          className="form-input"
        />

        {/* DELETE */}
        {clients.length > 1 && (
          <button
            onClick={() => handleRemoveClient(index)}
            className="text-red-600"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 3V4H4V6H5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6Z" />
              <path d="M9 8H11V17H9V8ZM13 8H15V17H13V8Z" />
            </svg>
          </button>
        )}
      </div>
    ))}

  <button
    onClick={handleAddClient}
    className="mt-3 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition duration-200 
             focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2" 
  >
    Add New Client
  </button>
</div>

{/* ========================= */}
{/* STARK SECTION             */}
{/* ========================= */}
<div id="stark" className="section-container mt-8">

  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold">STARK</h2>

    <button
      onClick={saveStark}
      disabled={saving === "starks"}
      className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${
        saving === "starks" ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {saving === "starks" ? "Saving…" : "Save Stark"}
    </button>
  </div>

  {/* HEADER */}
  <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-3 p-3 bg-gray-100 rounded font-semibold">
    <div>Name</div>
    <div>Hotel</div>
    <div></div>
  </div>

  {Array.isArray(starks) &&
    starks.map((stark, index) => (
      <div
        key={index}
        className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-3 mt-3 p-3 bg-gray-50 rounded"
      >
        <input
          type="text"
          placeholder="Name"
          value={stark.name}
          onChange={(e) =>
            handleStarkChange(index, "name", e.target.value)
          }
          className="form-input"
        />

        <input
          type="text"
          placeholder="Hotel"
          value={stark.hotel}
          onChange={(e) =>
            handleStarkChange(index, "hotel", e.target.value)
          }
          className="form-input"
        />

        {starks.length > 1 && (
          <button
            onClick={() => handleRemoveStark(index)}
            className="text-red-600"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 3V4H4V6H5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6Z" />
              <path d="M9 8H11V17H9V8ZM13 8H15V17H13V8Z" />
            </svg>
          </button>
        )}
      </div>
    ))}

  <button
    onClick={handleAddStark}
    className="mt-3 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition duration-200 
             focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
  >
    Add New Stark
  </button>
</div>

{/* ========================= */}
{/* CHECKLIST SECTION         */}
{/* ========================= */}
<div id="checklist" className="section-container mt-8">

  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold">CHECKLIST</h2>

    <button
      onClick={saveChecklists}
      disabled={saving === "checklists"}
      className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${
        saving === "checklists" ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {saving === "checklists" ? "Saving…" : "Save Checklists"}
    </button>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {checklists.map((item, index) => (
      <div
        key={index}
        className="flex items-center justify-between bg-gray-50 p-3 rounded"
      >
        <input
          type="text"
          value={item.name}
          placeholder="Checklist Item"
          onChange={(e) =>
            handleChecklistChange(index, "name", e.target.value)
          }
          className="form-input flex-1 mr-3"
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={item.selected}
            onChange={(e) =>
              handleChecklistChange(index, "selected", e.target.checked)
            }
            className="w-3.5 h-3.5 accent-green-600"
          />
          Done
        </label>

        {index >= defaultChecklists.length && (
          <button
            onClick={() => handleRemovechecklist(index)}
            className="text-red-600 ml-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 3V4H4V6H5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6Z" />
              <path d="M9 8H11V17H9V8ZM13 8H15V17H13V8Z" />
            </svg>
          </button>
        )}
      </div>
    ))}
  </div>

  <button
    onClick={handleAddChecklist}
    className="mt-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition duration-200 
             focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
  >
    Add Custom Checklist
  </button>
</div>

{/* ========================= */}
{/* MENU UPLOAD SECTION       */}
{/* ========================= */}
<div id="menu" className="section-container mt-8">

  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold">MENU (IMAGE UPLOAD)</h2>

    <button
      onClick={saveMenu}
      disabled={saving === "menu" || !menuFile}
      className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${
        saving === "menu" || !menuFile
          ? "opacity-50 cursor-not-allowed"
          : ""
      }`}
    >
      {saving === "menu" ? "Uploading…" : "Upload Menu"}
    </button>
  </div>

  <div className="bg-white rounded p-6">
    <label className="block font-medium mb-1">Upload Menu File</label>
    <input
      type="file"
      accept=".jpg,.jpeg,.png"
      onChange={(e) => setMenuFile(e.target.files[0])}
      className="form-input"
    />

    <small className="text-gray-500">
      Max size 1MB — JPG / JPEG / PNG only
    </small>

    {menuFile && menuFile.name && (
      <p className="mt-3 text-sm text-green-600 font-medium">
        Selected: {menuFile.name}
      </p>
    )}
  </div>
</div>

{/* ========================= */}
{/* REMARKS SECTION           */}
{/* ========================= */}
<div id="remarks" className="section-container mt-8">

  <h2 className="text-xl font-bold mb-4">VIEWER REMARKS</h2>

  {remarks.length > 0 ? (
    remarks.map((r) => (
      <div
        key={r.id}
        className="flex justify-between items-center bg-gray-50 rounded p-3 mb-2 border"
      >
        <div>
          <strong>{r.username || "Viewer"}: </strong>
          {r.remarktext}
        </div>

        <button
          onClick={() => handleToggleRemark(r.id)}
          className={`px-3 py-1.5 rounded text-sm font-medium ${
            r.isapproved
              ? "bg-green-600 text-white"
              : "bg-yellow-400 text-black"
          }`}
        >
          {r.isapproved ? "Resolved" : "Pending"}
        </button>
      </div>
    ))
  ) : (
    <p className="text-gray-500">No remarks yet.</p>
  )}
</div>

{/* ========================= */}
{/* PRINT SECTION             */}
{/* ========================= */}
<div id="print" className="flex justify-center mt-10 mb-10">
  <button
    onClick={() => window.print()}
    className="px-6 py-3 bg-green-600 text-white font-semibold rounded shadow hover:bg-green-700 print:hidden"
  >
    Print Project Details
  </button>
</div>

</main>
{/* END OF MAIN CONTENT */}


{/* =============================== */}
{/* FLOATING TOTALS (fixed right)   */}
{/* =============================== */}
<aside className="w-[280px] hidden md:block">
  <div className="fixed right-6 top-[160px] w-[260px] bg-yellow-50 border border-yellow-300 rounded-lg shadow-xl p-4">

    {/* Countdown */}
    <div className="flex items-center gap-2 mb-2">
      <div className="rounded-full bg-white border p-1 text-gray-700">
       <svg
  xmlns="http://www.w3.org/2000/svg"
  className="h-5 w-5"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
  strokeWidth={2}
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M12 6v6l4 2m5-2a9 9 0 11-18 0 9 9 0 0118 0z"
  />
</svg>
      </div>

      <div className="text-sm font-semibold">
        Countdown:{" "}
        <span className="font-bold text-red-600">
          {workingDaysLeft} working days
        </span>
      </div>
    </div>

    {/* Totals */}
    <div className="mt-2 pt-2 border-t border-yellow-200">
      <div className="text-sm font-semibold mb-2">Confirmations</div>

      <div className="text-sm">
        <div className="flex justify-between">
          <div>Tour Operator:</div>
          <div className="font-medium">{totalConfirmations.to}</div>
        </div>

        <div className="flex justify-between">
          <div>Travel Agent:</div>
          <div className="font-medium">{totalConfirmations.ta}</div>
        </div>

        <div className="flex justify-between">
          <div>Travel Counsellors:</div>
          <div className="font-medium">{totalConfirmations.tc}</div>
        </div>

        <div className="flex justify-between">
          <div>Media / Influence:</div>
          <div className="font-medium">{totalConfirmations.media}</div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-yellow-200 text-center font-bold text-green-700">
        Total: {totalConfirmations.grandTotal}
      </div>
    </div>
  </div>
</aside>

</div> {/* end flex */}


 </div> {/* end border wrapper */}
</div>
  );
};

export default ProjectDetails;


