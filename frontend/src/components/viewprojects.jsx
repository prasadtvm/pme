// frontend/src/components/ViewProject.js
import React, { useState, useEffect } from 'react';
import { projectAPI } from '../services/api.jsx';
import { useNavigate } from 'react-router-dom';
import '../styles/tailwind.css';
import logo from "../assets/images/company_logo.jpg";

const ViewProject = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [remark, setRemark] = useState('');
  const [remarks, setRemarks] = useState([]);
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
const [selectedYear, setSelectedYear] = useState("all");
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = "/login";
  };

  const handleSaveRemark = async () => {
    if (!remark.trim()) {
      alert('Please enter a remark before saving.');
      return;
    }
    try {
      await projectAPI.addRemark({
        project_id: selectedProject.id,
        remarktext: remark,
        userid: user.id,
      });

      setRemark('');
      const res = await projectAPI.getRemarks(selectedProject.id);
      setRemarks(res.data || []);
    } catch (err) {
      console.error('Failed to save remark:', err);
      alert('Error saving remark.');
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectAPI.getAll();
        setProjects(res.data || []);
      } catch (err) {
        console.error('Failed to load projects:', err);
        alert('Error loading projects.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleSelectProject = async (projectId) => {
    try {
      setLoading(true);
      const [projectRes, detailsRes, remarksRes] = await Promise.all([
        projectAPI.getById(projectId),
        projectAPI.getDetails(projectId),
        projectAPI.getRemarks(projectId),
      ]);

      setSelectedProject(projectRes.data);
      setDetails(detailsRes.data || {});
     // console.log('eeerfe',JSON.stringify(details.av_setup));
      //console.log('eeerfe',JSON.stringify(details.hotels));
      console.log('clients',JSON.stringify(details.clients));
      setRemarks(remarksRes.data || []);
      setRemark('');
    } catch (err) {
      console.error('Error loading details:', err);
      alert('Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-container">Loading...</div>;

  const hasUnapprovedRemark = remarks.some(r => r.isapproved === false);

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="flex justify-start mt-2 mb-0 pb-2 pl-5 pt-2">
      <img src={logo} alt="Company Logo" className="h-12" />
      </div>
      {/* HEADER */}
      <header className="w-full px-10 py-6 flex justify-between items-center border-b bg-white">
        <div>
          <h2 className="text-2xl font-bold">Welcome, {user.name || 'Viewer'}</h2>
          <p className="text-gray-600">View and review project details</p>
        </div>
<button
          onClick={handleLogout}
          className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
       
      </header>

      {/* PROJECT LIST */}
      <section className="w-full px-10 mt-6">
        {/* SEARCH + YEAR FILTER */}
<div className="flex gap-4 mb-4">

  {/* Search Box */}
  <input
    type="text"
    placeholder="Search project..."
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
    className="border px-3 py-2 rounded w-64"
  />

  {/* Year Dropdown */}
  <select
    value={selectedYear}
    onChange={(e) => setSelectedYear(e.target.value)}
    className="border px-3 py-2 rounded w-40"
  >
    <option value="all">All Years</option>
    <option value="2023">2023</option>
    <option value="2024">2024</option>
    <option value="2025">2025</option>
    <option value="2026">2026</option>
  </select>

</div>

        <div className="flex flex-wrap gap-3">
          {projects.filter((p) => {
    // TEXT SEARCH FILTER
    if (searchText && !p.name.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }

    // YEAR FILTER
    if (selectedYear !== "all") {
      const projectYear = new Date(p.event_date).getFullYear().toString();
      if (projectYear !== selectedYear) return false;
    }

    return true;
  }) 
          .map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectProject(p.id)}
              className={`px-4 py-2 rounded border ${
                selectedProject?.id === p.id ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              {p.name} 
            </button>
          ))}
        </div>
      </section>

      {/* PROJECT DETAILS */}
      {selectedProject && (
        <div className="w-full mt-8 flex px-10 gap-6">

          {/* LEFT MENU */}
          <div className="w-48 bg-[#70AD47] text-white p-5 rounded-lg flex-shrink-0 h-screen sticky top-0">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-white pt-5 pl-1 pr-5">
              
              <a className='hover:font-bold hover:text-white text-left pt-5 pl-5' href="#associate">ASSOCIATES</a>
              <a className='hover:font-bold hover:text-white text-left pt-5 pl-5' href="#venue">VENUES</a>                    
              <a className='hover:font-bold hover:text-white text-left pt-5 pl-5' href="#database">DATABASE</a>
               <a className='hover:font-bold hover:text-white text-left pt-5 pl-5' href="#rsvp">RSVP# SAVE THE DATE</a>   
               <a className='hover:font-bold hover:text-white text-left pt-5 pl-5' href="#rsvp">HOTEL AV SETUP</a>              
              <a className='hover:font-bold hover:text-white text-left pt-5 pl-5' href="#hotel">AV SUPPLIER</a>
              <a className='hover:font-bold hover:text-white text-left pt-5 pl-5' href="#embassy">EMBASSY/CONSULATE</a>
              <a className='hover:font-bold hover:text-white text-left pt-5 pl-5' href="#client">CLIENT</a>
              <a className='hover:font-bold hover:text-white text-left pt-5 pl-5' href="#stark">STARK</a>
              <a className='hover:font-bold hover:text-white text-left pt-5 pl-5' href="#checklist">CHECKLIST</a>
              <a className='hover:font-bold hover:text-white text-left pt-5 pl-5' href="#menu">MENU</a>
              <a className='hover:font-bold hover:text-white text-left pt-5 pl-5' href="#remark">REMARK</a>
               
            </nav>
          </div>

          {/* MAIN CONTENT */}
          <div className="w-full space-y-10">

            {/* TITLE SECTION */}
            <div id="information">
              <h2 className="text-2xl font-bold uppercase text-left">{selectedProject.name}</h2>
              <p className="text-gray-700 mt-1 font-bold">
                {selectedProject.event_date
                  ? new Date(selectedProject.event_date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }).toUpperCase()
                  : ""}
              </p>

              <div className="flex justify-between text-lg mt-4">
                <span className='font-bold'>{details.project_handiled_by}</span>
                <span className='font-bold'>₹{details.budget}</span>
              </div>
            </div>

            {/* ASSOCIATES */}
            <div id="associate">
              <h3 className="text-lg font-semibold mb-3">ASSOCIATES</h3>

              <div className="grid grid-cols-[2fr_1fr_1fr] bg-gray-200 p-3 rounded font-semibold">
                <div>Associate Name</div>
                <div>City</div>
                <div className="text-center">Selected</div>
              </div>
                     {details.associates?.length ? (
            <div className="grid gap-2">
              {details.associates?.map((a, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[2fr_1fr_1fr] bg-gray-50 p-3 border-b"
                >
                  <div>{a.name}</div>
                  <div>{a.city}</div>
                  <div className="text-center">
                      {a.selected ? "✔️" : "✖️"}                  
                  </div>
                </div>
              ))}

              </div>
          ) : (
            <p className="text-gray-500">No associate data</p>
          )}
            </div>


            {/* VENUES — FULL WIDTH FIXED */}
            <div id="venue">
              <h3 className="text-lg font-semibold mb-3">VENUES</h3>

              <div className="w-full border rounded-lg">
                <div className="grid grid-cols-[2fr_repeat(8,1fr)] gap-3 bg-gray-200 p-3 font-semibold">
                  <div>Venue Name</div>
                  <div>Currency</div>
                  <div>Rate</div>
                  <div>Budget</div>
                  <div>Venue Rental</div>
                  <div>AV</div>
                  <div>Food</div>
                  <div>Bar</div>
                  <div>Selected</div>
                </div>

                {details.venues?.map((v, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[2fr_repeat(8,1fr)] gap-3 p-3 border-b"
                  >
                    <div>{v.name}</div>
                    <div>{v.currency}</div>
                    <div>{v.rate}</div>
                    <div>{v.budget}</div>

                    {/* BOOLEAN ICONS */}
                    <div className="text-center">
                      {v.venue_rental ? "✔️" : "✖️"}
                    </div>
                    <div className="text-center">
                      {v.av ? "✔️" : "✖️"}
                    </div>
                    <div className="text-center">
                      {v.food ? "✔️" : "✖️"}
                    </div>
                    <div className="text-center">
                      {v.bar ? "✔️" : "✖️"}
                    </div>
                     <div className="text-center">
                      {v.selected ? "✔️" : "✖️"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Other sections unchanged — will continue same widening logic */}

            {/* DATABASE */}
            <div id="database">
              <h3 className="text-lg font-semibold mb-3">DATABASE</h3>

              <div className="grid grid-cols-[2fr_repeat(5,1fr)] bg-gray-200 p-3 font-semibold">
                <div>Trade</div>
                <div className="text-center">Tour Operator</div>
                <div className="text-center">Travel Agent</div>
                <div className="text-center">Travel Counsellor</div>
                <div className="text-center">Media / Influence</div>
                 <div className="text-center">Total</div>
              </div>

              {details.trade_database?.map((t, i) => {
                  const total =
        (Number(t.travel_operator) || 0) +
        (Number(t.travel_agent) || 0) +
        (Number(t.travel_counsellor) || 0) +
        (Number(t.media_influencers) || 0);
         return (
                <div
                  key={i}
                  className="grid grid-cols-[2fr_repeat(5,1fr)] p-3 border-b bg-gray-50"
                >
                  <div>{t.trade_name}</div>
                  <div className="text-center">{t.travel_operator}</div>
                  <div className="text-center">{t.travel_agent}</div>
                  <div className="text-center">{t.travel_counsellor}</div>
                  <div className="text-center">{t.media_influencers}</div>
                 <div className="text-center font-semibold">{total}</div>
                </div>
         );
              })}


              
{/* 🌟 GRAND TOTAL ROW */}
    {(() => {
      const totalTO = details.trade_database.reduce((sum, m) => sum + (Number(m.travel_operator) || 0), 0);
      const totalTA = details.trade_database.reduce((sum, m) => sum + (Number(m.travel_agent) || 0), 0);
      const totalTC = details.trade_database.reduce((sum, m) => sum + (Number(m.travel_counsellor) || 0), 0);
      const totalMedia = details.trade_database.reduce((sum, m) => sum + (Number(m.media_influencers) || 0), 0);

      const grandTotal = totalTO + totalTA + totalTC + totalMedia;

      return (
        <div className="grid grid-cols-[2fr_repeat(5,1fr)] p-3 mt-2 bg-green-100 font-semibold rounded">
          <div className="text-center">TOTAL</div>
          <div className="text-center">{totalTO}</div>
          <div className="text-center">{totalTA}</div>
          <div className="text-center">{totalTC}</div>
          <div className="text-center">{totalMedia}</div>
          <div className="text-center text-green-700">{grandTotal}</div>
        </div>
      );
    })()}
            </div>

           {/* =======================  RSVP SECTION  ======================= */}
{details.rsvp?.length > 0 && (
  <div id="rsvp">
    <h3 className="text-lg font-semibold mb-3">RSVP #1 SAVE THE DATE</h3>

    {/* Header */}
    <div className="grid grid-cols-[1.5fr_repeat(5,1fr)] bg-gray-200 p-3 font-semibold rounded">
      <div>Date</div>
      <div className="text-center">Tour Operator</div>
      <div className="text-center">Travel Agent</div>
      <div className="text-center">Travel Counsellor</div>
      <div className="text-center">Media / Influence</div>
       <div className="text-center">Total</div>
    </div>

    {/* Rows */}
    {details.rsvp.map((r, i) => {

      const total =
        (Number(r.save_the_date_to_nos) || 0) +
        (Number(r.save_the_date_ta_nos) || 0) +
        (Number(r.save_the_date_travel_counsellors_nos) || 0) +
        (Number(r.save_the_date_influencers_nos) || 0);
         return (
      <div
        key={i}
        className="grid grid-cols-[1.5fr_repeat(5,1fr)] p-3 border-b bg-gray-50"
      >
        <div>{r.save_the_date || "-"}</div>
        <div className="text-center">{r.save_the_date_to_nos || "0"}</div>
        <div className="text-center">{r.save_the_date_ta_nos || "0"}</div>
        <div className="text-center">{r.save_the_date_travel_counsellors_nos || "0"}</div>
        <div className="text-center">{r.save_the_date_influencers_nos || "0"}</div>
        <div className="text-center font-semibold">{total}</div>
      </div>
         );
})}
  </div>
)}


{/* =======================  MAIN INVITE  ======================= */}
{details.mainInvites?.length > 0 && (
  <div id="maininvite">
    <h3 className="text-lg font-semibold mb-3">RSVP #2 MAIN INVITE</h3>

    <div className="grid grid-cols-[2fr_repeat(5,1fr)] bg-gray-200 p-3 font-semibold rounded">
      <div>Date</div>
     <div className="text-center">Tour Operator</div>
      <div className="text-center">Travel Agent</div>
      <div className="text-center">Travel Counsellor</div>
      <div className="text-center">Media / Influence</div>
      <div className="text-center">Total</div>
    </div>

    {details.mainInvites.map((m, i) => {
       const total =
        (Number(m.main_invite_to_nos) || 0) +
        (Number(m.main_invite_ta_nos) || 0) +
        (Number(m.main_invite_travel_counsellors_nos) || 0) +
        (Number(m.main_invite_influencers_nos) || 0);
         return (
      <div
        key={i}
        className="grid grid-cols-[2fr_repeat(5,1fr)] p-3 border-b bg-gray-50"
      >
        <div><span className='font-semibold'>RSVP #{i + 2} – Main Invite </span> {m.main_invite_date || "-"}</div>
        <div className="text-center">{m.main_invite_to_nos || "0"}</div>
        <div className="text-center">{m.main_invite_ta_nos || "0"}</div>
        <div className="text-center">{m.main_invite_travel_counsellors_nos || "0"}</div>
         <div className="text-center">{m.main_invite_influencers_nos || "0"}</div>
          <div className="text-center font-semibold">{total}</div>
      </div>
         );
})}

{/* 🌟 GRAND TOTAL ROW */}
    {(() => {
      const totalTO = details.mainInvites.reduce((sum, m) => sum + (Number(m.main_invite_to_nos) || 0), 0);
      const totalTA = details.mainInvites.reduce((sum, m) => sum + (Number(m.main_invite_ta_nos) || 0), 0);
      const totalTC = details.mainInvites.reduce((sum, m) => sum + (Number(m.main_invite_travel_counsellors_nos) || 0), 0);
      const totalMedia = details.mainInvites.reduce((sum, m) => sum + (Number(m.main_invite_influencers_nos) || 0), 0);

      const grandTotal = totalTO + totalTA + totalTC + totalMedia;

      return (
        <div className="grid grid-cols-[2fr_repeat(5,1fr)] p-3 mt-2 bg-green-100 font-semibold rounded">
          <div className="text-center">TOTAL</div>
          <div className="text-center">{totalTO}</div>
          <div className="text-center">{totalTA}</div>
          <div className="text-center">{totalTC}</div>
          <div className="text-center">{totalMedia}</div>
          <div className="text-center text-green-700">{grandTotal}</div>
        </div>
      );
    })()}
  </div>
)}


{/* =======================  HOTEL AV SETUP  ======================= */}
{details.av_setup && (
  <div id="av">
    <h3 className="text-lg font-semibold mb-3">HOTEL AV SETUP</h3>

    <div className="grid grid-cols-[1.5fr_repeat(5,1fr)] bg-gray-200 p-3 font-semibold rounded">
       <div>Backdrop</div>
    <div className="text-center">Screen</div>
    <div className="text-center">Mic</div>
    <div className="text-center">Type</div>
    <div className="text-center">Projector </div>
    <div className="text-center">Podium</div>
    </div>

    

      <div       
        className="grid grid-cols-[1.5fr_repeat(5,1fr)] p-3 border-b bg-gray-50"
      >
        <div> {details.av_setup.backdrop}</div>
                <div> {details.av_setup.screen}</div>
                <div> {details.av_setup.mic}</div>
                <div> {details.av_setup.type}</div>
                <div> {details.av_setup?.projector?.selected ? (
                    <span className="text-green-600 font-bold text-lg">✔️</span>
                  ) : (
                    <span className="text-red-600 font-bold text-lg">✖️</span>
                  )}     
                  </div>
                   <div> {details.av_setup.podium?.selected ? (
                    <span className="text-green-600 font-bold text-lg">✔️</span>
                  ) : (
                    <span className="text-red-600 font-bold text-lg">✖️</span>
                  )}     
                  </div>
      </div>
     
    
    
  
  </div>
)}

{/* =======================  AV SUPPLIER  ======================= */}
<div id="avsupplier">
  <h3 className="text-lg font-semibold mb-3">AV SUPPLIER</h3>

  {/* If data exists → show table */}
  {details.hotels?.length > 0 ? (
    <>
      {/* Header Row */}
      <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-3 p-3 bg-gray-200 rounded-lg font-semibold text-slate-900">
        <div>Supplier</div>
        <div>Item</div>
        <div>Currency</div>
        <div className="text-right">Amount</div>
        <div className="text-center">Selected</div>
      </div>

      {/* Data Rows */}
      {details.hotels.map((h, i) => (
        <div
          key={i}
          className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-3 p-3 bg-gray-50 border-b border-gray-200"
        >
          <div>{h.sponsor}</div>
          <div>{h.item}</div>
          <div>{h.currency}</div>
          <div className="text-right">{h.amount}</div>

          <div className="text-center">
            {h.selected ? (
              <span className="text-green-600 font-bold text-lg">✔️</span>
            ) : (
              <span className="text-red-600 font-bold text-lg">✖️</span>
            )}
          </div>
        </div>
      ))}
    </>
  ) : (
    /* If array empty → show message */
    <p className="text-gray-500">No AV Supplier data</p>
  )}
</div>
          {/* Embassy Section */}
          <div id="embassy" >
            <h3 className="text-lg font-semibold  mb-3">EMBASSY/CONSULATE</h3>

            {details.embassy ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                <div><p className='font-semibold'>Cheif Guest:</p> {details.embassy.cheif_guest}</div>
                <div><p className='font-semibold'>Designation:</p> {details.embassy.cheif_guest_designation}</div>
                <div><p className='font-semibold'>Contact:</p> {details.embassy.cheif_guest_phone}</div>
                <div><p className='font-semibold'>Accommodation Contact:</p> {details.embassy.accommodation_contact}</div>
                <div><p className='font-semibold'>Designation:</p> {details.embassy.accommodation_address}</div>
                <div><p className='font-semibold'>Contact:</p> {details.embassy.accommodation_phone}</div>
              </div>
            ) : (
              <p className="text-gray-500">No Embassy/consulate data</p>
            )}
          </div>
{/* ======================= CLIENT SECTION ======================= */}
<div id="client" className="mb-6">
  <h3 className="text-lg font-semibold text-slate-800 mb-3">CLIENT</h3>

  {details.clients?.length > 0 ? (
    <>
      {/* Header Row */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-3 p-3 bg-gray-200 rounded-lg font-semibold text-slate-900">
        <div>Name</div>
        <div>Designation</div>
        <div>Contact</div>
        <div>Hotel</div>
      </div>

      {/* Rows */}
      {details.clients.map((c, i) => (
        <div
          key={i}
          className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-3 p-3 bg-gray-50 border-b border-gray-200"
        >
          <div>{c.name}</div>
          <div>{c.designation}</div>
          <div>{c.contact}</div>
          <div>{c.hotel}</div>
        </div>
      ))}
    </>
  ) : (
    <p className="text-gray-500">No client data</p>
  )}
</div>

{/* ======================= STARK SECTION ======================= */}
<div id="stark" className="mb-6">
  <h3 className="text-lg font-semibold text-slate-800 mb-3">STARK</h3>

  {details.starks?.length > 0 ? (
    <>
      {/* Header Row */}
      <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-3 p-3 bg-gray-200 rounded-lg font-semibold text-slate-900">
        <div>Name</div>
        <div>Hotel</div>
        <div></div> {/* Optional column for spacing */}
      </div>

      {/* Data Rows */}
      {details.starks.map((s, i) => (
        <div
          key={i}
          className="grid grid-cols-[1.5fr_1fr_1fr] gap-3 p-3 bg-gray-50 border-b border-gray-200 rounded"
        >
          <div>{s.name}</div>
          <div>{s.hotel}</div>
          <div></div>
        </div>
      ))}
    </>
  ) : (
    <p className="text-gray-500">No Stark data</p>
  )}
</div>

     {/* checklist Section */}
        <div id="checklist" className="mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">CHECKLIST</h3>

            {/* Header Row */}
        <div className="grid grid-cols-[1.5fr_repeat(2,1fr)] gap-4 items-center mb-3 p-3 bg-gray-200 rounded-lg font-semibold text-slate-900">
            <div>Name</div>
            <div>Compleated</div>           
        </div>

          {details.checklist?.length ? (
            <div className="grid gap-2">
              {details.checklist.map((a, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1.5fr_repeat(2,1fr)] p-3 bg-gray-50 border border-gray-200 rounded text-gray-700"
                >
                   <span>{a.name} </span>
                   
                    <span>{a.selected ? (
                     <span className="text-green-600 font-bold text-lg">✔️</span>
                  ) : (
                    <span className="text-red-600 font-bold text-lg">✖️</span>
                  )}
                  </span>               
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No checklist data</p>
          )}
        </div>
  {/* Menu */}
          <div id='menu' className="mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Menu File</h3>
          {details.menuFile ? (
            <a href={details.menuFile.file_path} target="_blank" rel="noreferrer">
              {details.menuFile.filename}
            </a>
          ) : <p className="text-gray-500">No menu file uploaded</p>}
          </div>
          <hr />    
            {/* REMARKS */}

 {/* Show Remarks List */}
   <div id='remark' className="mb-6">
          {remarks.length > 0 ? (
            <div  className="mb-4">
              {remarks.map((r) => (
                <div
                  key={r.id}
                  className="bg-gray-50 p-3 mb-2 rounded border border-gray-300 relative"
                >
                  <strong>{r.username || "Viewer"}:</strong> {r.remarktext}
                  <span
                    className={`absolute right-3 top-3 text-sm font-medium ${
                      r.isapproved ? "text-green-600" : "text-orange-500"
                    }`}
                  >
                    {r.isapproved ? "Resolved" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No remarks yet.</p>
          )}
          </div>
{/* Giving Remarks  */}
            <div className="mt-5">
              <h3 className="text-lg font-semibold mb-3">Remarks</h3>

              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="w-full border p-3 rounded"
                rows={4}
              />

              <button
                onClick={handleSaveRemark}
                disabled={hasUnapprovedRemark}
                className={`mt-3 px-5 py-2 rounded text-white ${
                  hasUnapprovedRemark ? "bg-gray-400" : "bg-green-600"
                }`}
              >
                Save Remarks
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProject;
