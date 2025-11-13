const { json } = require('body-parser');
const Project = require('../Models/projectModel');
//const pool = require('../db'); // import pool
const pool = require('../config/database');
const projectController = {
  // Get all projects for user
  getAllProjects: async (req, res) => {
    try {   
      console.log('🔑 req.user:', req.user);       
      const user = req.user; // comes from auth middleware
       const _projects = await Project.getAll(user);  
    console.log('📊 Raw _projects from DB:', _projects);
      // Add progress for each project
    const projects = await Promise.all(
      _projects.map(async (p) => {
        const progress = await Project.calculateProgress(p.id);
        return { ...p, progress };
      })
    );
 console.log('✅ Final projects (with progress):', projects);
      res.json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get project by ID
  getProjectById: async (req, res) => {
    try {
    const user = req.user; // assuming req.user has id and role
    const projectId = req.params.id;
    
      const project = await Project.getById(projectId, user);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }      
      res.json(project);
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Create new project
  createProject: async (req, res) => {
    try {  
      console.log("🟢 Incoming create project request");
      console.log("➡️  req.body:", req.body);
      console.log("➡️  req.file:", req.file);  
      const { name,  event_date } = req.body;
      const userId = req.user.id;
      // file comes from multer
    
      if (!name || !event_date) {
        return res.status(400).json({ error: 'Name and event date are required' });
      }
     let imageFile = '';
        // ✅ Cloudinary returns a hosted URL in req.file.path
      //    If local storage is still used, fallback to filename
       if (req.file) {
      // Different multer-cloudinary versions attach the URL in different places
    // Cloudinary gives you a URL in req.file.path
      imageFile = req.file ? req.file.path : null;
      console.log("✅ Uploaded file URL:", imageFile);
      } else {
        console.log("⚠️ No file uploaded");
      }
      
      
      const projectData = {
        name,
        image_file: imageFile || '',
        event_date,
        created_by: userId
      };
      console.log("🆕 Creating project with data:", projectData);
      const newProject = await Project.create(projectData);
      console.log("✅ Project created successfully:", newProject);
      res.status(201).json(newProject);
    } catch (error) {
      console.error("❌ Error creating project:",error);
      if (error.stack) console.error(error.stack);
      res.status(500).json({
        message: error.message || "Unknown error",
        stack: error.stack,
        code: error.code,
        detail: error.detail,
         });
    }
  },

  // Update project
  updateProject: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { name, image_file, event_date, status } = req.body;
      const updatedProject = await Project.update(id, {
        name,
       image_file,
       event_date,
        status
      }, userId);

      if (!updatedProject) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json(updatedProject);
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete project
  deleteProject: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const deletedProject = await Project.delete(id, userId);
      
      if (!deletedProject) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get project details
  getProjectDetails: async (req, res) => {
    try {

     const user = req.user; // assuming req.user has id and role
    const projectId = req.params.id;

      const details = await Project.getDetails(projectId, user);
      const associates = await Project.getAssociates(projectId, user);
      const venues = await Project.getVenues(projectId, user);
      
      // Get additional data with error handling
      const tradeDatabase = await Project.getTradeDatabase(projectId, user);
      const rsvp = await Project.getRSVP(projectId, user);
      const mainInvites = await Project.getMainInvite(projectId, user);
      const hotels = await Project.getHotels(projectId, user);
      const avSetup = await Project.getAVSetup(projectId, user);
      const embassy = await Project.getEmbassy(projectId, user);
      const clients = await Project.getClients(projectId, user);
      const starks = await Project.getStarks(projectId, user);
      const checklist = await Project.getChecklists(projectId, user);
      const menuFile =  await Project.getMenu(projectId, user);
//console.log('projectcontroller getprojectdetails');
      res.json({
        ...details,
        associates,
        venues,
        trade_database: tradeDatabase,
        rsvp,
        mainInvites,
        hotels,
        av_setup: avSetup,
        embassy,
        clients,
        starks,
        checklist,
        menuFile
      });
      //console.log('projectcontroller getprojectdetails menufile',JSON.stringify(menuFile));
    } catch (error) {
      console.error('Error fetching project details:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update project details (comprehensive)
  updateProjectDetails: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const details = req.body;

      // Update main details
      const updatedDetails = await Project.updateDetails(id, details, userId);
      
      // Update venues if provided
      if (details.venues) {
        await Project.updateVenues(id, details.venues, userId);
      }

      const finalDetails = await Project.getDetails(id, userId);
      const venues = await Project.getVenues(id, userId);

      res.json({
        ...finalDetails,
        venues
      });
    } catch (error) {
      console.error('Error updating project details:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  },

  // INDIVIDUAL SECTION CONTROLLERS

  // Update roadshow information only
  updateRoadshowInfo: async (req, res) => {
    try {      
      
      const { id } = req.params;
      const userId = req.user.id;

      // ✅ Extract values safely
    const roadshow_name = req.body.roadshow_name || null;
    const event_date = req.body.event_date || null;
    const budget = req.body.budget || null;
    const project_handiled_by = req.body.project_handiled_by || null;

     // ✅ If Cloudinary uploaded image, get its URL
    const image_file = req.file ? req.file.path : null;

    // Combine all into one clean object
    const roadshowData = {
      roadshow_name,
      event_date,
      budget,
      project_handiled_by,
      image_file,
    };

    console.log("🟢 Received roadshow update:", roadshowData);
      
      //const roadshowData = req.body;          

      const updatedInfo = await Project.updateRoadshowInfo(id, roadshowData, userId);
      
      res.json({
        message: 'Roadshow information updated successfully',
        data: updatedInfo
      });
    } catch (error) {
      console.error('Error updating roadshow info:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  },

  // Update associates only
  updateAssociates: async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const { associates } = req.body;
                                     
      const updatedAssociates = await Project.updateAssociates(id, associates, user);
      
      res.json({
        message: 'Associates updated successfully',
        data: updatedAssociates
      });
    } catch (error) {
      console.error('Error updating associates:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  },

  // Update venues only
  updateVenues: async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const { venues } = req.body;

      const updatedVenues = await Project.updateVenues(id, venues, user);
      
      res.json({
        message: 'Venues updated successfully',
        data: updatedVenues
      });
    } catch (error) {
      console.error('Error updating venues:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  },

  // Update trade database only
  updateTradeDatabase: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { trade_database } = req.body;

      const updatedTradeDatabase = await Project.updateTradeDatabaseOnly(id, trade_database, userId);
      
      res.json({
        message: 'Trade database updated successfully',
        data: updatedTradeDatabase
      });
    } catch (error) {
      console.error('Error updating trade database:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  },
  // Update Hotels only
  updateHotels: async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const { hotels } = req.body;
                                     
      const updatedHotels = await Project.updateHotels(id, hotels, user);
      
      res.json({
        message: 'Hotels updated successfully',
        data: updatedHotels
      });
    } catch (error) {
      console.error('Error updating hotels:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  },

  /* Update RSVP only
  updateRSVP: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { rsvp } = req.body;

      const updatedRSVP = await Project.updateRSVPOnly(id, rsvp, userId);
      
      res.json({
        message: 'RSVP updated successfully',
        data: updatedRSVP
      });
    } catch (error) {
      console.error('Error updating RSVP:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  },*/

  updateMainInvite: async(req,res)=> {
 try {
    const { id } = req.params;
    const userId = req.user.id;
    

    let mainInviteData  = req.body.Main_invite;
    if (typeof mainInviteData === 'string') {
      try {
        mainInviteData = JSON.parse(mainInviteData);
      } catch (err) {
        console.error('❌ Invalid mainInviteData JSON format:', err);
        rsvpData = [];
      }
    }

    // ✅ 2. Ensure it's always an array
    if (!Array.isArray(mainInviteData)) {
      mainInviteData = [mainInviteData];
    }
    //const { rsvp } = req.body;
    const filePath = req.file ? req.file.path : null;
console.log('Parsed main Invite data:', mainInviteData);
    console.log('Uploaded file path:', filePath);
    const updatedMainInvite = await Project.updateMainInvite(id, mainInviteData, userId, filePath);

    res.json({
      message: 'mainInviteData updated successfully',
      data: updatedMainInvite
        });
  } catch (error) {
    console.error('Error updating main Invite:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }

  },

  // ✅ Update RSVP with file upload + multiple entries
updateRSVP: async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    

    let rsvpData = req.body.rsvp;
    if (typeof rsvpData === 'string') {
      try {
        rsvpData = JSON.parse(rsvpData);
      } catch (err) {
        console.error('❌ Invalid RSVP JSON format:', err);
        rsvpData = [];
      }
    }

    // ✅ 2. Ensure it's always an array
    if (!Array.isArray(rsvpData)) {
      rsvpData = [rsvpData];
    }
    //const { rsvp } = req.body;
    const filePath = req.file ? req.file.path : null;
    console.log('Parsed RSVP data:', rsvpData);
    console.log('Uploaded file path:', filePath);
    const updatedRSVP = await Project.updateRSVPOnly(id, rsvpData, userId, filePath);

    res.json({
      message: 'RSVP updated successfully',
      data: updatedRSVP
    });
  } catch (error) {
    console.error('Error updating RSVP:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
},

  // Update AV setup only
  updateAVSetup: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      //const { av_setup } = req.body;

    //  const avSetup = req.body;

       console.log("🟡 req.files =", req.files);
    console.log("🟡 req.body =", req.body);

    // 🟢 Attach uploaded image URLs (Cloudinary gives .path)
    //if (req.files?.backdrop_image) {
    //  avSetup.backdrop_image = req.files.backdropImage[0].path;
    //}
    //if (req.files?.screen_image) {
    //  avSetup.screen_image = req.files.screenImage[0].path;
    //}
    //if (req.files?.stage_image) {
   //   avSetup.stage_image = req.files.stageImage[0].path;
    //}
    

    const avSetup = {
      backdrop: req.body.backdrop,
      screen: req.body.screen,
      mic: req.body.mic,
      type: req.body.type,
      projector: req.body.projector === "true",
      podium: req.body.podium === "true",      
      backdrop_image: req.files?.backdrop_image?.[0]?.path || null,
      screen_image: req.files?.screen_image?.[0]?.path || null,
      stage_image: req.files?.stage_image?.[0]?.path || null,
    };

    console.log("🟢 Final AV setup to save:", avSetup);
      const updatedAVSetup = await Project.updateAVSetupOnly(id, avSetup, userId);
      
      res.json({
        message: 'AV Setup updated successfully',
        data: updatedAVSetup
      });
    } catch (error) {
      console.error('Error updating AV setup:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  },

  // Update embassy only
  updateEmbassy: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { embassy } = req.body;

      const updatedEmbassy = await Project.updateEmbassyOnly(id, embassy, userId);
      
      res.json({
        message: 'Embassy information updated successfully',
        data: updatedEmbassy
      });
    } catch (error) {
      console.error('Error updating embassy:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  },

  // Update client only
  updateClients: async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const { clients } = req.body;

      const updatedClient = await Project.updateClient(id, clients, user);
      
      res.json({
        message: 'Client information updated successfully',
        data: updatedClient
      });
    } catch (error) {
      console.error('Error updating client:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  },
  // Update client only
  updateStarks: async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const { starks } = req.body;

      const updatedStark = await Project.updateStark(id, starks, user);
      
      res.json({
        message: 'Stark information updated successfully',
        data: updatedStark
      });
    } catch (error) {
      console.error('Error updating stark:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  },

  // Update Checklists only
  updateChecklists: async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const { checklists } = req.body;
                                     
      const updatedChecklists = await Project.updateChecklists(id, checklists, user);
      
      res.json({
        message: 'Checklists updated successfully',
        data: updatedChecklists
      });
    } catch (error) {
      console.error('Error updating checklists:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  },

  // Upload menu file
  uploadMenu: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
// 🧩 Compute relative path instead of absolute
    const path = require('path');
    const rootDir = path.join(__dirname, '..'); // go up from controllers folder
    const relativePath = path
      .relative(rootDir, req.file.path)
      .replace(/\\/g, '/'); // works cross-platform (Windows/Linux)

      const fileData = {
        filename: req.file.filename,
        type: req.file.type,
        size: req.file.size,
        path: relativePath
      };

      const result = await Project.saveMenuFile(id, fileData, userId);
      
      res.json({
        message: 'Menu file uploaded successfully',
        data: result
      });
    } catch (error) {
      console.error('Error uploading menu file:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  },


  // Get all projects
  getAll: async (req, res) => {
    try {
      const result = await pool.query('SELECT id, name, image_file, TO_CHAR(event_date, \'YYYY-MM-DD\') AS event_date, status, created_by, created_at FROM projects ORDER BY id DESC');
      
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching projects:', err);
      res.status(500).json({ error: 'Failed to load projects' });
    }
  },

  // Get project by ID
  getById: async (req, res) => {
    try {
      const result = await pool.query('SELECT id, name, image_file, TO_CHAR(event_date, \'YYYY-MM-DD\') AS event_date, status, created_by, created_at FROM projects WHERE id = $1', [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching project:', err);
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  },

  // ✅ Combined details
  getDetails: async (req, res) => {
    const { id } = req.params;
    try {
      const [detailsRes, associatesRes, venuesRes, tradeRes, rsvpRes, hotelRes, avRes, embassyRes, clientRes, checklistRes, menuRes] = await Promise.all([
        pool.query('SELECT * FROM project_details WHERE project_id = $1', [id]),
        pool.query('SELECT * FROM associates WHERE project_id = $1', [id]),
        pool.query('SELECT * FROM venues WHERE project_id = $1', [id]),
        pool.query('SELECT * FROM trade_database WHERE project_id = $1', [id]),
        pool.query('SELECT * FROM rsvp WHERE project_id = $1', [id]),
        pool.query('SELECT * FROM hotels WHERE project_id = $1', [id]),
        pool.query('SELECT * FROM av_setup WHERE project_id = $1', [id]),
        pool.query('SELECT * FROM embassy WHERE project_id = $1', [id]),
        pool.query('SELECT * FROM client WHERE project_id = $1', [id]),
        pool.query('SELECT * FROM checklist WHERE project_id = $1', [id]),
        pool.query('SELECT * FROM menu_files WHERE project_id = $1', [id]),
      ]);

      const d = detailsRes.rows[0] || {};
      d.associates=associatesRes.rows;
      d.venues = venuesRes.rows;
      d.trade_database = tradeRes.rows;
      d.rsvp = rsvpRes.rows;
      d.hotels =hotelRes.rows;
      d.av_setup = avRes.rows[0] || {};
      d.embassy = embassyRes.rows[0] || {};
      d.clients = clientRes.rows || {};
      d.checklist = checklistRes.rows[0] || {};
      d.menuFile = menuRes.rows[0] || {};

      res.json(d);
    } catch (err) {
      console.error('Error fetching project details:', err);
      res.status(500).json({ error: 'Failed to fetch project details' });
    }
  },

   addRemark: async (req, res) => {
    try {
      const { project_id, remarktext, userid } = req.body;

      if (!project_id || !remarktext || !userid) {
        return res.status(400).json({ message: 'Missing required fields.' });
      }
       //console.log('adding remark project controller',project_id,remarktext,userid);
      const remark = await Project.addRemark({ project_id, remarktext, userid });
      res.status(201).json({ message: 'Remark added successfully', remark });
    } catch (err) {
      console.error('Error adding remark:', err);
      res.status(500).json({ message: 'Error adding remark', error: err.message });
    }
  },

getRemarksByProject: async (req, res) => {
    try {
      const  projectId  = req.params.projectId;
      //console.log('Fetching remarks for projectId =', projectId);
      if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required' });
      }

      const remarks = await Project.getRemarksByProject(projectId);
     // console.log('Fetched remarks:', remarks);
      res.status(200).json(remarks);
    } catch (err) {
      console.error('Error fetching remarks:', err);
      res.status(500).json({ message: 'Error fetching remarks', error: err.message });
    }
  }, 
 //  Mark remark as resolved by admin
resolveRemark: async (req, res) => {
 const remarkId = req.params.id;
 try {
    
    const updated  = await Project.toggleRemarkStatus(remarkId);
   if (!updated) {
      return res.status(404).json({ message: "Remark not found" });
    }
    res.json({  message: updated.isapproved ? "Remark marked as resolved" : "Remark marked as pending",
      remark: updated, });
  } catch (err) {
    console.error('Error toggling remark status:', err);
    res.status(500).json({ error: 'Failed to update remark status' });
  }
},

getProgress: async (req, res) => {
  try {
    //const projectId = req.params.id;  
    // Check if project basic info exists

    // Force numeric type
    //console.log("🧠 Raw req.params.id =", req.params.id, typeof req.params.id);

    // 🧹 Clean malformed IDs like '{"21"}', '["21"]', etc.
    let projectId = req.params.id;

    if (typeof projectId === 'string') {
      projectId = projectId.replace(/[^0-9]/g, ''); // keep only digits
    }


    if (isNaN(projectId)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    const progress  = await Project.calculateProgress([projectId]);
      res.json({  progress });
    } catch (err) {
        console.error('Error calculating progress:', err);
        res.status(500).json({ error: 'Failed to calculate progress' });
     }
 },

  
};

module.exports = projectController;