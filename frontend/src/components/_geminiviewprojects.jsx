// frontend/src/components/ViewProject.js
import React, { useState, useEffect } from 'react';
import { projectAPI } from '../services/api.jsx';
import { useNavigate } from 'react-router-dom';
import '../styles/tailwind.css';
import logo from "../assets/images/company_logo.png";

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
      console.log('clients', JSON.stringify(details.clients));
      setRemarks(remarksRes.data || []);
      setRemark('');
    } catch (err) {
      console.error('Error loading details:', err);
      alert('Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) return <div className="loading-container">Loading...</div>;

  const hasUnapprovedRemark = remarks.some(r => r.isapproved === false);

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="flex justify-between items-center mt-2 mb-0 pb-2 pl-5 pt-2 pr-5">
        <img src={logo} alt="Company Logo" className="h-12" />
        {/* Mobile Menu Button */}
        {selectedProject && (
          <button
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isSidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        )}
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
        <div className="flex gap-4 mb-4 flex-wrap">

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
                onClick={() => {
                  handleSelectProject(p.id);
                  setIsSidebarOpen(false); // Close sidebar on selection
                }}
                className={`px-4 py-2 rounded border ${selectedProject?.id === p.id ? 'bg-blue-600 text-white' : 'bg-gray-100'
                  }`}
              >
                {p.name}
              </button>
            ))}
        </div>
      </section>

      {/* PROJECT DETAILS */}
      {selectedProject && (
        <div className="w-full mt-8 flex flex-col md:flex-row px-4 md:px-10 gap-6 relative">

          {/* LEFT MENU - Responsive */}
          <div className={`
            fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:relative md:translate-x-0 transition duration-200 ease-in-out
            w-64 md:w-48 bg-[#70AD47] text-white p-5 flex-shrink-0 h-screen 
            z-30 md:z-auto overflow-y-auto
            md:sticky md:top-0
          `}>
            <div className="flex justify-between items-center md:hidden mb-4">
              <span className="font-bold text-lg">Menu</span>
              <button onClick={() => setIsSidebarOpen(false)} className="text-white">
                ✕
              </button>
            </div>
            <nav className="flex flex-col space-y-2 text-sm font-medium text-white pt-5 pl-1 pr-5">

              <a className='hover:font-bold hover:text-white text-left pt-5 pl-5' href="#associate" onClick={() => setIsSidebarOpen(false)}>ASSOCIATES</a>
              <a className='hover:font-bold hover:text-white text-left pt-5 pl-5' href="#venue" onClick={() => setIsSidebarOpen(false)}>VENUES</a>
              <a className='hover:font-bold hover:text-white text-left pt-5 pl-5' href="#database" onClick={() => setIsSidebarOpen(false)}>DATABASE</a>
              <a className='hover:font-bold hover:text-white text-left pt-5 pl-5' href="#rsvp" onClick={() => setIsSidebarOpen(false)}>RSVP# SAVE THE DATE</a>
              <a className='hover:font-bold hover:text-white text-left pt-5 pl-5' href="#av" onClick={() => setIsSidebarOpen(false)}>HOTEL AV SETUP</a>
              <a className='hover:font-bold hover:text-white text-left pt-5 pl-5' href="#avsupplier" onClick={() => setIsSidebarOpen(false)}>AV SUPPLIER</a>
              <a className='hover:font-bold hover:text-white text-left pt-5 pl-5' href="#embassy" onClick={() => setIsSidebarOpen(false)}>EMBASSY/CONSULATE</a>
              <a className='hover:font-bold hover:text-white text-left pt-5 pl-5' href="#client" onClick={() => setIsSidebarOpen(false)}>CLIENT</a>
              <a className='hover:font-bold hover:text-white text-left pt-5 pl-5' href="#stark" onClick={() => setIsSidebarOpen(false)}>STARK</a>
              <a className='hover:font-bold hover:text-white text-left pt-5 pl-5' href="#checklist" onClick={() => setIsSidebarOpen(false)}>CHECKLIST</a>
              <a className='hover:font-bold hover:text-white text-left pt-5 pl-5' href="#menu" onClick={() => setIsSidebarOpen(false)}>MENU</a>
              <a className='hover:font-bold hover:text-white text-left pt-5 pl-5' href="#remark" onClick={() => setIsSidebarOpen(false)}>REMARK</a>

            </nav>
          </div>

          {/* Overlay for mobile sidebar */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          )}

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

              <div className="w-full border rounded-lg overflow-x-auto">
                <div className="min-w-[800px]">
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
            </div>

            {/* Other sections unchanged — will continue same widening logic */}

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
                <div className="mb-4">
                  {remarks.map((r) => (
                    <div
                      key={r.id}
                      className="bg-gray-50 p-3 mb-2 rounded border border-gray-300 relative"
                    >
                      <strong>{r.username || "Viewer"}:</strong> {r.remarktext}
                      <span
                        className={`absolute right-3 top-3 text-sm font-medium ${r.isapproved ? "text-green-600" : "text-orange-500"
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
                className={`mt-3 px-5 py-2 rounded text-white ${hasUnapprovedRemark ? "bg-gray-400" : "bg-green-600"
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
