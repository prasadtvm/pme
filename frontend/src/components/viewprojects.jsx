// frontend/src/components/ViewProject.js
import React, { useState, useEffect } from 'react';
import { projectAPI } from '../services/api.jsx';
import { useNavigate } from 'react-router-dom';
//import '../styles/style.css';
import '../styles/tailwind.css';
const ViewProject = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [remark, setRemark] = useState(''); // for textarea input
  const [remarks, setRemarks] = useState([]); // ✅ for list of remarks
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    // Remove auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    // Redirect to login
    //navigate('/login', { replace: true });
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
      userid: user.id, // from localStorage
    });
    //alert('Remark saved successfully!');
    setRemark(''); // clear textarea

    // Refresh remarks
    const res = await projectAPI.getRemarks(selectedProject.id);
    setRemarks(res.data || []);
  } catch (err) {
    console.error('Failed to save remark:', err);
    alert('Error saving remark.');
  }
};

 
   // fetch all projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        console.log('fetch projects for viewer:');
        const res = await projectAPI.getAll();
        
        setProjects(res.data || []);
       // console.log('data retrieve:', JSON.stringify(res.data));
      } catch (err) {
        console.error('Failed to load projects:', err);
        alert('Error loading projects.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);
  // fetch selected project details
  const handleSelectProject = async (projectId) => {
    try {
      setLoading(true);
      console.log('handleSelectProject rtre:', projectId);
      const [projectRes, detailsRes, remarksRes] = await Promise.all([
        projectAPI.getById(projectId),
        projectAPI.getDetails(projectId),
        projectAPI.getRemarks(projectId),
      ]);
      
      setSelectedProject(projectRes.data);
      setDetails(detailsRes.data || {});
      setRemarks(remarksRes.data || []); // ✅ set remarks array
      //console.log('tes',JSON.stringify(projectRes.data, detailsRes.data, remarksRes.data));
      setRemark(''); // reset textarea
    } catch (err) {
      console.error('Error loading project details:', err);
      alert('Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

   if (loading) {
    return <div className="loading-container">Loading...</div>;
  }
  // ✅ Check if any unapproved remark exists
  const hasUnapprovedRemark = remarks.some(r => r.isapproved === false);
  console.log('hasUnapprovedRemark',hasUnapprovedRemark);
  return (
     <div className="page-container">
      <header className="header-container">
         <div>
        <h2 className="page-title">Welcome, {user.name || 'Viewer'}</h2>        
        <p className="project-description">View and review project details</p>
        </div>
        <button
          onClick={handleLogout}
          className="danger-button"
        >
          Logout
        </button>
      </header>

      {/* project list */}
      <section className="section-container">
        <h3 className="section-title">All Projects</h3>
        <div className="project-list">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectProject(p.id)}
              className={`project-tab ${selectedProject?.id === p.id ? 'active' : ''}`}
            >
              {p.name} ({p.year})
            </button>
          ))}
        </div>
      </section>

      {/* selected project details */}
      {selectedProject && (
        <div className="section-container">
          <div className="flex gap-6 mt-6">
          {/* 🧭 Left Anchor Menu */}
          <div className="w-48 bg-gray-100 p-5 border-r border-gray-200 min-h-screen sticky top-0 rounded-lg shadow-sm h-fit">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-gray-700">
              <a href="#information" className="hover:text-blue-600">Information</a>
              <a href="#associate" className="hover:text-blue-600">Associates</a>
              <a href="#venue" className="hover:text-blue-600">Venues</a>
              <a href="#database" className="hover:text-blue-600">Database</a>
              <a href="av" className="hover:text-blue-600">Hotel AV Setup</a>
             <a href="hotel" className="hover:text-blue-600">Av Supplier</a>
              <a href="embassy" className="hover:text-blue-600">Embassy/Consulate</a>
              <a href="client" className="hover:text-blue-600">Client</a>
              <a href="#checklist" className="hover:text-blue-600">Check List</a>
              
             
            </nav>
          </div>
          {/* 🧾 Main Content */}
          <div className="flex-1 space-y-6">
          <div id="information">
              <h3 className="text-lg font-bold text-slate-800 mb-3">Information</h3>
              <div className="section-header">

              <h2 className="section-title"><strong>Name</strong> {selectedProject.name}</h2>
              </div>
              <strong>Event Date:</strong><p className="project-description">{selectedProject.event_date}</p>

              <div style={{ marginBottom: '25px' }}>
              
              <div className="grid-form">
              <p><strong>City:</strong> {details.city}</p>
              <p><strong>Project Handled By:</strong> {details.project_handiled_by}</p>              
              <p><strong>Budget:</strong> ₹{details.budget}</p>
              </div>
              </div>
        </div>
          {/* Associates Section */}
        <div id="associate" className="mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Associates</h3>

          {details.associates?.length ? (
            <div className="grid gap-2">
              {details.associates.map((a, i) => (
                <div
                  key={i}
                  className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-700"
                >
                  {a.name}  {" — "}
                  {a.selected ? (
                    <span className="text-green-600 font-semibold">Selected</span>
                  ) : (
                    <span className="text-gray-500">Not Selected</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No associate data</p>
          )}
        </div>

          
                  {/* Venues Section */}
        <div id="venue" className="mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Venues</h3>

          {details.venues?.length ? (
            <div className="grid gap-2">
              {details.venues.map((v, i) => (
                <div
                  key={i}
                  className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-700"
                >
                  <span className="font-medium text-slate-800">{v.name}</span>
                  {" — "}
                  {v.selected ? (
                    <span className="text-green-600 font-semibold">Selected</span>
                  ) : (
                    <span className="text-gray-500">Not Selected</span>
                  )}
                  {v.pax && (
                    <span className="ml-2 text-gray-600">
                      {v.pax} pax
                    </span>
                  )}
                  {v.budget && (
                    <span className="ml-2 text-gray-600">
                      Budget ₹{v.budget}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No venue data</p>
          )}
        </div>
        

          {/* Trade Database Section */}
          <div id="database" className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Database</h3>

            {details.trade_database?.length ? (
              <div className="grid gap-2">
                {details.trade_database.map((t, i) => (
                  <div
                    key={i}
                    className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-700"
                  >
                    <span className="font-medium text-slate-800">{t.trade_name}</span>
                    {" — "}
                    <span className="text-gray-600">{t.nos} Nos</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No trade database</p>
            )}
          </div>


          {/* RSVP Section 
          <div id="rsvp" className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">RSVP</h3>

            {details.rsvp?.length ? (
              <div className="grid gap-2">
                {details.rsvp.map((r, i) => (
                  <div
                    key={i}
                    className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-700"
                  >
               
                    <div className="font-medium text-slate-800">save the Date: <span className="text-gray-600">{r.save_the_date}</span></div>
                    
                    <div className="font-medium text-slate-800">Confirmation Date: <span className="text-gray-600">{r.save_the_date_confirmation_date}</span></div>
                    <div className="font-medium text-slate-800">TA(nos): <span className="text-gray-600">{r.save_the_date_ta_nos} </span></div>
                    <div className="font-medium text-slate-800">TO(nos): <span className="text-gray-600">{r.save_the_date_to_nos}</span></div>                    
                    <div className="font-medium text-slate-800">Travel Counsellors(nos): <span className="text-gray-600">{r.save_the_date_travel_counsellors_nos}</span></div>
                    <div className="font-medium text-slate-800">Influence(nos): <span className="text-gray-600">{r.save_the_date_influencers_nos} </span></div>
                     <div className="font-medium text-slate-800">Total(nos): <span className="text-gray-600">{r.save_the_date_total_nos}</span></div> 

                    <div className="font-medium text-slate-800">Main Invitation Date: <span className="text-gray-600">{r.main_invitation_date}</span></div>
                    <div className="font-medium text-slate-800">main_invitation Confirmation Date: <span className="text-gray-600">{r.main_invitation_confirmation_date}</span></div>
                    <div className="font-medium text-slate-800">TA(nos): <span className="text-gray-600">{r.main_invitation_ta_nos} </span></div>
                    <div className="font-medium text-slate-800">TO(nos): <span className="text-gray-600">{r.main_invitation_to_nos}</span></div>                    
                    <div className="font-medium text-slate-800">Travel Counsellors(nos): <span className="text-gray-600">{r.save_the_date_travel_counsellors_nos}</span></div>
                    <div className="font-medium text-slate-800">Influence(nos): <span className="text-gray-600">{r.main_invitation_influencers_nos} </span></div>
                     <div className="font-medium text-slate-800">Total(nos): <span className="text-gray-600">{r.main_invitation_total_nos}</span></div> 
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No RSVP data</p>
            )}
          </div>*/}

          {/* RSVP Section */}
<div id="rsvp" className="mb-8">
  <h3 className="text-xl font-semibold text-slate-800 mb-4 text-center">RSVP</h3>

  {details.rsvp?.length ? (
    <div className="space-y-6">
      {details.rsvp.map((r, i) => (
        <div
          key={i}
          className="p-5 bg-gray-50 border border-gray-200 rounded-lg shadow-sm"
        >
          <h4 className="text-lg font-medium text-blue-700 mb-3">
            RSVP #{i + 1}
          </h4>

          {/* Save The Date Section */}
          <div className="mb-4">
            <h5 className="text-md font-semibold text-gray-800 mb-2">
              Save The Date
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-700">
              <p><span className="font-medium text-slate-800">Save the Date:</span> {r.save_the_date || '-'}</p>
              <p><span className="font-medium text-slate-800">Confirmation Date:</span> {r.save_the_date_confirmation_date || '-'}</p>
              <p><span className="font-medium text-slate-800">TA (nos):</span> {r.save_the_date_ta_nos || '0'}</p>
              <p><span className="font-medium text-slate-800">TO (nos):</span> {r.save_the_date_to_nos || '0'}</p>
              <p><span className="font-medium text-slate-800">Travel Counsellors (nos):</span> {r.save_the_date_travel_counsellors_nos || '0'}</p>
              <p><span className="font-medium text-slate-800">Influencers (nos):</span> {r.save_the_date_influencers_nos || '0'}</p>
              <p><span className="font-medium text-slate-800">Total (nos):</span> {r.save_the_date_total_nos || '0'}</p>
            </div>
          </div>

          {/* Main Invitation Section */}
          <div>
            <h5 className="text-md font-semibold text-gray-800 mb-2">
              Main Invitation
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-700">
              <p><span className="font-medium text-slate-800">Invitation Date:</span> {r.main_invitation_date || '-'}</p>
              <p><span className="font-medium text-slate-800">Confirmation Date:</span> {r.main_invitation_confirmation_date || '-'}</p>
              <p><span className="font-medium text-slate-800">TA (nos):</span> {r.main_invitation_ta_nos || '0'}</p>
              <p><span className="font-medium text-slate-800">TO (nos):</span> {r.main_invitation_to_nos || '0'}</p>
              <p><span className="font-medium text-slate-800">Travel Counsellors (nos):</span> {r.main_invitation_travel_counsellors_nos || '0'}</p>
              <p><span className="font-medium text-slate-800">Influencers (nos):</span> {r.main_invitation_influencers_nos || '0'}</p>
              <p><span className="font-medium text-slate-800">Total (nos):</span> {r.main_invitation_total_nos || '0'}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-500 text-center">No RSVP data available.</p>
  )}
</div>


          {/* Hotel AV Setup Section */}
          <div id="av" className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Hotel AV Setup</h3>

            {details.av_setup ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                <div>Backdrop: {details.av_setup.backdrop}</div>
                <div>Screen: {details.av_setup.screen}</div>
                <div>Mic: {details.av_setup.mic}</div>
                <div>Projector: {details.av_setup.projector}</div>
                <div>Stage: {details.av_setup.stage}</div>
              </div>
            ) : (
              <p className="text-gray-500">No Hotel AV setup</p>
            )}
          </div>
   
     {/* Hotel Av supplier Section */}
          <div id="hotel" className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Av Supplier</h3>

            {details.hotel ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                <div>Supplier: {details.hotel.sponsor}</div>
                <div>Name: {details.hotel.name}</div>
                <div>— {details.hotel.selected ? (
                    <span className="text-green-600 font-semibold">Selected</span>
                  ) : (
                    <span className="text-gray-500">Not Selected</span>
                  )}</div>
              </div>
            ) : (
              <p className="text-gray-500">No Av Supplier data</p>
            )}
          </div>

          {/* Embassy Section */}
          <div id="embassy" className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Embassy/Consulate</h3>

            {details.embassy ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                <div>Cheif Guest: {details.embassy.cheif_guest}</div>
                <div>Cheif Guest Designation: {details.embassy.cheif_guest_designation}</div>
                <div>Cheif Guest Phone: {details.embassy.cheif_guest_phone}</div>
                <div>Accommodation Contact: {details.embassy.accommodation_contact}</div>
                <div>Accommodation Address: {details.embassy.accommodation_address}</div>
                <div>Accommodation Phone: {details.embassy.accommodation_phone}</div>
              </div>
            ) : (
              <p className="text-gray-500">No Embassy/consulate data</p>
            )}
          </div>
          {/* Client Section */}
           <div id="client" className="mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Client</h3>
          {details.client ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3 bg-gray-50 rounded border border-gray-200">
              <div>Name: {details.client.name}</div>
              <div>Hotel: {details.client.hotel}</div>
              <div>Address: {details.client.address}</div>
            </div>
          ) : <p className="text-gray-500">No client data</p>}
          </div>

            {/* checklist Section */}
        <div id="checklist" className="mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Check List</h3>

          {details.checklist?.length ? (
            <div className="grid gap-2">
              {details.checklist.map((a, i) => (
                <div
                  key={i}
                  className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-700"
                >
                   {a.name} — {a.selected ? (
                    <span className="text-green-600 font-semibold">Selected</span>
                  ) : (
                    <span className="text-gray-500">Not Selected</span>
                  )}
                  {/*{a.name} — {a.selected ? "Selected" : "Not Selected"}*/}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No checklist data</p>
          )}
        </div>


           <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Menu File</h3>
          {details.menuFile ? (
            <a href={details.menuFile.file_path} target="_blank" rel="noreferrer">
              {details.menuFile.filename}
            </a>
          ) : <p className="text-gray-500">No menu file uploaded</p>}
          </div>
          <hr />     


          {/* Show Remarks List */}
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
        

          {/* Remarks Section */}
          <div className="mt-5">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Remarks</h3>

            <textarea
              placeholder="Enter your remarks here..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <button
              onClick={handleSaveRemark}
              disabled={hasUnapprovedRemark}
              className={`mt-3 px-5 py-2 rounded text-white font-medium transition-colors duration-200 ${
                hasUnapprovedRemark
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              }`}
            >
              Save Remarks
            </button>
          </div>

        </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default ViewProject;
