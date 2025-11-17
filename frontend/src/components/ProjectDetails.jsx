// src/components/ProjectDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, projectSectionsAPI } from '../services/api.jsx';
import '../styles/tailwind.css';
import logo from "../assets/images/company_logo.png";


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
  updated[field] = value; // ✅ keep raw string for <input type="date">
 }else {
   updated[field]= Number(value) || 0 
 }
 // updated.total = updated.ta + updated.tc + updated.to + updated.media;
  setSaveDate(updated);
 // updateTotals(updated, mainInvites);
};

const handleMainInviteChange = (index, field, value) => {

 // const updatedInvites = mainInvites.map((invite, i) =>
   // i === index ? { ...invite, [field]: Number(value) || 0 } : invite
 // );
 // updatedInvites[index].total =
   // updatedInvites[index].ta + updatedInvites[index].tc + updatedInvites[index].to + updatedInvites[index].media;
  //setMainInvites(updatedInvites);
  //updateTotals(saveDate, updatedInvites);
const updatedInvites = mainInvites.map((invite, i) => {
    if (i !== index) return invite;

    const updated = { ...invite };

    if (field === "main_invite_date") {
      // Keep as string for date input
      updated[field] = value;
    } else {
      // Convert numeric fields
      updated[field] = Number(value) || 0;
    }

    // Recalculate row total (for UI only)
    updated.total =
      (updated.main_invite_to_nos || 0) +
      (updated.main_invite_ta_nos || 0) +      
      (updated.main_invite_travel_counsellors_nos || 0) +
      (updated.main_invite_influencers_nos || 0);

    return updated;

});
setMainInvites(updatedInvites);

  // Now use new totals calculation (UI only, not saved to DB)
  //updateMainInviteTotals(updatedInvites);
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

/*const updateTotals = (saveDate, mainInvites) => {
  const totals = { ta: saveDate.ta, tc: saveDate.tc, to: saveDate.to, media: saveDate.media };
  mainInvites.forEach((invite) => {
    totals.ta += invite.ta;
    totals.tc += invite.tc;
    totals.to += invite.to;
    totals.media += invite.media;
  });
  setTotals(totals);
};*/

  // Core project details
  const [details, setDetails] = useState({
    roadshowName: '',    event_date: '',    associate: '',
    budget: '',
    // Optional: add description for create flow
    image_file: '',    project_handiled_by:''
  });

  const [venues, setVenues] = useState([{ name: '', currency: 'INR', rate: '',    
    rateInput:'', budget: '', bugetInput:'',
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
   //    save_the_date_total_nos: 0,
  //  main_invitation_date: '',
   // main_invitation_confirmation_date: '',
   // main_invitation_ta_nos: 0,
  //  main_invitation_to_nos: 0,
   // main_invitation_travel_counsellors_nos: 0,
   // main_invitation_influencers_nos: 0,
   // main_invitation_total_nos: 0,
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
  const [avSetup, setAvSetup] = useState({    backdrop: '',    screen: '',    mic: '',    type:'',    projector: false,    podium: false,   backdrop_image:null,screen_image:null,stage_image:null });

  const [embassy, setEmbassy] = useState({    cheif_guest: '',    cheif_guest_designation: '',    cheif_guest_phone: '',    accommodation_contact: '',
    accommodation_address: '',    accommodation_phone:''  });

  const [clients, setClients] = useState({name: '',designation:'', contact:'',hotel:''});
  const [starks, setStarks] = useState({name: '',hotel:''});
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
         // setVenues(d.venues || []);
         // setTradeDatabase(d.trade_database || []);
         setVenues(
        (d.venues || []).map(v => ({
          name: v.name || '',
          currency: v.currency || 'INR', // ✅ preserve or default only if missing
          rate: v.rate || '',
          rateInput: formatNumberOutput(v.rate, v.currency || 'INR'),
          budget: v.budget || '',
          budgetInput: formatNumberOutput(v.budget, v.currency || 'INR'),
          selected: v.selected || false,
          venue_rental: v.venue_rental || false,
          av: v.av || false,
          food: v.food || false,
          bar: v.bar || false,
        }))
      );
         setTradeDatabase(d.trade_database && d.trade_database.length > 0
        ? d.trade_database
        : defaultTrades
        );
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
          // If no record yet, initialize empty SaveDate object
          setSaveDate({
            save_the_date: "",  
            save_the_date_to_nos: 0,        
            save_the_date_ta_nos: 0,           
            save_the_date_travel_counsellors_nos: 0,
            save_the_date_influencers_nos: 0
          });
        }
          setMainInviteImage(d.mainInvites?.[0]?.main_invite_design_file_path || '');
          setMainInvites(d.mainInvites||[]) ;

          setAvSetup(d.av_setup || {});
          setEmbassy(d.embassy || {});         
          setClients(d.clients || {});   
          setStarks(d.starks || {});  
          
          setChecklists(d.checklist && d.checklist.length > 0
          ? d.checklist 
          : defaultChecklists
        );
       
        
            //setMenuFile(d.menuFile || {});          //setMenuFile(d.menuFile || '');
          setMenuFile({
        fileName: d.menuFile[0]?.filename || '',
        filePath: d.menuFile[0]?.file_path || '',
        fileSize: d.menuFile[0]?.file_size || '',
        fileType: d.menuFile[0]?.mime_type || ''
      });
          setRemarks(remarks.data||[]);
        }
         
       //  console.log(menuFile.fileName)         // console.log('projectDetails fetch',menuFile); 
       
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
     // roadshow_name: details.roadshowName,       // event_date: details.event_date,       // image_file: details.image_file || null, // add this line  

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
    formData.append('invitation_design_file',saveTheDateImage);
    formData.append('rsvp', JSON.stringify(saveDate));
    console.log('INSIDE SAVE RSVP PASSING TO', JSON.stringify(saveDate));
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
    console.log('INSIDE Main invite PASSING TO', JSON.stringify(mainInvites));
    await projectSectionsAPI.updateMainInvite(id, formData);
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
      //console.log('test hotel or supplier',JSON.stringify(hotels));
// ✅ Clean the data before saving
// 2. Use parseNumberInput to get the raw float for the API
    const cleanedHotels = hotels.map((h) => {
      // Convert the current display string (h.amount) to a raw float number
                const rawFloat = parseNumberInput(h.amount, h.currency);
                return {
                    ...h,
                    // Use the float for the backend, defaulting to 0
                    amount: rawFloat ?? 0, 
                    currency: h.currency || "INR",
                };
      //...h,
      //amount: h.amount ? parseFloat(h.amount) : 0,  // ensure number      
      //currency: h.currency || "INR", // fallback default
    });

    console.log("test hotel or supplier", JSON.stringify(cleanedHotels, null, 2));


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
    //v = v.replace(/\./g, "").replace(",", ".");
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

  // Use locale formatting rules
  return num.toLocaleString(
    currency === "INR"
      ? "en-IN"
      : currency === "EUR"
      ? "de-DE" // Euro format: 1.234,56      
      : "en-US", // ✅ USD and GBP both use commas and dots like: 1,234.56
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
       useGrouping: true // Ensure thousands separators are included
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
    //setHotels(hotels.map((v, i) => (i === index ? { ...v, [field]: value } : v)));

   
  setHotels((prevHotels) =>
    prevHotels.map((hotel, i) => {
      if (i !== index) return hotel;

    //  if (field === "currency") {
        // Change currency, keep same amount but reformat it
     //   const formattedAmount = formatNumberOutput(
     //     parseNumberInput(hotel.amount, hotel.currency),
     //     value
      //  );
      //  return { ...hotel, currency: value, amount: formattedAmount };
    //  }

     // if (field === "amount") {
        // Format for display while typing
    //    return { ...hotel, [field]: value };
    //  }

    //  return { ...hotel, [field]: value };
   // })
   if (field === "currency") {
                    // Get the unformatted number from the current localized display string
                    const rawNumber = parseNumberInput(hotel.amount, hotel.currency);
                    
                    // Reformat this unformatted number using the NEW currency rules for display
                    const formattedAmount = formatNumberOutput(rawNumber, value);

                    // Update state with new currency and the newly formatted string amount
                    return { ...hotel, currency: value, amount: formattedAmount };
                }

                // For 'amount' and other fields, just update the state value
                // For 'amount', 'value' is the raw string input from the user (e.g., "45.500,5")
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
   // ,
    
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
    await fetchRemarks(); // refresh after update
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
// ✅ [REQUEST 1] Helper function to calculate totals for floating div
  const calculateTotalConfirmations = () => {
    const saveDateNos = (saveDate.save_the_date_ta_nos || 0) + (saveDate.save_the_date_to_nos || 0) + (saveDate.save_the_date_travel_counsellors_nos || 0) + (saveDate.save_the_date_influencers_nos || 0);
    const mainInvitesNos = mainInvites.reduce((sum, invite) => {
      // NOTE: Using the correct fields from mainInvites state
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
const totalConfirmations = calculateTotalConfirmations();
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
           


      
 
      <div className="flex justify-start mt-2 mb-0 pb-2 pt-5">
      <img src={logo} alt="Company Logo" className="h-12" />
      </div>

       
      {/* 🧭 Sidebar + Main Layout */}
      <div className="flex gap-0">
       
       <div className="       
       w-48  min-h-screen sticky top-0 rounded-lg shadow-sm h-fit " 
       style={{ backgroundColor: "#70AD47", borderColor: "#5A8D39" }}
       >
  <nav className="flex flex-col space-y-2 text-sm font-medium text-white pt-5 pl-1 pr-5 ">
    <a href="#information" className="hidden hover:font-bold hover:text-white">INFORMATION</a>
      <button 
            onClick={handleBack}
            className="back-button text-left"
          >
            Dashboard
          </button>       
          
    <a href="#associate" className="hover:font-bold hover:text-white text-left pt-5 pl-5">ASSOCIATE</a>
    <a href="#venue" className="hover:font-bold hover:text-white text-left pt-2 pl-5">VENUE</a>
    <a href="#database" className="hover:font-bold hover:text-white text-left pt-2 pl-5">DATABASE</a>
    <a href="#rsvp" className="hover:font-bold hover:text-white text-left pt-2 pl-5">RSVP</a>
    <a href="#av" className="hover:font-bold hover:text-white text-left pt-2 pl-5">HOTEL AV</a>
    <a href="#av_supplier" className="hover:font-bold hover:text-white text-left pt-2 pl-5">AV SUPPLIER</a>
    <a href="#embassy" className="hover:font-bold hover:text-white text-left pt-2 pl-5">EMBASSY / CONSULATE</a>
    <a href="#client" className="hover:font-bold hover:text-white text-left pt-2 pl-5">CLIENT</a>
    <a href="#stark" className="hover:font-bold hover:text-white text-left pt-2 pl-5">STARK</a>
    <a href="#checklist" className="hover:font-bold hover:text-white text-left pt-2 pl-5">CHECKLIST</a>
    <a href="#menu" className="hover:font-bold hover:text-white text-left pt-2 pl-5">MENU (IMAGE UPLOAD)</a>
    <a href="#remarks" className="hover:font-bold hover:text-white text-left pt-2 pl-5">REMARKS</a>
    <a href="#print" className="hover:font-bold hover:text-white text-left pt-2 pl-5">PRINT</a>
<span className="text-white opacity-80">-</span>
     {/*Progress Bar*/}
         <div className="text-left pl-5">
        <label className="font-medium text-slate-700 text-white">Completion Progress</label>

        <div className="w-full bg-gray-200 rounded-lg h-5 overflow-hidden mt-1.5">
          <div
            className={`h-full transition-all duration-500 ${
              progress === 100 ? 'bg-blue-600' : 'bg-green-600'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-right text-sm text-gray-700 mt-1 text-white">
          {progress}% Completed
        </div>
      </div>
    <button
            onClick={handleLogout}
            className="danger-button bg-red-600 text-white font-semibold py-2 px-4 rounded hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
  </nav>
    {/* ✅ [REQUEST 1] Floating Status Div */} 
      <div className="fixed top-50 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-64">
        <h4 className="text-lg font-bold mb-2 text-blue-700"></h4>
        <div className="text-sm">
          <p className="mb-1">
            <span className="font-semibold text-gray-700">Count Down:</span>
            <span className="font-bold text-red-600 ml-2">{workingDaysLeft} Working Days</span>
          </p>
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="font-semibold text-gray-700 mb-1">Confirmations:</p>
            <div className="flex flex-col space-y-1 text-sm">
               <p className="whitespace-nowrap">Tour Operator(TO): <span className="font-medium">{totalConfirmations.to}</span></p>
              <p className="whitespace-nowrap">Travel Agent(TA): <span className="font-medium">{totalConfirmations.ta}</span></p>
              <p className="whitespace-nowrap">Travel Counsellors(TC): <span className="font-medium">{totalConfirmations.tc}</span></p>
            
              <p className="whitespace-nowrap">Media/Influence: <span className="font-medium">{totalConfirmations.media}</span></p>
            </div>
            <p className="mt-2 border-t border-gray-200 pt-1">
              <span className="font-bold text-base text-green-600">Grand Total: {totalConfirmations.grandTotal}</span>
            </p>
          </div>
        </div>
      </div>
      {/* End Floating Div */}
</div>

        {/* Main Content */}
        <div className="flex-1 space-y-8">     

        {/* Roadshow Information Section (Header and Budget) */}
        <div id="information" className="flex flex-col space-y-6">


            {/* Project Header and Image - Compact Layout */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="flex justify-between items-start">
                    
                    {/* Project Details (Left Column) */}
                    <div className="flex-grow">
                        {/* Project Name (One Line) */}
                        <h1 className="text-3xl font-bold text-black-400 mb-2 uppercase text-left">
                            {project.name || 'Untitled Project'}
                        </h1>
                        <div className="flex justify-start text-lg text-gray-700">
                        {/* Handled By & Date (Next Line) */}
                        
                        <p className="flex-shrink-0 mr-16  mt-8">
                            <strong className="font-semibold"> {details.project_handiled_by || 'N/A'}</strong>
                        </p>
                        <p className="flex-shrink-0 text-center mr-16  mt-8 ml-[250px]">
                            <strong className="font-semibold">
                              {details.event_date 
                                ? new Date(details.event_date).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric"
                                  }).toUpperCase()
                                : ""}                              
                              </strong>
                        </p>
                        </div>
                    </div>

                    {/* Project Image (Right Column) */}
                    <div className="w-90 h-50 ml-6 flex-shrink-0">

                       {typeof details.image_file === "string" && (
                          <img
                            src={details.image_file}
                            alt={project.name}
                            className="w-[420px] h-[170px] object-cover rounded-md border border-gray-300 shadow-sm"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        )}
                       
                    </div>
                </div>
            </div>

            {/* Budget Section - Directly Below the Header */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              
          
   
        

 

      {/* Success Message - Centered and No Layout Shift */}
{message && (
  <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
    <div className="success-message text-center shadow-lg px-6 py-3 rounded-lg bg-green-600 text-white">
      {message}
    </div>
  </div>
)}
    
                <div className="flex items-center space-x-4 justify-end">
                    <label htmlFor="budget" className="text-xl text-slate-800 flex-shrink-0">Budget:</label>
                    <input
                        id="budget"
                        type="text"
                        value={details.budget ? Number(details.budget).toLocaleString('en-IN') : ''} // Display formatted
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(/,/g, '');
                            if (!isNaN(rawValue)) {
                                setDetails({ ...details, budget: rawValue });
                            }
                        }}
                        className="w-26 (384px) and flex-shrink-0 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-lg text-right"
                        placeholder="Enter Project Budget"
                        disabled={!project || saving === 'roadshow'}
                    />


                    <button
                        onClick={saveRoadshowInfo} // Re-using saveRoadshowInfo which handles budget field
                        className={'action-button'}
                        disabled={saving === 'roadshow'}
                    >
                        {saving === 'roadshow' ? 'Saving...' : 'Save Budget'}
                    </button>
                </div>               
            </div>
            
        </div>

       
    
      {/* Associate Section */}
      <div id="associate" className="section-container">
        <div className="section-header">
          <h2 className="section-title">ASSOCIATE</h2>
          <button
            onClick={saveAssociates}
            disabled={saving === 'associates'}
            className={`action-button ${saving === 'associates' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {saving === 'associates' ? 'Saving...' : 'Save Associates'}
          </button>
        </div>
        
        {/* Associate List Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-3 items-center mb-3 p-3 bg-gray-200 rounded-lg font-semibold text-slate-900">
          <div>Associate Name</div>
          <div>City</div>
          <div className="text-center">Selected</div>
          <div></div> {/* Action column */}
        </div>

        {associates.map((associate, index) => (
          <div key={index} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-3 items-center mb-3 p-3 bg-gray-50 rounded-lg">
            {/* Associate Name */}
            <input
              type="text"
              placeholder="Name"
              value={associate.name}
              onChange={(e) => handleAssociateChange(index, 'name', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            {/* City */}
            <input
              type="text"
              placeholder="City"
              value={associate.city}
              onChange={(e) => handleAssociateChange(index, 'city', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            {/* Selected Checkbox */}
            <div className="flex justify-center">
              <input
                type="checkbox"
                checked={associate.selected}
                onChange={(e) => handleAssociateChange(index, 'selected', e.target.checked)}
                className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
              />
            </div>
            {/* Delete Button */}
            {associates.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveAssociate(index)}
                className="small-delete-btn"
                title="Remove"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="small-delete-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
          Add New Associate
        </button>
      </div>

      {/* Venue Section */}
      <div id="venue" className="section-container">
        <div className="section-header">
          <h2 className="section-title">VENUE</h2>
          <button
            onClick={saveVenues}
            disabled={saving === 'venues'}
            className={`action-button ${saving === 'venues' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {saving === 'venues' ? 'Saving...' : 'Save Venues'}
          </button>
        </div>
         {/* Venue List Header*/}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr_1fr_1fr_1fr_1fr_auto] 
     gap-3 items-center mb-3 p-3 bg-gray-200 rounded-lg font-semibold text-slate-900">
          <div>Venue Name</div>
          <div className='text-left'>Currency</div>
          <div className='text-right'>Rate</div>
          <div className='text-right'>Budget</div>
          <div className="text-right">Venue Rental</div>
          <div className="text-center">AV</div>
          <div className="text-center">Food </div>
          <div className="text-center">Bar</div>
           <div className="text-center">Selected</div>
          <div></div>  {/* Action column */}
        </div>

        {venues.map((venue, index) => (
          <div key={index} className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr_1fr_1fr_1fr_1fr_auto]
    gap-3 items-center mb-3 p-3 bg-gray-50 rounded-lg">
            {/* Venue Name */}
            <input
              type="text"
              placeholder="Venue Name"
              value={venue.name}
              onChange={(e) => handleVenueChange(index, 'name', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            {/* Currency */}
            <select
                value={venue.currency}
                onChange={(e) => handleVenueChange(index, 'currency', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
            </select>
            {/* Rate */}
            <input
              type="text"
              placeholder="Rate"
              value={venue.rateInput}
              onBlur={(e) => {
                const rawNumber = parseNumberInput(e.target.value, venue.currency);
                const formattedString = formatNumberOutput(rawNumber, venue.currency);
                handleVenueChange(index, "rate", rawNumber);
                handleVenueChange(index, "rateInput", formattedString);
              }}
              onChange={(e) => handleVenueChange(index, 'rateInput', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-right font-mono"
            />
            {/* Budget*/}
            <input
              type="text"
              placeholder="Budget"
              value={venue.budgetInput}
              onBlur={(e) => {
                const rawNumber = parseNumberInput(e.target.value, venue.currency);
                const formattedString = formatNumberOutput(rawNumber, venue.currency);
                handleVenueChange(index, "budget", rawNumber);
                handleVenueChange(index, "budgetInput", formattedString);
              }}
              onChange={(e) => handleVenueChange(index, 'budgetInput', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-right font-mono"
            /> 
            {/* Venue Rental */}
            <div className="flex justify-center">
              <input
                type="checkbox"
                checked={venue.venue_rental}
                onChange={(e) => handleVenueChange(index, 'venue_rental', e.target.checked)}
                className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
              />
            </div>
            {/* AV */}
             <div className="flex justify-center">
              <input
                type="checkbox"
                checked={venue.av}
                onChange={(e) => handleVenueChange(index, 'av', e.target.checked)}
                className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
              />
            </div>
            {/* Food & Beverage (combined) */}
           
                 <div className="flex justify-center">
                    <input
                        type="checkbox"
                        checked={venue.food}
                        onChange={(e) => handleVenueChange(index, 'food', e.target.checked)}
                        className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                    />
                    
                </div>
                 <div className="flex justify-center">
                    <input
                        type="checkbox"
                        checked={venue.bar}
                        onChange={(e) => handleVenueChange(index, 'bar', e.target.checked)}
                        className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                    />
                    
                </div>
                 {/* Select Checkbox */}
   <div className="flex justify-center">
    <input
      type="checkbox"
      checked={venue.selected}
      onChange={(e) => handleVenueChange(index, "selected", e.target.checked)}
    />
   
  </div>
           

            {/* Delete Button */}
            {venues.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveVenue(index)}
                className="small-delete-btn"
                title="Remove"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="small-delete-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ))}

        {/* Add Venue Button*/}
        <button
          type="button"
          onClick={handleAddVenue}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 mt-3"
        >
          Add New Venue
        </button>
      </div>
      


      {/* Trade Database Section */}
      <div id="database" className="section-container">
        <div className="section-header">
          <h2 className="section-title">TRADE DATABASE</h2>
          <button
            onClick={saveTradeDatabase}
            disabled={saving === 'trade'}
            className={`action-button ${saving === 'trade' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {saving === 'trade' ? 'Saving...' : 'Save Database'}
          </button>
        </div>

        {/* Trade List Header */}
        <div className="grid grid-cols-[2fr_repeat(4,1fr)_auto] gap-3 items-center mb-3 p-3 bg-gray-200 rounded-lg font-semibold text-slate-900">
          <div>Category</div>
          <div className="text-center">Tour Operator</div>
          <div className="text-center">Travel Agent</div>
          <div className="text-center">Travel Counsellors</div>
          <div className="text-center">Media / Influencer</div>
          <div className="text-center">Total</div>
        </div>

        {tradeDatabase.map((trade, index) => {
          const categoryTotal = (
            (Number(trade.travel_operator) || 0) +
            (Number(trade.travel_agent) || 0) +
            (Number(trade.travel_counsellor) || 0) +
            (Number(trade.media_influencers) || 0)
          );

          return (
            <div key={index} className="grid grid-cols-[2fr_repeat(4,1fr)_auto] gap-3 items-center mb-3 p-3 bg-gray-50 rounded-lg">
              {/* Trade Name (Read-only if default, editable if 'Others') */}
              <input
                type="text"
                placeholder="Category Name"
                value={trade.trade_name}
                onChange={(e) => handleTradeChange(index, 'trade_name', e.target.value)}
                className={`px-3 py-2 border border-gray-300 rounded-md ${defaultTrades.some(d => d.trade_name === trade.trade_name) && trade.trade_name !== 'Others' ? 'bg-gray-100' : ''}`}
                disabled={defaultTrades.some(d => d.trade_name === trade.trade_name) && trade.trade_name !== 'Others'}
              />

              {/* Tour Operator */}
              <input
                type="number"
                placeholder="Tour Operator"
                value={trade.travel_operator}
                onChange={(e) => handleTradeChange(index, 'travel_operator', e.target.value)}
                className="p-2 border border-gray-300 rounded-md text-right"
              />

              {/* Travel Agent */}
              <input
                type="number"
                placeholder="Travel Agent"
                value={trade.travel_agent}
                onChange={(e) => handleTradeChange(index, 'travel_agent', e.target.value)}
                className="p-2 border border-gray-300 rounded-md text-right"
              />

              {/* Travel Counsellors */}
              <input
                type="number"
                placeholder="Travel Counsellors"
                value={trade.travel_counsellor}
                onChange={(e) => handleTradeChange(index, 'travel_counsellor', e.target.value)}
                className="p-2 border border-gray-300 rounded-md text-right"
              />

              {/* Media_influencers */}
              <input
                type="number"
                placeholder="Media / Influencer"
                value={trade.media_influencers}
                onChange={(e) => handleTradeChange(index, 'media_influencers', e.target.value)}
                className="p-2 border border-gray-300 rounded-md text-right"
              />

              {/* Category Total */}
              <div className="font-semibold text-center text-slate-800">
                {categoryTotal}
              </div>

              {/* Delete Button (only show for "Others" or custom added rows) */}
              {trade.trade_name === 'Others' && tradeDatabase.length > defaultTrades.length && (
                  <button onClick={() => handleRemoveTrade(index)} title="Remove" className="ml-auto p-1.5 text-red-600 hover:text-red-800 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                  </button>
              )}
            </div>
          );
        })}

        {/* Grand Total */}
        <div className="grid grid-cols-[2fr_repeat(4,1fr)_auto] gap-3 items-center mt-5 p-3 bg-gray-200 rounded-lg font-semibold text-slate-900">
          <div>Total →</div>
          {/* Tour Operator Total */}
          <div className='text-right'>
            {tradeDatabase.reduce((sum, t) => sum + (Number(t.travel_operator) || 0), 0)}
          </div>
          {/* Travel Agent Total */}
          <div className='text-right'>
            {tradeDatabase.reduce((sum, t) => sum + (Number(t.travel_agent) || 0), 0)}
          </div>
          {/* Travel Counsellors Total */}
          <div className='text-right'>
            {tradeDatabase.reduce((sum, t) => sum + (Number(t.travel_counsellor) || 0), 0)}
          </div>
          {/* Media / Influencer Total */}
          <div className='text-right'>
            {tradeDatabase.reduce((sum, t) => sum + (Number(t.media_influencers) || 0), 0)}
          </div>
          {/* Grand Total */}
          <div className='text-center'>
            {tradeDatabase.reduce((sum, t) => sum + 
              (Number(t.travel_operator) || 0) + 
              (Number(t.travel_agent) || 0) + 
              (Number(t.travel_counsellor) || 0) + 
              (Number(t.media_influencers) || 0), 0)}
          </div>
        </div>

       
      </div>


      {/* RSVP Section */}
      <div id="rsvp" className="section-container">
        <div className="section-header">
          <h2 className="section-title">RSVP #1 – SAVE THE DATE</h2>
          <div className="flex space-x-3">
              <button
                onClick={saveRSVP}
                disabled={saving === "rsvp"}
                className={`action-button ${saving === "rsvp" ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {saving === "rsvp" ? "Saving Save The Date..." : "Save The Date"}
              </button>
             
          </div>
        </div>

        {/* === SAVE THE DATE === */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8 border border-blue-200">
            <div className='flex justify-between items-start mb-4'>
                <h3 className="text-xl font-bold text-blue-700">Save The Date</h3>
                <div className="text-right text-sm">
                    <div className="text-gray-700 font-medium">Countdown</div>
                    <div className="text-red-600 font-bold text-lg border border-red-500 inline-block px-3 py-1 rounded">
                        {workingDaysLeft}
                    </div>
                    <div className="text-xs text-gray-500">working days left</div>
                </div>
            </div>
<div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
        Save The Date Image Upload:
      </label>
      <input type="file" onChange={(e) => setSaveTheDateImage(e.target.files[0])} />
      {invitationFile && (
        <div className="flex items-center gap-3 mt-2">
          <img
            src={invitationFile}
            alt="Save The Date"
            className="w-24 h-16 object-cover rounded border"
          />
          <a
            href={invitationFile}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            View Full Image
          </a>
        </div>
      )}
    </div>
            <div className="grid grid-cols-1 md:grid-cols-[1.5fr_repeat(5,1fr)] gap-4 items-end mb-4 p-4 border-b border-gray-200 rounded-lg font-semibold text-slate-900">
                <div>Date</div>
                <div>Tour Operator (Nos)</div>
                <div>Travel Agent (Nos)</div>
                <div>Travel Counsellors (Nos)</div>
                <div>Media / Influence (Nos)</div>
                 <div>Total</div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-[1.5fr_repeat(5,1fr)_auto] gap-3 items-center mb3">
                <input
                    type="date"
                    value={saveDate.save_the_date || ""}
                    onChange={(e) => handleSaveDateChange("save_the_date", e.target.value)}
                    className="form-input"
                />
                <input
                    type="number"
                    placeholder="Tour Operator"
                    value={saveDate.save_the_date_to_nos || ""}
                    onChange={(e) => handleSaveDateChange("save_the_date_to_nos", e.target.value)}
                    className="form-input text-right"
                />
                <input
                    type="number"
                    placeholder="Travel Agent"
                    value={saveDate.save_the_date_ta_nos || ""}
                    onChange={(e) => handleSaveDateChange("save_the_date_ta_nos", e.target.value)}
                    className="form-input text-right"
                />
                <input
                    type="number"
                    placeholder="Travel Counsellors"
                    value={saveDate.save_the_date_travel_counsellors_nos || ""}
                    onChange={(e) => handleSaveDateChange("save_the_date_travel_counsellors_nos", e.target.value)}
                    className="form-input text-right"
                />
                <input
                    type="number"
                    placeholder="Media / Influence"
                    value={saveDate.save_the_date_influencers_nos || ""}
                    onChange={(e) => handleSaveDateChange("save_the_date_influencers_nos", e.target.value)}
                    className="form-input text-right"
                />

                <div className="text-center font-semibold text-slate-800 bg-gray-100 rounded-md py-2">
        {(Number(saveDate.save_the_date_to_nos) || 0) +
          (Number(saveDate.save_the_date_ta_nos) || 0) +
          (Number(saveDate.save_the_date_travel_counsellors_nos) || 0) +
          (Number(saveDate.save_the_date_influencers_nos) || 0)}
      </div>
            </div>
             
          
        </div>


        {/* === MAIN INVITATIONS (multiple) === */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8 border border-purple-200">

          {/* MAIN INVITE HEADER LEFT + RIGHT */}
<div className="flex justify-between items-center mb-4">
  
  {/* LEFT: TITLE */}
  <h3 className="text-md font-semibold text-purple-700  mb-2">
    RSVP #2 – MAIN INVITE
  </h3>

  {/* RIGHT: BUTTON */}



  <button
    onClick={saveMainInvites}
    disabled={saving === "main invites"}
    className={`action-button  ${
      saving === "main invites" ? "opacity-50 cursor-not-allowed" : ""
    }`}
  >
    {saving === "main invites" ? "Saving Main Invites..." : "Save Main Invites"}
  </button>
</div>
           
                  <div className="mb-3">
    <label className="block text-sm font-medium text-gray-700">
      Main Invite Image Upload:
    </label>
    <input type="file" onChange={(e) => setMainInviteImage(e.target.files[0])} />
    {mainInviteImage && (
      <div className="flex items-center gap-3 mt-2">
        <img
          src={mainInviteImage}
          alt="Main Invite"
          className="w-24 h-16 object-cover rounded border"
        />
        <a
          href={mainInviteImage}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline"
        >
          View Full Image
        </a>
      </div>
    )}
  </div> 
            {/* Main Invite Header */}
            <div className="grid grid-cols-1 md:grid-cols-[340px_210px_210px_210px_210px_170px_100px] gap-2 items-center bg-gray-50  p-2 mt-2 bg-gray-200 rounded-lg font-semibold text-slate-900">            
                <div>Date</div>
                <div>Tour Operator (Nos)</div>
                <div>Travel Agent (Nos)</div>
                <div>Travel Counsellors (Nos)</div>
                <div>Media / Influence (Nos)</div>
                 <div>Total</div>
                <div></div> {/* Action Column */}
            </div>
           {/* Upload Main Invite image */}
              
            {mainInvites.map((invite, index) => {
          const rowTotal =
        (Number(invite.main_invite_to_nos) || 0) +
        (Number(invite.main_invite_ta_nos) || 0) +
        (Number(invite.main_invite_travel_counsellors_nos) || 0) +
        (Number(invite.main_invite_influencers_nos) || 0);
         return (
                <div key={index} className="bg-gray-50 p-3 rounded-lg mb-3">
                   <h3 className="font-semibold text-left mb-2">RSVP #{index + 2} – Main Invite</h3>
            <div  className="grid grid-cols-1 grid-cols-[340px_210px_210px_210px_210px_170px_100px] gap-2 items-center bg-gray-50 rounded-lg">
                    <input
                        type="date"
                        value={invite.main_invite_date || ""}
                        onChange={(e) => handleMainInviteChange(index, "main_invite_date", e.target.value)}
                        className="form-input"
                    />
                    <input
                        type="number"
                        placeholder="Tour Operator"
                        value={invite.main_invite_to_nos || ""}
                        onChange={(e) => handleMainInviteChange(index, "main_invite_to_nos", e.target.value)}
                        className="form-input text-right"
                    />
                    <input
                        type="number"
                        placeholder="Travel Agent"
                        value={invite.main_invite_ta_nos || ""}
                        onChange={(e) => handleMainInviteChange(index, "main_invite_ta_nos", e.target.value)}
                        className="form-input text-right"
                    />
                    <input
                        type="number"
                        placeholder="Travel Counsellors"
                        value={invite.main_invite_travel_counsellors_nos || ""}
                        onChange={(e) => handleMainInviteChange(index, "main_invite_travel_counsellors_nos", e.target.value)}
                        className="form-input text-right"
                    />
                    <input
                        type="number"
                        placeholder="Media / Influence"
                        value={invite.main_invite_influencers_nos || ""}
                        onChange={(e) => handleMainInviteChange(index, "main_invite_influencers_nos", e.target.value)}
                        className="form-input text-right"
                    />
                    <div className="text-center font-semibold text-slate-800 bg-gray-100 rounded-md py-2">
              {rowTotal}
            </div>
                    {/* Delete Button */}
                    <div className="flex justify-end">
                        <button type="button" onClick={() => removeMainInvite(index)} className="small-delete-btn" title="Remove">
                            <svg xmlns="http://www.w3.org/2000/svg" className="small-delete-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                    </div>
                </div>
        
            

            );
})}
                    {/* Totals Row */}
  <div className="grid grid-cols-[340px_210px_210px_210px_210px_170px] gap-2 items-right mt-5 p-3 bg-gray-200 rounded-lg ">
    <div>Total →</div>
    <div>{mainInvites.reduce((sum, t) => sum + (Number(t.main_invite_to_nos) || 0), 0)}</div>
    <div>{mainInvites.reduce((sum, t) => sum + (Number(t.main_invite_ta_nos) || 0), 0)}</div>
    <div>{mainInvites.reduce((sum, t) => sum + (Number(t.main_invite_travel_counsellors_nos) || 0), 0)}</div>
    <div>{mainInvites.reduce((sum, t) => sum + (Number(t.main_invite_influencers_nos) || 0), 0)}</div>
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
            {/* Add Main Invite Button */}
            <button
                type="button"
                onClick={addMainInvite}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 mt-3"
            >
                Add New Main Invitation Date
            </button>

           
        </div>
      </div>

      
      {/* AV Setup Section */}
      <div id="av" className="section-container">
        <div className="section-header">
          <h2 className="section-title">HOTEL AV SETUP</h2>
          <button
            onClick={saveAVSetup}
            disabled={saving === 'av'}
            className={`action-button ${saving === 'av' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {saving === 'av' ? 'Saving...' : 'Save AV Setup'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Backdrop */}
            <div>
              <label className="block mb-1 font-medium text-slate-700">Backdrop (Size / Specs)</label>
              <input
                type="text"
                placeholder="e.g., 10ft x 8ft LED Wall"
                value={avSetup.backdrop || ''}
                onChange={(e) => setAvSetup({ ...avSetup, backdrop: e.target.value })}
                className="form-input"
              />
            </div>
            {/* Screen */}
            <div>
              <label className="block mb-1 font-medium text-slate-700">Screen (Size / Specs)</label>
              <input
                type="text"
                placeholder="e.g., 6ft x 4ft projector screen"
                value={avSetup.screen || ''}
                onChange={(e) => setAvSetup({ ...avSetup, screen: e.target.value })}
                className="form-input"
              />
            </div>
             {/* Mic */}
            <div>
              <label className="block mb-1 font-medium text-slate-700">Mic (Nos)</label>
              <input
                type="number"
                placeholder="e.g., 4 collared mics, 2 handheld"
                value={avSetup.mic || ''}
                onChange={(e) => setAvSetup({ ...avSetup, mic: e.target.value })}
                className="form-input"
              />
            </div>
             {/* Type */}
            <div>
              <label className="block mb-1 font-medium text-slate-700">Type (System used)</label>
              <input
                type="text"
                placeholder="e.g., Bose System, JBL"
                value={avSetup.type || ''}
                onChange={(e) => setAvSetup({ ...avSetup, type: e.target.value })}
                className="form-input"
              />
            </div>
            {/* Projector Checkbox */}
            <div className="flex items-center gap-1 mt-6 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={avSetup.projector || false}
                onChange={(e) => setAvSetup({ ...avSetup, projector: e.target.checked })}
                className="accent-blue-600 h-3.5 w-3.5"
              />
              <label className="whitespace-nowrap">Projector</label>
            </div>
            {/* Podium Checkbox */}
            <div className="flex items-center gap-1 mt-6 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={avSetup.podium || false}
                onChange={(e) => setAvSetup({ ...avSetup, podium: e.target.checked })}
                className="accent-blue-600 h-3.5 w-3.5"
              />
              <label className="whitespace-nowrap">Podium</label>
            </div>
          </div>

          <div className="space-y-4">
            {/* Backdrop Image */}
            <div>
              <label className="block mb-1 font-medium text-slate-700">Backdrop Image</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => setAvSetup({ ...avSetup, backdrop_image: e.target.files[0] })}
                className="w-full text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer focus:outline-none"
              />
              {avSetup.backdrop_image && (
                <img
                  src={
                    avSetup.backdrop_image instanceof File
                      ? URL.createObjectURL(avSetup.backdrop_image)
                      : avSetup.backdrop_image
                  }
                  alt="Backdrop Preview"
                  className="mt-2 h-24 w-auto object-cover rounded shadow"
                />
              )}
            </div>

            {/* Screen Image */}
            <div>
              <label className="block mb-1 font-medium text-slate-700">Screen Image</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => setAvSetup({ ...avSetup, screen_image: e.target.files[0] })}
                className="w-full text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer focus:outline-none"
              />
              {avSetup.screen_image && (
                <img
                  src={
                    avSetup.screen_image instanceof File
                      ? URL.createObjectURL(avSetup.screen_image)
                      : avSetup.screen_image
                  }
                  alt="Backdrop Preview"
                  className="mt-2 h-24 w-auto object-cover rounded shadow"
                />
              )}
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
      </div>

      {/* Hotel av supplier Section */}
      <div id="av_supplier" className="section-container">
        <div className="section-header">
          <h2 className="section-title">AV SUPPLIER</h2>
          <button
            onClick={saveHotels}
            disabled={saving === "hotels"}
            className={`action-button ${saving === "hotels" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {saving === "hotels" ? "Saving..." : "Save Av Supplier"}
          </button>
        </div>

        {/* Header Row */}
        <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-3 items-center mb-3 p-3 bg-gray-200 rounded-lg font-semibold text-slate-900">
            <div>Supplier</div>
            <div>Item</div>
            <div>Currency</div>
            <div className='text-center'>Amount</div>
            <div className="text-center">Selected</div>
            <div></div> {/* Action column */}
        </div>

        {hotels.map((hotel, index) => (
          <div key={index} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-3 items-center mb-3 p-3 bg-gray-50 rounded-lg" >
            {/* Sponsor supplier */}
            <input
              type="text"
              placeholder="Supplier Name"
              value={hotel.sponsor}
              onChange={(e) => handleHotelChange(index, "sponsor", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            {/* Item */}
            <input
              type="text"
              placeholder="Item"
              value={hotel.item}
              onChange={(e) => handleHotelChange(index, "item", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            {/* Currency */}
            <select
                value={hotel.currency}
                onChange={(e) => handleHotelChange(index, 'currency', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
            </select>
            {/* Amount (Controlled by locale functions) */}
            <input
              type="text"
              placeholder="Amount"
              value={hotel.amount}
              // When focusing, show raw/unformatted value if the field is not actively being edited
              onFocus={(e) => {
                // Get the raw number from the formatted string for editing
                const rawNumber = parseNumberInput(e.target.value, hotel.currency);
                // Update state to show the raw number (e.g., 45500.5)
                handleHotelChange(index, "amount", rawNumber.toString());
              }}
              onBlur={(e) => {
                // 1. Parse the user's localized input string to get the raw float number
                const rawNumber = parseNumberInput(e.target.value, hotel.currency);
                // 2. Format that raw number back into a clean, display string (e.g., "45,500.50" or "45.500,50")
                const formattedString = formatNumberOutput(rawNumber, hotel.currency);
                // 3. Update state with the clean display string and turn off editing
                handleHotelChange(index, "amount", formattedString);
                handleHotelChange(index, "_editing", false);
              }}
              // While typing, just store the raw string input to state
              onChange={(e) => handleHotelChange(index, "amount", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-right font-mono focus:ring-2 focus:ring-blue-500 transition duration-150"
            />

            {/* Select Checkbox */}
            <div className="flex justify-center">
              <input
                type="checkbox"
                checked={hotel.selected}
                onChange={(e) => handleHotelChange(index, "selected", e.target.checked)}
                className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
              />
            </div>
            
            {/* Delete Button */}
            {hotels.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveHotel(index)}
                className="small-delete-btn"
                title="Remove"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="small-delete-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
          Add New Supplier
        </button>
      </div>


      {/* Embassy / Consulate Section */}
      <div id="embassy" className="section-container">
        <div className="section-header">
          <h2 className="section-title">EMBASSY / CONSULATE</h2>
          <button
            onClick={saveEmbassy}
            disabled={saving === "embassy"}
            className={`action-button ${saving === "embassy" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {saving === "embassy" ? "Saving..." : "Save Embassy Info"}
          </button>
        </div>

        <h3 className="text-lg font-bold text-gray-800 mb-3">Chief Guest Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
          {/* Chief Guest Name */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Name</label>
            <input
              type="text"
              placeholder="Name"
              value={embassy.cheif_guest || ''}
              onChange={(e) => setEmbassy({ ...embassy, cheif_guest: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {/* Chief Guest Designation */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Designation</label>
            <input
              type="text"
              placeholder="Designation"
              value={embassy.cheif_guest_designation || ''}
              onChange={(e) => setEmbassy({ ...embassy, cheif_guest_designation: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {/* Chief Guest Phone */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Contact</label>
            <input
              type="text"
              placeholder="Phone Number"
              value={embassy.cheif_guest_phone || ''}
              onChange={(e) => setEmbassy({ ...embassy, cheif_guest_phone: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-800 mb-3">Accommodation Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg shadow-sm">
          {/* Accommodation Contact */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Name</label>
            <input
              type="text"
              placeholder="Contact Name"
              value={embassy.accommodation_contact || ''}
              onChange={(e) => setEmbassy({ ...embassy, accommodation_contact: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {/* Accommodation Address */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Designation</label>
            <input
              type="text"
              placeholder="Designation"
              value={embassy.accommodation_address || ''}
              onChange={(e) => setEmbassy({ ...embassy, accommodation_address: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {/* Accommodation Phone */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Contact</label>
            <input
              type="text"
              placeholder="Contact"
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
          <h2 className="section-title">CLIENT</h2>
          <button
            onClick={saveClient}
            disabled={saving === "clients"}
            className={`action-button ${saving === "clients" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {saving === "clients" ? "Saving..." : "Save clients"}
          </button>
        </div>

        {/* Header Row */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 items-center mb-3 p-3 bg-gray-200 rounded-lg font-semibold text-slate-900">
            <div>Name</div>
            <div>Designation</div>
            <div>Contact</div>
            <div>Hotel</div>
            <div></div> {/* Action column */}
        </div>

        {clients.map((client, index) => (
          <div key={index} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 items-center mb-3 p-3 bg-gray-50 rounded-lg" >
            {/* client name */}
            <input
              type="text"
              placeholder="Name"
              value={client.name}
              onChange={(e) => handleClientChange(index, "name", e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md"
            />
            {/* client Designation */}
            <input
              type="text"
              placeholder="Designation"
              value={client.designation}
              onChange={(e) => handleClientChange(index, "designation", e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md"
            />
             {/* client Contact */}
            <input
              type="text"
              placeholder="Contact"
              value={client.contact}
              onChange={(e) => handleClientChange(index, "contact", e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md"
            />
            {/* client hotel */}
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
                <svg xmlns="http://www.w3.org/2000/svg" className="small-delete-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
          Add New Client
        </button>
      </div>

      {/* Stark Section */}
      <div id="stark" className="section-container">
        <div className="section-header">
          <h2 className="section-title">STARK</h2>
          <button
            onClick={saveStark}
            disabled={saving === "starks"}
            className={`action-button ${saving === "starks" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {saving === "starks" ? "Saving..." : "Save Starks"}
          </button>
        </div>

        {/* Header Row */}
        <div className="grid grid-cols-[2fr_1fr_auto] gap-3 items-center mb-3 p-3 bg-gray-200 rounded-lg font-semibold text-slate-900">
            <div>Name</div>
            <div>Hotel</div>
            <div></div> {/* Action column */}
        </div>
        
        {starks.map((stark, index) => (
          <div key={index} className="grid grid-cols-[2fr_1fr_auto] gap-3 items-center mb-3 p-3 bg-gray-50 rounded-lg" >
            {/* stark name */}
            <input
              type="text"
              placeholder="Name"
              value={stark.name}
              onChange={(e) => handleStarkChange(index, "name", e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md"
            />
            {/* stark hotel*/}
            <input
              type="text"
              placeholder="Hotel"
              value={stark.hotel}
              onChange={(e) => handleStarkChange(index, "hotel", e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded-md"
            />
            {/* Delete Button */}
            {starks.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveStark(index)}
                className="small-delete-btn"
                title="Remove"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="small-delete-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ))}
        {/* Add Client Button */}
        <button
          type="button"
          onClick={handleAddStark}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 mt-3"
        >
          Add New Stark
        </button>
      </div>

      {/* Checklist Section */}
      <div id="checklist" className="section-container">
        <div className="section-header">
          <h2 className="section-title">CHECKLIST</h2>
          <button
            onClick={saveChecklists}
            disabled={saving === 'checklists'}
            className={`action-button ${saving === 'checklists' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {saving === 'checklists' ? 'Saving...' : 'Save Checklists'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {checklists.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm">
              <input
                type="text"
                placeholder="Checklist Item Name"
                value={item.name}
                onChange={(e) => handleChecklistChange(index, 'name', e.target.value)}
                className="flex-grow p-2 border border-gray-300 rounded-md mr-3"
              />
              <div className="flex items-center space-x-4">
                <label htmlFor={`checklist-${index}`} className="text-gray-700 font-medium">Completed</label>
                <input
                  id={`checklist-${index}`}
                  type="checkbox"
                  checked={item.selected}
                  onChange={(e) => handleChecklistChange(index, 'selected', e.target.checked)}
                  className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                />
                {/* Delete Button */}
                {checklists.length > defaultChecklists.length && (
                  <button
                    type="button"
                    onClick={() => handleRemovechecklist(index)}
                    className="small-delete-btn ml-2"
                    title="Remove"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="small-delete-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Checklist Button */}
        <button
          type="button"
          onClick={handleAddChecklist}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 mt-4"
        >
          Add Custom Checklist Item
        </button>
      </div>


      {/* Menu Upload Section */}
      <div id="menu" className="section-container">
        <div className="section-header">
          <h2 className="section-title">MENU (IMAGE UPLOAD)</h2>
          <button
            onClick={saveMenu}
            disabled={saving === 'menu' || !menuFile}
            className={`action-button ${saving === 'menu' || !menuFile ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {saving === 'menu' ? 'Uploading...' : 'Upload Menu'}
          </button>
        </div>

        <div className="p-6 bg-white shadow-md rounded-lg">
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

          {/* ✅ Show either selected file (File object) or previously uploaded one */}
          {menuFile && (
            typeof menuFile === 'object' && menuFile instanceof File ? (
                // New file selected for upload
                <p className="mt-3 text-sm text-green-600 font-medium">File selected for upload: {menuFile.name}</p>
            ) : (
              // Previously uploaded file link (assuming menuFile is an object with fileName and filePath)
              menuFile.fileName && (
                <div className="mt-3 text-sm text-gray-600">
                  Current Uploaded File: <a 
                      href={`${UPLOAD_BACK_URL}/${menuFile.filePath}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                      {menuFile.fileName} ({Math.round(menuFile.fileSize / 1024)} KB)
                  </a>
                </div>
              )
            )
          )}
        </div>
      </div>

      {/* Remarks Section */}
      <div id="remarks" className="section-container">
        <div className="section-header">
          <h2 className="section-title text-slate-800">VIEWER REMARKS</h2>
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
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-lg hover:bg-blue-700 transition duration-200 print:hidden"
          >
            Print Project Details
          </button>
        </div>
      </div>
    </div>
  </div>
);
};

export default ProjectDetails;