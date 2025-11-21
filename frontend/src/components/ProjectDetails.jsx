// src/components/ProjectDetails.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectAPI, projectSectionsAPI } from "../services/api.jsx";
import logo from "../assets/images/company_logo.png";
import patternBg from "../assets/images/pattern.png"; // put your repeating pattern at this path
import "../styles/tailwind.css";

/*
  ProjectDetails.jsx - consolidated responsive version (4 parts).
  Paste the 4 parts one after another into a single file.
*/

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const creating = !id || id === "new";

  const [project, setProject] = useState(null);
  const [details, setDetails] = useState({
    roadshowName: "",
    event_date: "",
    project_handiled_by: "",
    budget: "",
    image_file: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [associates, setAssociates] = useState([{ name: "", city: "", selected: false }]);
  const [venues, setVenues] = useState([{ name: "", currency: "INR", rate: "", rateInput: "", budget: "", budgetInput: "", selected: false, venue_rental: false, av: false, food: false, bar: false }]);
  const [tradeDatabase, setTradeDatabase] = useState([
    { trade_name: "Associate", travel_operator: "", travel_agent: "", travel_counsellor: "", media_influencers: "" },
  ]);
  const [rsvp, setRsvp] = useState([]);
   const [invitationFile, setInvitationFile] = useState(null);
  const [mainInvites, setMainInvites] = useState([]);
  const [saveDate, setSaveDate] = useState({
    save_the_date: "",
    save_the_date_to_nos: 0,
    save_the_date_ta_nos: 0,
    save_the_date_travel_counsellors_nos: 0,
    save_the_date_influencers_nos: 0,
  });
  const [mainInviteImage, setMainInviteImage] = useState(null);
  const [saveTheDateImage, setSaveTheDateImage] = useState(null);
  const [avSetup, setAvSetup] = useState({ backdrop: '', screen: '', mic: '', type:'', projector: false, podium: false, backdrop_image:null,screen_image:null,stage_image:null });
  const [hotels, setHotels] = useState([{ sponsor: "", name: "", selected: false, item: "", currency: "INR", amount: "" }]);
   const defaultChecklists = [
    { name: 'Visiting Card', selected: false },
    { name: 'Mementos', selected: false },
    { name: 'Presentation', selected: false },
    { name: 'Gifts', selected: false },
    { name: 'Others', selected: false },
  ];
  const [checklists, setChecklists] = useState(defaultChecklists);
  const [embassy, setEmbassy] = useState({});
  const [clients, setClients] = useState([]);
  const [starks, setStarks] = useState([]);
  const [menuFile, setMenuFile] = useState(null);
  const [remarks, setRemarks] = useState([]);
  const [workingDaysLeft, setWorkingDaysLeft] = useState(0);

  const UPLOAD_BACK_URL = `${import.meta.env.VITE_UPLOAD_BACK_URL?.replace(/\/$/, '') || "http://localhost:5000"}`;

  // Helpers - number parsing + formatting
  const parseNumberInput = (value, currency) => {
    if (!value && value !== 0) return "";
    let v = String(value).trim();
    if (currency === "EUR") {
      v = v.replace(/\./g, "_TMP_").replace(/,/g, ".").replace(/_TMP_/g, "");
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
      currency === "INR" ? "en-IN" : currency === "EUR" ? "de-DE" : "en-US",
      { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }
    );
  };

  // working days count
  const calculateWorkingDays = (dateStr) => {
    if (!dateStr) return 0;
    const today = new Date();
    const target = new Date(dateStr);
    if (target <= today) return 0;
    let count = 0;
    let cur = new Date(today);
    while (cur < target) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
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

  // compute totals used by floating totals
  const calculateTotalConfirmations = () => {
    const sdTo = Number(saveDate.save_the_date_to_nos || 0);
    const sdTa = Number(saveDate.save_the_date_ta_nos || 0);
    const sdTc = Number(saveDate.save_the_date_travel_counsellors_nos || 0);
    const sdMedia = Number(saveDate.save_the_date_influencers_nos || 0);

    const mainTotals = mainInvites.reduce((acc, m) => {
      acc.to += Number(m.main_invite_to_nos || 0);
      acc.ta += Number(m.main_invite_ta_nos || 0);
      acc.tc += Number(m.main_invite_travel_counsellors_nos || 0);
      acc.media += Number(m.main_invite_influencers_nos || 0);
      return acc;
    }, { to: 0, ta: 0, tc: 0, media: 0 });

    const totals = {
      to: sdTo + mainTotals.to,
      ta: sdTa + mainTotals.ta,
      tc: sdTc + mainTotals.tc,
      media: sdMedia + mainTotals.media,
    };
    totals.grandTotal = totals.to + totals.ta + totals.tc + totals.media;
    return totals;
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
    
  // fetch project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!id || id === "new") {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [projectRes, detailsRes, remarksRes, progressRes] = await Promise.all([
          projectAPI.getById(id),
          projectAPI.getDetails(id),
          projectAPI.getRemarks(id),
          projectAPI.getProgress(id).catch(() => ({ data: { progress: 0 } })),
        ]);

        if (projectRes?.data) setProject(projectRes.data);

        const d = detailsRes?.data || {};
        setDetails({
          roadshowName: d.roadshow_name || (projectRes?.data?.name || ""),
          event_date: d.event_date ? new Date(d.event_date).toISOString().split("T")[0] : "",
          project_handiled_by: d.project_handiled_by || "",
          budget: d.budget || "",
          image_file: d.image_file || projectRes?.data?.image_file || "",
        });

        setAssociates(d.associates && d.associates.length ? d.associates : [{ name: "", city: "", selected: false }]);
        setVenues((d.venues && d.venues.length ? d.venues : []).map(v => ({
          name: v.name || "",
          currency: v.currency || "INR",
          rate: v.rate || "",
          rateInput: formatNumberOutput(v.rate || "", v.currency || "INR"),
          budget: v.budget || "",
          budgetInput: formatNumberOutput(v.budget || "", v.currency || "INR"),
          selected: v.selected || false,
          venue_rental: v.venue_rental || false,
          av: v.av || false,
          food: v.food || false,
          bar: v.bar || false,
        })));
        setTradeDatabase(d.trade_database && d.trade_database.length ? d.trade_database : tradeDatabase);
        setRsvp(d.rsvp || []);
        setInvitationFile(d.rsvp?.[0]?.invitation_design_file_path || '');
        setSaveDate(d.rsvp && d.rsvp[0] ? {
          save_the_date: d.rsvp[0].save_the_date || "",
          save_the_date_to_nos: d.rsvp[0].save_the_date_to_nos || 0,
          save_the_date_ta_nos: d.rsvp[0].save_the_date_ta_nos || 0,
          save_the_date_travel_counsellors_nos: d.rsvp[0].save_the_date_travel_counsellors_nos || 0,
          save_the_date_influencers_nos: d.rsvp[0].save_the_date_influencers_nos || 0,
        } : {
          save_the_date: "", save_the_date_to_nos: 0, save_the_date_ta_nos: 0, save_the_date_travel_counsellors_nos: 0, save_the_date_influencers_nos: 0
        });
        setMainInvites(d.mainInvites || []);
         setAvSetup(d.av_setup || {});
        setHotels(d.hotels || []);
        //setChecklists(d.checklist && d.checklist.length ? d.checklist : []);
        // ----- CHECKLIST LOAD FIX -dd----
      let loadedChecklist =
        d.checklist || d.checklists || d.check_list || d.check_list_items || [];

      if (Array.isArray(loadedChecklist) && loadedChecklist.length > 0) {
        setChecklists(loadedChecklist);
      } else {
        setChecklists(defaultChecklists);
      }
      // --------------------------------
        setEmbassy(d.embassy || {});
        setClients(d.clients || []);
        setStarks(d.starks || []);
        setMenuFile({
          fileName: d.menuFile?.[0]?.filename || "",
          filePath: d.menuFile?.[0]?.file_path || "",
          fileSize: d.menuFile?.[0]?.file_size || "",
          fileType: d.menuFile?.[0]?.mime_type || "",
        });
        setRemarks(remarksRes?.data || []);
        setProgress(progressRes?.data?.progress || 0);
      } catch (err) {
        console.error("Error fetching project details", err);
        alert("Failed to load project details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // When the event date changes, update working days left
  useEffect(() => {
    if (details.event_date) {
      setWorkingDaysLeft(calculateWorkingDays(details.event_date));
    } else {
      setWorkingDaysLeft(0);
    }
  }, [details.event_date]);


  // message helper
  const showMessage = (t) => {
    setMessage(t);
    setTimeout(() => setMessage(""), 3000);
  };

  // Escape hatch for loading state
  if (loading) {
    return <div className="p-6">Loading project details…</div>;
  }

  if (creating) {
    // Minimal create UI
    return (
      <div className="p-6">
        <h2>Create Project</h2>
        <form onSubmit={async (e) => {
          e.preventDefault();
          try {
            const formData = new FormData();
            formData.append("name", details.roadshowName || "Untitled Project");
            formData.append("event_date", details.event_date || new Date().toISOString().slice(0, 10));
            if (details.image_file instanceof File) formData.append("image_file", details.image_file);
            const res = await projectAPI.create(formData, { headers: { "Content-Type": "multipart/form-data" } });
            navigate(`/project/${res.data.id}`);
            showMessage("Project created!");
          } catch (err) {
            console.error(err);
            alert("Project creation failed");
          }
        }}>
          <div className="mb-3">
            <label className="block mb-1">Name</label>
            <input className="border px-3 py-2 rounded w-full" value={details.roadshowName} onChange={(e) => setDetails({ ...details, roadshowName: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="block mb-1">Event Date</label>
            <input type="date" className="border px-3 py-2 rounded w-full" value={details.event_date} onChange={(e) => setDetails({ ...details, event_date: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="block mb-1">Image</label>
            <input type="file" accept="image/*" onChange={(e) => setDetails({ ...details, image_file: e.target.files[0] })} />
          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded">Create</button>
        </form>
      </div>
    );
  }
  // ---- UI START (after creating/loading) ----
  const totals = calculateTotalConfirmations();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Outer thin border like mock overflow-hidden md:overflow-visible*/}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        {/* TOP NAV */}
        <div className="mt-10"></div>
        <header className="px-8 min-h-[115px] border-b border-gray-200 flex items-center">
          <div className="flex items-center gap-10 w-full">
            <div className="flex items-center"  style={{ height: "100px" }}>
              <img src={logo} alt="STARK" className="h-[85px] object-contain mt-[10px]" />
            </div>

            <nav className="flex items-center gap-8 text-xl text-gray-800 ml-[180px] mt-[42px]">
              <button onClick={() => navigate("/projects")} className="hover:opacity-80">Dashboard</button>

              <div className="relative group">
                <button className="flex items-center gap-2 hover:opacity-80">
                  Projects <span className="text-xl">…</span>
                </button>
                <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded shadow-lg opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
                  <ul className="p-2 text-gray-800 font-normal">
                    <li className="px-3 py-1 hover:bg-gray-100 cursor-pointer">Hamburg Roadshow 2025</li>
                    <li className="px-3 py-1 hover:bg-gray-100 cursor-pointer">London Roadshow 2025</li>
                    <li className="px-3 py-1 hover:bg-gray-100 cursor-pointer">Munich Roadshow 2024</li>
                  </ul>
                </div>
              </div>
            </nav>

            <div className="flex-1" />
          </div>
        </header>

        {/* MAIN LAYOUT  md:overflow-visible*/}
        <div className="flex items-start gap-0" >
          {/* SIDEBAR */}
 
          <aside className=" hidden md:flex
              w-[291px]
              flex-shrink-0
              bg-[#7FB200]
              text-white
              p-6              
              md:sticky md:top-[165px]
              md:h-[calc(100vh-165px)]
              overflow-y-auto
              " style={{  backgroundColor: "#7FB200",zIndex: 50, minHeight: "100vh", fontWeight: 700, fontSize: "15.5px",top:0, }}>
           {/*pl-[15px] pr-4 py-6 text-white text-[15px] font-semibold space-y-4*/}
            {/* MAIN WRAPPER (REQUIRED FOR PROPER LAYOUT) */}
  <div className="flex flex-col h-full w-full">
            <nav className="flex flex-col pl-[15px] pr-4 py-6 space-y-2">
              <a href="#associate" className="hover:opacity-90 text-white text-xl text-left font-bold uppercase tracking-wide py-2">ASSOCIATE</a>
              <a href="#venue" className="hover:opacity-90 text-left text-white text-xl text-left font-bold uppercase tracking-wide py-2">VENUE</a>
              <a href="#database" className="hover:opacity-90 text-left text-white text-xl text-left font-bold uppercase tracking-wide py-2">DATABASE</a>
              <a href="#rsvp" className="hover:opacity-90 text-left text-white text-xl text-left font-bold uppercase tracking-wide py-2">RSVP</a>
              <a href="#av" className="hover:opacity-90 text-left text-white text-xl text-left font-bold uppercase tracking-wide py-2">HOTEL AV</a>
              <a href="#av_supplier" className="hover:opacity-90 text-left ftext-white text-xl text-left  font-bold uppercase tracking-wide py-2">AV SUPPLIER</a>
              <a href="#embassy" className="hover:opacity-90 text-left text-white text-xl text-left font-bold uppercase tracking-wide py-2">EMBASSY / CONSULATE</a>
              <a href="#client" className="hover:opacity-90 text-left text-white text-xl text-left font-bold uppercase tracking-wide py-2">CLIENT</a>
              <a href="#stark" className="hover:opacity-90 text-left text-white text-xl text-left font-bold uppercase tracking-wide py-2">STARK</a>
              <a href="#checklist" className="hover:opacity-90 text-left text-white text-xl text-left font-bold uppercase tracking-wide py-2">CHECKLIST</a>
              <a href="#menu" className="hidden hover:opacity-90 text-left text-white text-xl text-left font-bold uppercase tracking-wide py-2">MENU</a>
              <a href="#remarks" className="hover:opacity-90 text-left text-white text-xl text-left font-bold uppercase tracking-wide py-2">REMARKS</a>
              <a href="#print" className="hover:opacity-90 text-left text-white text-xl text-left font-bold uppercase tracking-wide py-2">PRINT</a>
            </nav>

            <div className="mt-auto w-full pr-4 pl-[15px]">
              <div className="mt-5">
              <div className="text-white opacity-90 font-medium mb-2 text-left uppercase">Completion Progress</div>
              <div className="w-full bg-white/30 rounded h-3 overflow-hidden">
                <div className="h-3 bg-green-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-xs mt-2 mb-2 text-left uppercase">{progress}% Completed</div>
              </div>
            </div>
            <div className="pl-[15px]">
            <button onClick={() => { localStorage.removeItem("authToken"); window.location.href = "/login"; }} className="mt-auto bg-red-600 hover:bg-red-700 py-2 w-full rounded text-white font-semibold">
              Logout
            </button></div>
            </div>
          </aside>
          <div className="flex-1 overflow-x-hidden">
          {/* MAIN CONTENT flex-1 px-0 {/*   Patterned yellow header — responsive width (keeps full page width, but we match height) */}
          <main className="px-0" >
       
          

       
                    <div
  className="w-full border-b border-gray-300"
  style={{
    backgroundImage: `url(${patternBg})`,
    backgroundRepeat: "repeat",
    backgroundSize: "auto",
    minHeight: "241px",
    display: "flex",
    alignItems: "center",
  }}
>
  <div className="flex-1 px-10">
    <h1 className="font-extrabold text-4xl uppercase tracking-tight mb-6 text-left">
      {project?.name || details?.roadshowName || "Untitled Project"}
    </h1>
<div className="pt-20"></div>
    {/* THIS IS THE FIXED ALIGNMENT BLOCK */}
    <div className="flex justify-between text-lg font-bold w-[40%]">
      <div className="uppercase">{details.project_handiled_by || "N/A"}</div>
      <div className="whitespace-nowrap">
        {details.event_date
          ? new Date(details.event_date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }).toUpperCase()
          : ""}
      </div>
    </div>
  </div>

  {/* Right Image */}
  <div style={{ width: 400, padding: "8px 0" }}>
    <div style={{ height: 241, borderLeft: "1px solid #e5e7eb", overflow: "hidden" }}>
      {details.image_file ? (
        <img src={details.image_file} alt="project" className="w-full h-full object-cover" />
      ) : (
        <div className="h-full flex items-center justify-center text-gray-600">No image</div>
      )}
    </div>
  </div>
</div>



            {/* BUDGET BOX - OUTSIDE YELLOW PATTERN */}
            <div className="px-10 py-4 bg-white border-b border-gray-200 flex justify-end items-center gap-4">
              <span className="text-lg font-extrabold tracking-wide">BUDGET</span>
              <input
                id="budget"
                type="text"
                className="border border-gray-300 rounded px-3 py-1 text-right w-[160px]"
                value={details.budget ? Number(details.budget).toLocaleString("en-IN") : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (!isNaN(raw)) setDetails({ ...details, budget: raw });
                }}
                disabled={saving === "roadshow"}
              />
              <button onClick={async () => {
                setSaving("roadshow");
                try {
                  const formData = new FormData();
                  formData.append("roadshow_name", details.roadshowName || "");
                  formData.append("event_date", details.event_date || "");
                  formData.append("budget", details.budget || "");
                  formData.append("project_handiled_by", details.project_handiled_by || "");
                  if (details.image_file instanceof File) formData.append("image_file", details.image_file);
                  await projectSectionsAPI.updateRoadshow(id, formData);
                  showMessage("Budget saved successfully!");
                } catch (e) {
                  console.error(e);
                  alert("Failed to save roadshow info");
                } finally {
                  setSaving("");
                }
              }} className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700">
                {saving === "roadshow" ? "Saving..." : "Save"}
              </button>
            </div>

            {/* Success message */}
            {message && (
              <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
                <div className="px-6 py-3 bg-green-600 text-white rounded shadow-lg">{message}</div>
              </div>
            )}

           

            {/* YELLOW STRIP INFORMATION BAR */}
{/* FLOATING BOTTOM STRIP 
<div
  className="
    fixed 
    bottom-0 
    left-0 
    w-full 
    bg-[#F9E39A] 
    shadow-lg 
    py-2 
    px-6 
    flex 
    flex-wrap 
    items-center 
    gap-x-6 
    text-sm 
    font-semibold 
    z-[999]
  "
>
  <span className="text-black">Countdown</span>
  <span className="text-red-600">{workingDaysLeft}</span>
  <span className="text-black">Working days</span>

  <span className="text-red-600 ml-4">Confirmations</span>

  <span className="text-black">T.O</span>
  <span className="text-red-600">{totals.to}</span>

  <span className="text-black">T.A</span>
  <span className="text-red-600">{totals.ta}</span>

  <span className="text-black">T.C</span>
  <span className="text-red-600">{totals.tc}</span>

  <span className="text-black">Med/Infl</span>
  <span className="text-red-600">{totals.media}</span>

  <span className="text-black font-bold ml-4">Total</span>
  <span className="text-red-600 font-bold">{totals.grandTotal}</span>
</div>*/}


            {/* ===================== */}
            {/* ASSOCIATES SECTION  px-10 pt-8 pb-6  */}
            {/* ===================== */}
            <section id="associate" className="mt-6 bg-white rounded-lg-none shadow-sm border border-gray-200 p-6">
               {/*<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"></div>*/}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-extrabold uppercase text-2xl tracking-wide">ASSOCIATES</h2>
                  <button onClick={async () => {
                    setSaving("associates");
                    try {
                      await projectSectionsAPI.updateAssociates(id, associates);
                      showMessage("Associates saved successfully!");
                    } catch (e) {
                      console.error(e);
                      alert("Failed to save associates");
                    } finally {
                      setSaving("");
                    }
                  }} disabled={saving === "associates"} className={`px-4 py-2 rounded text-white ${saving === "associates" ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}>
                    {saving === "associates" ? "Saving..." : "Save Associates"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_60px] gap-3 mb-3 p-3 bg-gray-100  font-semibold">
                  <div>Associate Name</div>
                  <div>City</div>
                  <div className="text-center">Selected</div>
                  <div></div>
                </div>

                {associates.map((associate, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_60px] gap-3 mb-3 p-3 bg-gray-50 rounded items-center">
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

                    <div className="flex justify-end">
                      {associates.length > 1 && (
                        <button onClick={() => setAssociates(associates.filter((_, i) => i !== index))} className="text-red-600 p-1">
                          {/* trash icon */}
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 3V4H4V6H5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6Z" />
                            <path d="M9 8H11V17H9V8ZM13 8H15V17H13V8Z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="text-center">
                  <button onClick={() => setAssociates([...associates, { name: "", city: "", selected: false }])} className="mt-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 hover:shadow-lg transition duration-200 
             focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">Add Associate</button>
                </div>
              
            </section>

            {/* VENUE Section px-10 pt-6 pb-6 */}
            <section id="venue" className="mt-6 bg-white rounded-lg-none shadow-sm border border-gray-200 p-6">
               {/*<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"></div>*/}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-[28px] font-extrabold">VENUE</h2>
                  <button onClick={async () => {
                    setSaving("venues");
                    try {
                      await projectSectionsAPI.updateVenues(id, venues);
                      showMessage("Venues saved successfully!");
                    } catch (e) {
                      console.error(e);
                      alert("Failed to save venues");
                    } finally {
                      setSaving("");
                    }
                  }} disabled={saving === "venues"} className={`px-4 py-2 rounded text-white ${saving === "venues" ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}>
                    {saving === "venues" ? "Saving..." : "Save Venues"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_2fr_1fr_1fr_1fr_1fr_auto] gap-3 items-center mb-3 p-3 bg-gray-100 rounded font-semibold">
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

                {venues.map((v, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_2fr_1fr_1fr_1fr_1fr_auto] gap-3 items-center mb-3 p-3 bg-gray-50 rounded">
                    <input type="text" value={v.name} onChange={(e) => {
                      const arr = [...venues]; arr[i].name = e.target.value; setVenues(arr);
                    }} className="px-3 py-2 border rounded" placeholder="Venue Name" />

                    <select value={v.currency} onChange={(e) => {
                      const arr = [...venues]; arr[i].currency = e.target.value; setVenues(arr);
                    }} className="px-3 py-2 border rounded bg-white">
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>

                    <input type="text" value={v.rateInput} onChange={(e) => {
                      const arr = [...venues]; arr[i].rateInput = e.target.value; setVenues(arr);
                    }} onBlur={(e) => {
                      const raw = parseNumberInput(e.target.value, v.currency);
                      const fmt = formatNumberOutput(raw, v.currency);
                      const arr = [...venues]; arr[i].rate = raw; arr[i].rateInput = fmt; setVenues(arr);
                    }} className="px-3 py-2 border rounded text-right" placeholder="Rate" />

                    <input type="text" value={v.budgetInput} onChange={(e) => {
                      const arr = [...venues]; arr[i].budgetInput = e.target.value; setVenues(arr);
                    }} onBlur={(e) => {
                      const raw = parseNumberInput(e.target.value, v.currency);
                      const fmt = formatNumberOutput(raw, v.currency);
                      const arr = [...venues]; arr[i].budget = raw; arr[i].budgetInput = fmt; setVenues(arr);
                    }} className="px-3 py-2 border rounded text-right" placeholder="Budget" />

                   {/* RENTAL */}
      <div className="flex justify-center items-center h-full">
        <input
          type="checkbox"
          checked={venues.venue_rental}
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
          checked={venues.av}
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
          checked={venues.food}
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
          checked={venues.bar}
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
          checked={venues.selected}
          onChange={(e) =>
            handleVenueChange(index, "selected", e.target.checked)
          }
          className="w-3.5 h-3.5"
        />
      </div>

                    <div className="flex justify-end">
                      {venues.length > 1 && <button onClick={() => setVenues(venues.filter((_, j) => j !== i))} className="text-red-600">
                         <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9 3V4H4V6H5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6Z" />
            <path d="M9 8H11V17H9V8ZM13 8H15V17H13V8Z" />
          </svg>
                        </button>}
                    </div>
                  </div>
                ))}

                <div className="text-center">
                  <button onClick={() => setVenues([...venues, { name: "", currency: "INR", rate: "", rateInput: "", budget: "", budgetInput: "", selected: false, venue_rental: false, av: false, food: false, bar: false }])} className="mt-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 hover:shadow-lg transition duration-200 
             focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">Add Venue</button>
                </div>
              
            </section>

            {/* DATABASE / TRADE section */}
            <section id="database" className="mt-6 bg-white rounded-lg-none shadow-sm border border-gray-200 p-6">{/*px-10 pt-6 pb-6*/}
              {/*<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"></div>*/}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-extrabold uppercase text-2xl tracking-wide">DATABASE</h2>
                  <button onClick={async () => {
                    setSaving("trade");
                    try {
                      await projectSectionsAPI.updateTradeDatabase(id, tradeDatabase);
                      showMessage("Trade database saved!");
                    } catch (e) {
                      console.error(e); alert("Failed to save");
                    } finally { setSaving(""); }
                  }} disabled={saving === "trade"} className={`px-4 py-2 rounded text-white ${saving === "trade" ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}>
                    {saving === "trade" ? "Saving..." : "Save Database"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[2fr_repeat(5,1fr)_auto] gap-3 items-center mb-3 p-3 bg-gray-100 rounded font-semibold">
                  <div>Category</div>
                  <div className="text-center">Tour Operator</div>
                  <div className="text-center">Travel Agent</div>
                  <div className="text-center">Travel Counsellors</div>
                  <div className="text-center">Media / Influencer</div>
                  <div className="text-center">Total</div>
                  <div></div>
                </div>

                {tradeDatabase.map((trade, index) => {
                  const categoryTotal = (Number(trade.travel_operator) || 0) + (Number(trade.travel_agent) || 0) + (Number(trade.travel_counsellor) || 0) + (Number(trade.media_influencers) || 0);
                  return (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-[2fr_repeat(5,1fr)_auto] gap-3 items-center mb-3 p-3 bg-gray-50 rounded">
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

                     
                      <div className="font-semibold text-center">{categoryTotal}</div>
                      <div className="flex justify-end">
                        {tradeDatabase.length > 1 &&  <button
            onClick={() => handleRemoveTrade(index)}
            className="text-red-600"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 3V4H4V6H5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6Z" />
              <path d="M9 8H11V17H9V8ZM13 8H15V17H13V8Z" />
            </svg>
          </button>}
                      </div>
                    </div>
                  );
                })}

                <div className="grid grid-cols-1 md:grid-cols-[2fr_repeat(5,1fr)_auto] gap-3 items-center mt-5 p-3 bg-gray-100 rounded font-semibold">
                  <div>Total →</div>
                  <div className="text-right">{tradeDatabase.reduce((s, t) => s + (Number(t.travel_operator) || 0), 0)}</div>
                  <div className="text-right">{tradeDatabase.reduce((s, t) => s + (Number(t.travel_agent) || 0), 0)}</div>
                  <div className="text-right">{tradeDatabase.reduce((s, t) => s + (Number(t.travel_counsellor) || 0), 0)}</div>
                  <div className="text-right">{tradeDatabase.reduce((s, t) => s + (Number(t.media_influencers) || 0), 0)}</div>
                  <div className="text-center">{tradeDatabase.reduce((s, t) => s + (Number(t.travel_operator) || 0) + (Number(t.travel_agent) || 0) + (Number(t.travel_counsellor) || 0) + (Number(t.media_influencers) || 0), 0)}</div>
                  <div></div>
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
              
            </section>

            {/* RSVP / Save The Date & Main Invites px-10 pt-6 pb-6*/}
            <section id="rsvp" className="mt-6 bg-white rounded-lg-none shadow-sm border border-gray-200 p-6">
             {/*  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> </div>*/}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-extrabold uppercase text-2xl tracking-wide">RSVP</h2>
                  <div className="flex items-center gap-3">
                    <button onClick={async () => {
                      setSaving("rsvp");
                      try {
                        const formData = new FormData();
                        formData.append("invitation_design_file", saveTheDateImage || "");
                        formData.append("rsvp", JSON.stringify(saveDate));
                        await projectSectionsAPI.updateRSVP(id, formData);
                        showMessage("RSVP saved");
                      } catch (e) { console.error(e); alert("Failed to save"); } finally { setSaving(""); }
                    }} disabled={saving === "rsvp"} className={`px-4 py-2 rounded text-white ${saving === "rsvp" ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}>
                      {saving === "rsvp" ? "Saving..." : "Save The Date"}
                    </button>
                  </div>
                </div>

                <div className="bg-white shadow-sm rounded-lg p-4 border border-blue-50 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-extrabold uppercase text-2xl tracking-wide">RSVP #1— SAVE THE DATE</h3>
                    <div className="text-right">
                      <div className="text-sm font-medium">Countdown</div>
                      <div className="inline-block rounded px-3 py-1 border border-yellow-400 bg-yellow-50 font-bold text-lg">{workingDaysLeft}</div>
                      <div className="text-xs text-gray-500">working days left</div>
                    </div>
                  </div>

                

 <div className="mb-3">
    <label className="block text-sm font-medium">Save The Date Image:</label>
    <input
      type="file"
      onChange={(e) => setSaveTheDateImage(e.target.files[0])}
      className="form-input"
    />

    {invitationFile && (
      <div className="flex items-center gap-3 mt-2">
        <img
          src={
            invitationFile instanceof File
              ? URL.createObjectURL(invitationFile)
              : invitationFile
          }
          alt="Save The Date"
          className="w-24 h-16 object-cover rounded border"
        />
      </div>
    )}
  </div>


                     <div className="grid grid-cols-1 md:grid-cols-[1.5fr_repeat(5,1fr)] gap-4 items-end mb-4 bg-gray-100 p-2 rounded font-semibold text-sm">
      <div>Date</div>
      <div className="text-right">Tour Operator (Nos)</div>
      <div className="text-right">Travel Agent (Nos)</div>
      <div className="text-right">Travel Counsellors (Nos)</div>
      <div className="text-right">Media / Influence (Nos)</div>
      <div className="text-center">Total</div>
    </div>
                  <div className="grid grid-cols-1 md:grid-cols-[1.5fr_repeat(5,1fr)] gap-3 items-end mb-4">
                    <input type="date" value={saveDate.save_the_date || ""} onChange={(e) => setSaveDate({ ...saveDate, save_the_date: e.target.value })} className="form-input" />
                    <input type="number" className="form-input text-right" value={saveDate.save_the_date_to_nos || ""} onChange={(e) => setSaveDate({ ...saveDate, save_the_date_to_nos: e.target.value })} placeholder="Tour Operator" />
                    <input type="number" className="form-input text-right" value={saveDate.save_the_date_ta_nos || ""} onChange={(e) => setSaveDate({ ...saveDate, save_the_date_ta_nos: e.target.value })} placeholder="Travel Agent" />
                    <input type="number" className="form-input text-right" value={saveDate.save_the_date_travel_counsellors_nos || ""} onChange={(e) => setSaveDate({ ...saveDate, save_the_date_travel_counsellors_nos: e.target.value })} placeholder="Travel Counsellors" />
                    <input type="number" className="form-input text-right" value={saveDate.save_the_date_influencers_nos || ""} onChange={(e) => setSaveDate({ ...saveDate, save_the_date_influencers_nos: e.target.value })} placeholder="Media / Influence" />
                    <div className="text-center font-semibold bg-gray-100 rounded-md py-2">
                      {(Number(saveDate.save_the_date_to_nos) || 0) + (Number(saveDate.save_the_date_ta_nos) || 0) + (Number(saveDate.save_the_date_travel_counsellors_nos) || 0) + (Number(saveDate.save_the_date_influencers_nos) || 0)}
                    </div>
                  </div>
                </div>

                {/* Main Invites */}
                <div className="bg-white rounded-lg p-4 border border-purple-100 shadow-sm">
                  <div className="flex justify-between items-center mb-3 overflow-hidden w-full">
                    <h3 className="font-extrabold uppercase text-2xl tracking-wide">RSVP #2 — MAIN INVITE</h3>
                    <button onClick={async () => {
                      setSaving("main invites");
                      try {
                        const formData = new FormData();
                        formData.append("main_invite_design_file", mainInviteImage || "");
                        formData.append("Main_invite", JSON.stringify(mainInvites));
                        await projectSectionsAPI.updateMainInvite(id, formData);
                        showMessage("Main invites saved");
                      } catch (e) { console.error(e); alert("Failed"); } finally { setSaving(""); }
                    }} disabled={saving === "main invites"} className={`px-4 py-2 rounded text-white ${saving === "main invites" ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}>
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

                  <div className="grid grid-cols-1 md:grid-cols-[320px_200px_200px_200px_200px_170px_minmax(100px,1fr)] gap-2 items-center bg-gray-100 p-2 rounded font-semibold">
                    <div>Date</div>
                    <div>Tour Operator (Nos)</div>
                    <div>Travel Agent (Nos)</div>
                    <div>Travel Counsellors (Nos)</div>
                    <div>Media / Influence (Nos)</div>
                    <div>Total</div>
                    <div></div>
                  </div>

                  {mainInvites.map((inv, idx) => {
                    const rowTotal = (Number(inv.main_invite_to_nos) || 0) + (Number(inv.main_invite_ta_nos) || 0) + (Number(inv.main_invite_travel_counsellors_nos) || 0) + (Number(inv.main_invite_influencers_nos) || 0);
                    return (
                      <div key={idx} className="bg-gray-50 p-3 rounded-md mb-3">
                        <h3 className="font-semibold text-left mb-2">RSVP #{idx + 2} – Main Invite</h3>
                        <div className="grid grid-cols-1 md:grid-cols-[320px_200px_200px_200px_200px_170px_minmax(100px,1fr)] gap-2 items-center">
                          <input type="date" className="form-input" value={inv.main_invite_date || ""} onChange={(e) => {
                            const arr = [...mainInvites]; arr[idx].main_invite_date = e.target.value; setMainInvites(arr);
                          }} />
                          <input type="number" className="form-input text-right" value={inv.main_invite_to_nos || ""} onChange={(e) => {
                            const arr = [...mainInvites]; arr[idx].main_invite_to_nos = e.target.value; setMainInvites(arr);
                          }} />
                          <input type="number" className="form-input text-right" value={inv.main_invite_ta_nos || ""} onChange={(e) => {
                            const arr = [...mainInvites]; arr[idx].main_invite_ta_nos = e.target.value; setMainInvites(arr);
                          }} />
                          <input type="number" className="form-input text-right" value={inv.main_invite_travel_counsellors_nos || ""} onChange={(e) => {
                            const arr = [...mainInvites]; arr[idx].main_invite_travel_counsellors_nos = e.target.value; setMainInvites(arr);
                          }} />
                          <input type="number" className="form-input text-right" value={inv.main_invite_influencers_nos || ""} onChange={(e) => {
                            const arr = [...mainInvites]; arr[idx].main_invite_influencers_nos = e.target.value; setMainInvites(arr);
                          }} />
                          <div className="text-center font-semibold bg-gray-100 rounded-md py-2">{rowTotal}</div>
                          <div className="flex justify-end"><button onClick={() => setMainInvites(mainInvites.filter((_, x) => x !== idx))} className="text-red-600">
                             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 3V4H4V6H5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6Z" />
              <path d="M9 8H11V17H9V8ZM13 8H15V17H13V8Z" />
            </svg>
                            </button></div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="grid grid-cols-1 md:grid-cols-[320px_210px_210px_210px_210px_170px] gap-2 items-center mt-4 p-3 bg-gray-100 rounded font-semibold">
                    <div>Total →</div>
                    <div>{mainInvites.reduce((s, t) => s + (Number(t.main_invite_to_nos) || 0), 0)}</div>
                    <div>{mainInvites.reduce((s, t) => s + (Number(t.main_invite_ta_nos) || 0), 0)}</div>
                    <div>{mainInvites.reduce((s, t) => s + (Number(t.main_invite_travel_counsellors_nos) || 0), 0)}</div>
                    <div>{mainInvites.reduce((s, t) => s + (Number(t.main_invite_influencers_nos) || 0), 0)}</div>
                    <div className="text-center">{mainInvites.reduce((s, t) => s + (Number(t.main_invite_to_nos) || 0) + (Number(t.main_invite_ta_nos) || 0) + (Number(t.main_invite_travel_counsellors_nos) || 0) + (Number(t.main_invite_influencers_nos) || 0), 0)}</div>
                  </div>

                  <div className="text-center mt-3">
                    <button onClick={() => setMainInvites([...mainInvites, { main_invite_date: "", main_invite_to_nos: 0, main_invite_ta_nos: 0, main_invite_travel_counsellors_nos: 0, main_invite_influencers_nos: 0 }])} className="mt-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 hover:shadow-lg transition duration-200 
             focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">Add Main Invite</button>
                  </div>
                </div>
             
            </section>
            {/* AV Section px-10 pt-6 pb-6*/}
            <section id="av" className="mt-6 bg-white rounded-lg-none shadow-sm border border-gray-200 p-6">
             {/*  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> </div>*/}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-extrabold uppercase text-2xl tracking-wide">HOTEL AV SETUP</h2>
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
             
            </section>

            {/* AV SUPPLIER (hotels) px-10 pt-6 pb-6*/}
            <section id="av_supplier" className="mt-6 bg-white rounded-lg-none shadow-sm border border-gray-200 p-6">
              {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> </div>*/}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-extrabold uppercase text-2xl tracking-wide">AV SUPPLIER</h2>
                  <button onClick={async () => {
                    setSaving("hotels");
                    try {
                      await projectSectionsAPI.updateHotels(id, hotels);
                      showMessage("AV supplier saved");
                    } catch (e) { console.error(e); alert("Failed"); } finally { setSaving(""); }
                  }} disabled={saving === "hotels"} className={`px-4 py-2 rounded text-white ${saving === "hotels" ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}>{saving === "hotels" ? "Saving..." : "Save Av Supplier"}</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-3 items-center mb-3 p-3 bg-gray-100 rounded font-semibold">
                  <div>Supplier</div>
                  <div>Item</div>
                  <div>Currency</div>
                  <div className='text-center'>Amount</div>
                  <div className="text-center">Selected</div>
                  <div></div>
                </div>

                {hotels.map((h, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-3 items-center mb-3 p-3 bg-gray-50 rounded">
                    <input value={h.sponsor || ""} onChange={(e) => { const arr = [...hotels]; arr[i].sponsor = e.target.value; setHotels(arr); }} className="px-3 py-2 border rounded" placeholder="Supplier Name" />
                    <input value={h.item || ""} onChange={(e) => { const arr = [...hotels]; arr[i].item = e.target.value; setHotels(arr); }} className="px-3 py-2 border rounded" placeholder="Item" />
                    <select value={h.currency || "INR"} onChange={(e) => {
                      const arr = [...hotels]; arr[i].currency = e.target.value; setHotels(arr);
                    }} className="px-3 py-2 border rounded bg-white">
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                    <input value={h.amount || ""} onChange={(e) => { const arr = [...hotels]; arr[i].amount = e.target.value; setHotels(arr); }} className="px-3 py-2 border rounded text-right" placeholder="Amount" />
                    <div className="flex justify-center"><input type="checkbox" checked={h.selected || false} onChange={(e) => { const arr = [...hotels]; arr[i].selected = e.target.checked; setHotels(arr); }} className="w-3.5 h-3.5 accent-green-600" /></div>
                    <div>{hotels.length > 1 && <button onClick={() => setHotels(hotels.filter((_, idx) => idx !== i))} className="text-red-600"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 3V4H4V6H5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6Z" />
              <path d="M9 8H11V17H9V8ZM13 8H15V17H13V8Z" />
            </svg></button>}</div>
                  </div>
                ))}

                <div className="text-center">
                  <button onClick={() => setHotels([...hotels, { sponsor: "", item: "", currency: "INR", amount: "" }])} className="mt-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 hover:shadow-lg transition duration-200 
             focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">Add AV Supplier</button>
                </div>
             
            </section>

           

            {/* ========================= */}
{/* EMBASSY / CONSULATE       */}
{/* ========================= */}
<section id="embassy" className="mt-6 bg-white rounded-lg-none shadow-sm border border-gray-200 p-6">

  <div className="flex justify-between items-center mb-4">
     <h2 className="font-extrabold uppercase text-2xl tracking-wide">EMBASSY / CONSULATE</h2>

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
</section>

            {/* CLIENT, STARK, CHECKLIST, MENU, REMARKS sections (kept consistent & safe) */}
            <section id="client" className="mt-6 bg-white rounded-lg-none shadow-sm border border-gray-200 p-6">
            {/*   <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> </div>*/}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-[28px] font-extrabold">CLIENT</h2>
                  <button onClick={async () => {
                    setSaving("clients");
                    try { await projectSectionsAPI.updateClients(id, clients); showMessage("Clients saved"); } catch (e) { console.error(e); alert("Failed"); } finally { setSaving(""); }
                  }} className={`px-4 py-2 rounded text-white ${saving === "clients" ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}>Save clients</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 items-center mb-3 p-3 bg-gray-100 rounded font-semibold">
                  <div>Name</div><div>Designation</div><div>Contact</div><div>Hotel</div><div></div>
                </div>

                {Array.isArray(clients) && clients.map((c, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 items-center mb-3 p-3 bg-gray-50 rounded">
                    <input className="px-2 py-2 border rounded" value={c.name || ""} onChange={(e) => { const arr = [...clients]; arr[i].name = e.target.value; setClients(arr); }} />
                    <input className="px-2 py-2 border rounded" value={c.designation || ""} onChange={(e) => { const arr = [...clients]; arr[i].designation = e.target.value; setClients(arr); }} />
                    <input className="px-2 py-2 border rounded" value={c.contact || ""} onChange={(e) => { const arr = [...clients]; arr[i].contact = e.target.value; setClients(arr); }} />
                    <input className="px-2 py-2 border rounded" value={c.hotel || ""} onChange={(e) => { const arr = [...clients]; arr[i].hotel = e.target.value; setClients(arr); }} />
                    <div>{clients.length > 1 && <button onClick={() => setClients(clients.filter((_, idx) => idx !== i))} className="text-red-600"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 3V4H4V6H5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6Z" />
              <path d="M9 8H11V17H9V8ZM13 8H15V17H13V8Z" />
            </svg></button>}</div>
                  </div>
                ))}

                <div className="text-center">
                  <button onClick={() => setClients([...clients, { name: "", designation: "", contact: "", hotel: "" }])} className="mt-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 hover:shadow-lg transition duration-200 
             focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">Add Client</button>
                </div>
             
            </section>

            {/* STARK px-10 pt-6 pb-6*/}
            <section id="stark" className="mt-6 bg-white rounded-lg-none shadow-sm border border-gray-200 p-6">
             {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"></div>*/}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-extrabold uppercase text-2xl tracking-wide">STARK</h2>
                  <button onClick={async () => {
                    setSaving("starks");
                    try { await projectSectionsAPI.updateStarks(id, starks); showMessage("Starks saved"); } catch (e) { console.error(e); alert("Failed"); } finally { setSaving(""); }
                  }} className={`px-4 py-2 rounded text-white ${saving === "starks" ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}>Save Starks</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-3 items-center mb-3 p-3 bg-gray-100 rounded font-semibold">
                  <div>Name</div><div>Hotel</div><div></div>
                </div>

                {Array.isArray(starks) && starks.map((s, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-3 items-center mb-3 p-3 bg-gray-50 rounded">
                    <input className="px-2 py-2 border rounded" value={s.name || ""} onChange={(e) => { const arr = [...starks]; arr[i].name = e.target.value; setStarks(arr); }} />
                    <input className="px-2 py-2 border rounded" value={s.hotel || ""} onChange={(e) => { const arr = [...starks]; arr[i].hotel = e.target.value; setStarks(arr); }} />
                    <div>{starks.length > 1 && <button onClick={() => setStarks(starks.filter((_, idx) => idx !== i))} className="text-red-600"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 3V4H4V6H5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6Z" />
              <path d="M9 8H11V17H9V8ZM13 8H15V17H13V8Z" />
            </svg></button>}</div>
                  </div>
                ))}

                 <div className="text-center">
                  <button onClick={() => setStarks([...starks, { name: "", hotel: "" }])}  className="mt-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 hover:shadow-lg transition duration-200 
             focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">Add Stark</button>
                </div>

                
              
            </section>

            {/* CHECKLIST  section-container mt-8
           */}

            <section id="checklist" className="mt-6 bg-white rounded-lg-none shadow-sm border border-gray-200 p-6">

  <div className="flex justify-between items-center mb-4 ">
    <h2 className="font-extrabold uppercase text-2xl tracking-wide">CHECKLIST</h2>

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
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <input type="text" placeholder="Checklist Item Name" value={item.name} onChange={(e) => handleChecklistChange(index, 'name', e.target.value)} className="flex-grow p-2 border border-gray-300 rounded-md mr-3" />
                  <div className="flex items-center gap-4">
                    <label htmlFor={`checklist-${index}`} className="text-gray-700 font-medium">Completed</label>
                    <input id={`checklist-${index}`} type="checkbox" checked={item.selected} onChange={(e) => handleChecklistChange(index, 'selected', e.target.checked)} className="w-3.5 h-3.5 accent-green-600" />
                    {checklists.length > defaultChecklists.length && <button type="button" onClick={() => handleRemovechecklist(index)} className="text-red-600">Remove</button>}
                  </div>
                </div>
              ))}
   
  </div>

  <button
    onClick={handleAddChecklist}
    className="mt-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 hover:shadow-lg transition duration-200 
             focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
  >
    Add Checklist
  </button>
</section>

            {/* MENU UPLOAD px-10 pt-6 pb-6*/}
            <section id="menu" className="hidden mt-6 bg-white rounded-lg-none shadow-sm border border-gray-200 p-6">
              {/*<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> </div>*/}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-extrabold uppercase text-2xl tracking-wide">MENU</h2>
                  <button onClick={async () => {
                    if (!menuFile) { alert("Select file"); return; }
                    setSaving("menu");
                    try {
                      const formData = new FormData(); formData.append("menu", menuFile);
                      await projectSectionsAPI.uploadMenu(id, formData);
                      showMessage("Menu uploaded");
                      setMenuFile(null);
                    } catch (e) { console.error(e); alert("Failed"); } finally { setSaving(""); }
                  }} className={`px-4 py-2 rounded text-white ${saving === "menu" ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}>
                    {saving === "menu" ? "Uploading..." : "Upload Menu"}
                  </button>
                </div>

                <div className="p-6 bg-white rounded">
                  <label className="block font-medium text-gray-700">Upload Menu File</label>
                  <input type="file" accept=".jpg,.jpeg,.png" onChange={(e) => setMenuFile(e.target.files ? e.target.files[0] : null)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  <small className="text-gray-500 block mt-2">Upload file size up to <span className="font-semibold">1MB</span></small>
                </div>
             
            </section>

            {/* REMARKS px-10 pt-6 pb-6 mt-6*/}
            <section id="remarks" className="bg-white rounded-lg-none shadow-sm border border-gray-200 p-6">
              {/*<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> </div>*/}
                <h2 className="font-extrabold uppercase text-2xl tracking-wide text-left">REMARKS</h2>
                {remarks.length ? remarks.map(r => (
                  <div key={r.id} className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-md p-3 mb-2">
                    <div><strong className="font-medium">{r.username || "Viewer"}:</strong> <span className="text-gray-700">{r.remarktext}</span></div>
                    <button onClick={async () => {
                      try { await projectAPI.resolveRemark(r.id); const res = await projectAPI.getRemarks(id); setRemarks(res.data || []); } catch (e) { alert("Failed"); }
                    }} className={`px-3 py-1.5 rounded-md text-sm font-medium ${r.isapproved ? "bg-green-600 text-white" : "bg-yellow-400 text-black"}`}>{r.isapproved ? "Resolved (Click to Pending)" : "Pending (Click to Resolve)"}</button>
                  </div>
                )) : <p className="text-gray-500">No remarks yet.</p>}
             
            </section>

            {/* Print */}
            <div id="print" className="flex justify-center mt-8 mb-10 px-10">
              <button onClick={() => window.print()} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-lg hover:bg-blue-700 transition duration-200 print:hidden">Print Project Details</button>
            </div>

            {/* ==== FLOATING BOTTOM STRIP ====style={{ marginLeft: "300px", marginRight:"5px" }} */}
<div className="fixed bottom-0  z-[9999] bg-[#F7E79E] border-t border-yellow-600 shadow-md left-[315px] 
    right-[22px]"  >
  <div className="flex items-center justify-start gap-10 px-5 py-2 text-sm font-semibold">

    <span className="text-black w-[10%]">Countdown</span>
    <span className="text-red-600 w-[5%]">{workingDaysLeft}</span>

    <span className="text-black w-[15%]">Working days</span>

    <span className="text-red-600 w-[10%]">Confirmations</span>

    <span className="text-black w-[10%]">T.O</span>
    <span className="text-red-600 w-[10%]">{totals.to}</span>

    <span className="text-black w-[10%]">T.A</span>
    <span className="text-red-600 w-[10%]">{totals.ta}</span>

    <span className="text-black w-[10%]">T.C</span>
    <span className="text-red-600 w-[10%]">{totals.tc}</span>

    <span className="text-black w-[10%]">Med/Infl</span>
    <span className="text-red-600 w-[10%]">{totals.media}</span>

    <span className="text-black font-bold w-[10%]">Total</span>
    <span className="text-red-600 font-bold w-[10%]">{totals.grandTotal}</span>

  </div>
</div>

          </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
