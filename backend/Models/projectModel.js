const { json } = require('body-parser');
const pool = require('../config/database');

const Project = {
  // Get all projects
  getAll: async (user) => {
//console.log('model'+user.id,user.role);

    if (!user) {
    throw new Error('User not provided');
  }
    //let query = 'SELECT p.id, p.name, p.image_file, TO_CHAR(p.event_date, \'YYYY-MM-DD\') AS event_date, p.status, p.created_by, p.created_at,pd.project_handiled_by FROM projects p inner join project_details pd on  params.id=pd.project_id';
    
  let query = `SELECT 
      p.id, 
      p.name, 
      p.image_file, 
      TO_CHAR(p.event_date, 'YYYY-MM-DD') AS event_date, 
      p.status, 
      p.created_by, 
      p.created_at,
      pd.project_handiled_by
    FROM projects p
    LEFT JOIN project_details pd ON p.id = pd.project_id
  `;

    const params = [];

    if (user.role === '1') {
      // Admin: fetch only projects created by them
      query += ' WHERE p.created_by = $1';
      params.push(user.id);
    } 
    // Viewer: fetch all projects (no WHERE filter)

    query += ' ORDER BY p.id DESC';
    console.log('🧩 Running query:', query, 'params:', params);

    const result = await pool.query(query, params);
    console.log('📊 getAll() returned rows:', result.rows.length);
    return result.rows;   
    
  },

  // Get project by ID
  getById: async (id, user) => {
    //const result = await pool.query(
   //   'SELECT * FROM projects WHERE id = $1 AND created_by = $2',
   //   [id, userId]
   // );
    //return result.rows[0];
    if (!user) {
    throw new Error('User not provided');
  }

  let query = 'SELECT id, name, image_file, TO_CHAR(event_date, \'YYYY-MM-DD\') AS event_date FROM projects WHERE id = $1';
  const params = [id];

  if (user.role === '1') {
    // Admin: restrict to their own projects
    query += ' AND created_by = $2';
    params.push(user.id);
  }
  // Viewer: no created_by restriction

  const result = await pool.query(query, params);
  return result.rows[0];
  },

  // Create new project
  create: async (projectData) => {
   // const { name, description, year, created_by } = projectData;

    console.log('projectmodel testr21112025',JSON.stringify(projectData));
   const { name, image_file, event_date, created_by } = projectData;
  // console.log('Inserting project:', { name, image_file, event_date, created_by });
    const result = await pool.query(
      'INSERT INTO projects (name, image_file, event_date, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, image_file, event_date, created_by]
    );
     const project = result.rows[0];

  // Insert matching project_details row
  await pool.query(
    'INSERT INTO project_details (project_id, roadshow_name, event_date, project_handiled_by) VALUES ($1, $2, $3,$4)',
    [project.id, project.name, project.event_date,projectData.project_handiled_by]
  );

  return project;
    
  },

  // Update project
  update: async (id, projectData, userId) => {
   // const { name, description, year, status } = projectData;
   const { name, image_file, event_date, status } = projectData;
    const result = await pool.query(
      'UPDATE projects SET name = $1, image_file  = $2, event_date  = $3,  updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND created_by = $5 RETURNING *',
      [name, image_file, event_date,  id, userId]
    );
    return result.rows[0];
  },

  // Delete project
  delete: async (id, userId) => {
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND created_by = $2 RETURNING *',
      [id, userId]
    );
    return result.rows[0];
  },

  // Project Details
  getDetails: async (projectId, user) => {
    

    if (!user) {
    throw new Error('User not provided');
  }
  
  let result;
  if(user.role==='1'){
        result = await pool.query(
      `SELECT pd.*, p.name as project_name,p.image_file as project_image_file
       FROM project_details pd 
       JOIN projects p ON pd.project_id = p.id 
       WHERE pd.project_id = $1 AND p.created_by = $2`,
      [projectId, user.id]
    );
  }
  else{
     result = await pool.query(
      `SELECT pd.*, p.name as project_name,p.image_file as project_image_file 
       FROM project_details pd 
       JOIN projects p ON pd.project_id = p.id 
       WHERE pd.project_id = $1`,
      [projectId]
    );
  }
    return result.rows[0] || {};
  },

  updateDetails: async (projectId, details, userId) => {
   // const { roadshow_name, city, month, year, associate, budget,associate_graduate_no, embassy_donbear_no } = details;
   const { roadshow_name,  event_date,  budget,project_handiled_by } = details;
    
    // Check if project exists and user has access
    const project = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND created_by = $2',
      [projectId, userId]
    );

    if (project.rows.length === 0) {
      throw new Error('Project not found or access denied');
    }

    // Check if details already exist
    const existingDetails = await pool.query(
      'SELECT id FROM project_details WHERE project_id = $1',
      [projectId]
    );

    if (existingDetails.rows.length > 0) {
      // Update existing
      const result = await pool.query(
        `UPDATE project_details 
         SET roadshow_name = $1,  event_date = $2, budget = $3, project_handiled_by=$4, updated_at = CURRENT_TIMESTAMP 
         WHERE project_id = $5 RETURNING *`,
        [roadshow_name,  event_date,  budget,project_handiled_by,  projectId]
      );      
      return result.rows[0];
    } else {
      // Insert new
      const result = await pool.query(
        `INSERT INTO project_details (project_id, roadshow_name,  event_date,  budget,project_handiled_by) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [projectId, roadshow_name,  event_date,  budget, project_handiled_by]
      );
      return result.rows[0];
    }
  },

   // Associates
  getAssociates: async (projectId, user) => {

    let result;
  if(user.role==='1'){
        result = await pool.query(
      `SELECT a.* FROM associates a 
       JOIN projects p ON a.project_id = p.id 
       WHERE a.project_id = $1 AND p.created_by = $2 
       ORDER BY a.created_at`,
      [projectId, user.id]
    );
  }
  else{
    result = await pool.query(
      `SELECT a.* FROM associates a  
       JOIN projects p ON a.project_id = p.id 
       WHERE a.project_id = $1 
       ORDER BY a.created_at`,
      [projectId]
    );
  }

    return result.rows;
  },

  updateAssociates: async (projectId, associates, user) => {
    // First, verify project access
//console.log('updateassocia  proj mode',user.id,user.role);
     let project;
  if(user.role === '1'){
        
    project  = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND created_by = $2',
      [projectId, user.id]
    );
  }
  else{
    project = await pool.query(
      'SELECT id FROM projects WHERE id = $1',
      [projectId]
    );
  }

    if (project.rows.length === 0) {
      throw new Error('Project not found or access denied');
    }

    // Delete existing associates
    await pool.query('DELETE FROM associates WHERE project_id = $1', [projectId]);

    // Insert new associates
    for (const associate of associates) {
      await pool.query(
        'INSERT INTO associates (project_id, name,  selected,city) VALUES ($1, $2, $3,$4)',
        [projectId, associate.name, associate.selected || false,associate.city]
      );      
    }

    return await Project.getAssociates(projectId, user);
  },

  // Venues
  getVenues: async (projectId, user) => {

    let result;
  if(user.role==='1'){
        result = await pool.query(
      `SELECT v.* FROM venues v 
       JOIN projects p ON v.project_id = p.id 
       WHERE v.project_id = $1 AND p.created_by = $2 
       ORDER BY v.created_at`,
      [projectId, user.id]
    );
  }
  else{
    result = await pool.query(
      `SELECT v.* FROM venues v 
       JOIN projects p ON v.project_id = p.id 
       WHERE v.project_id = $1 
       ORDER BY v.created_at`,
      [projectId]
    );
  }

    return result.rows;
  },

  updateVenues: async (projectId, venues, user) => {
    // First, verify project access

    console.log("🔍 updateVenues called with:", {
  projectId,
  venuesCount: venues?.length,
  user,
});

const cleanNumeric = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return value;

  // Remove spaces and thousand separators
  let clean = value.toString().trim().replace(/\s/g, "");

  // Remove spaces and thousand separators safely
  // Case 1: European style 1.234,56 → convert to 1234.56
  if (/,\d{1,2}$/.test(clean))  {
    clean = clean.replace(/\./g, "").replace(",", ".");
  }
  // Case 2: Normal style 1,234.56 → convert to 1234.56
  else if (/,/.test(clean)) {
    clean = clean.replace(/,/g, "");
  }

  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

     let project;
  if(user.role === 1 ||user.role==='1'){
        
    project  = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND created_by = $2',
      [projectId, user.id]
    );
  }
  else{
    project = await pool.query(
      'SELECT id FROM projects WHERE id = $1',
      [projectId]
    );
  }

    if (project.rows.length === 0) {
      throw new Error('Project not found or access denied');
    }

    // Delete existing venues
    await pool.query('DELETE FROM venues WHERE project_id = $1', [projectId]);


    // Insert new venues
    for (const venue of venues) {
      await pool.query(
        'INSERT INTO venues (project_id, name, currency, rate, budget, selected, venue_rental, av, food, bar) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [projectId, venue.name, venue.currency, cleanNumeric(venue.rate),cleanNumeric(venue.budget), venue.selected || false, venue.venue_rental|| false, venue.av|| false, venue.food|| false, venue.bar|| false]
      );      
    }

    return await Project.getVenues(projectId, user);
  },

  // Trade Database - Basic implementation for now
  getTradeDatabase: async (projectId, user) => {
    try {

      let result;
  if(user.role==='1'){
        result = await pool.query(
        `SELECT td.* FROM trade_database td 
         JOIN projects p ON td.project_id = p.id 
         WHERE td.project_id = $1 AND p.created_by = $2 
         ORDER BY td.created_at`,
        [projectId, user.id]
      );
    }
    else{
      result = await pool.query(
        `SELECT td.* FROM trade_database td 
         JOIN projects p ON td.project_id = p.id 
         WHERE td.project_id = $1  
         ORDER BY td.created_at`,
        [projectId]
      );
    }
      return result.rows;
    } catch (error) {
      // If table doesn't exist yet, return empty array
      console.log('Trade database table might not exist yet, returning empty array');
      return [];
    }
  },

  // Hotels
  getHotels: async (projectId, user) => {

    let result;
  if(user.role==='1'){
        result = await pool.query(
      `SELECT a.* FROM hotels a 
       JOIN projects p ON a.project_id = p.id 
       WHERE a.project_id = $1 AND p.created_by = $2 
       ORDER BY a.created_at`,
      [projectId, user.id]
    );
  }
  else{
    result = await pool.query(
      `SELECT a.* FROM hotels a  
       JOIN projects p ON a.project_id = p.id 
       WHERE a.project_id = $1 
       ORDER BY a.created_at`,
      [projectId]
    );
  }

    return result.rows;
  },
   updateHotels: async (projectId, hotels, user) => {
    // First, verify project access
//console.log('updateassocia  proj mode',user.id,user.role);
     let project;
  if(user.role === '1'){
        
    project  = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND created_by = $2',
      [projectId, user.id]
    );
  }
  else{
    project = await pool.query(
      'SELECT id FROM projects WHERE id = $1',
      [projectId]
    );
  }

    if (project.rows.length === 0) {
      throw new Error('Project not found or access denied');
    }

    // Delete existing hotels
    await pool.query('DELETE FROM hotels WHERE project_id = $1', [projectId]);

    // Insert new hotels
    for (const hotel of hotels) {
      await pool.query(
        'INSERT INTO hotels (project_id,sponsor, selected, item, currency, amount) VALUES ($1, $2, $3, $4, $5, $6)',
        [projectId, hotel.sponsor, hotel.selected || false,hotel.item, hotel.currency,  hotel.amount]
      );      
    }

    return await Project.getHotels(projectId, user);
  },

  /* RSVP - Basic implementation for now
  getRSVP: async (projectId, user) => {
    try {
      
      let result;
  if(user.role==='1'){
        result = await pool.query(
        `SELECT r.id,
            r.project_id,
            TO_CHAR(r.date, 'YYYY-MM-DD') AS date,  -- ✅ Proper date string format
            r.nos,
            r.created_at FROM rsvp r 
         JOIN projects p ON r.project_id = p.id 
         WHERE r.project_id = $1 AND p.created_by = $2 
         ORDER BY r.created_at`,
        [projectId, user.id]
      );
    }
    else{
      result = await pool.query(
        `SELECT r.id,
            r.project_id,
            TO_CHAR(r.date, 'YYYY-MM-DD') AS date,  -- ✅ Fix applied here too
            r.nos,
            r.created_at FROM rsvp r 
         JOIN projects p ON r.project_id = p.id 
         WHERE r.project_id = $1  
         ORDER BY r.created_at`,
        [projectId]
      );
    }
      return result.rows;
    } catch (error) {
      // If table doesn't exist yet, return empty array
      console.log('RSVP table might not exist yet, returning empty array');
      return [];
    }
  },*/
  getRSVP: async (projectId, user) => {
  try {
    let result;
    if (user.role === '1') {
      result = await pool.query(
        `SELECT r.id,
            r.project_id,
            r.invitation_design_file_path,TO_CHAR(r.save_the_date, 'YYYY-MM-DD') AS save_the_date,            
            r.save_the_date_ta_nos,r.save_the_date_to_nos,r.save_the_date_travel_counsellors_nos,r.save_the_date_influencers_nos                        
            FROM rsvp r 
         JOIN projects p ON r.project_id = p.id 
         WHERE r.project_id = $1 AND p.created_by = $2 
         ORDER BY r.created_at`,
        [projectId, user.id]
      );
    } else {
      result = await pool.query(
        `SELECT r.project_id,
            r.invitation_design_file_path,TO_CHAR(r.save_the_date, 'YYYY-MM-DD') AS save_the_date,          
            r.save_the_date_ta_nos,r.save_the_date_to_nos,r.save_the_date_travel_counsellors_nos,r.save_the_date_influencers_nos
             FROM rsvp r WHERE r.project_id = $1 ORDER BY r.created_at`,
        [projectId]
      );
    }

    return result.rows;
  } catch (error) {
    console.log('RSVP table might not exist yet, returning empty array');
    return [];
  }
},
getMainInvite: async (projectId, user) => {
  try {
    let result;
    if (user.role === '1') {
      result = await pool.query(
        `SELECT r.id,
                r.project_id,
                r.main_invite_design_file_path,
                TO_CHAR(r.main_invite_date, 'YYYY-MM-DD') AS main_invite_date,
                r.main_invite_ta_nos,
                r.main_invite_to_nos,
                r.main_invite_travel_counsellors_nos,
                r.main_invite_influencers_nos
           FROM rsvp_main_invite r
           JOIN projects p ON r.project_id = p.id
           WHERE r.project_id = $1 AND p.created_by = $2
           ORDER BY r.created_at`,
        [projectId, user.id]
      );
    } else {
      result = await pool.query(
        `SELECT r.project_id,
                r.main_invite_design_file_path,
                TO_CHAR(r.main_invite_date, 'YYYY-MM-DD') AS main_invite_date,
                r.main_invite_ta_nos,
                r.main_invite_to_nos,
                r.main_invite_travel_counsellors_nos,
                r.main_invite_influencers_nos
           FROM rsvp_main_invite r
          WHERE r.project_id = $1
          ORDER BY r.created_at`,
        [projectId]
      );
    }

    return result.rows;
  } catch (error) {
    console.error('Error fetching Main Invite:', error);
    return [];
  }
},


updateMainInvite: async (projectId, mainInviteArray, userId, filePath = null) => {
  // Verify project access
  const project = await pool.query(
    'SELECT id FROM projects WHERE id = $1 AND created_by = $2',
    [projectId, userId]
  );
  if (project.rows.length === 0) {
    throw new Error('Project not found or access denied');
  }

  // Remove previous records
  await pool.query('DELETE FROM rsvp_main_invite WHERE project_id = $1', [projectId]);

  // Insert new ones
  for (const item of mainInviteArray) {
    await pool.query(
      `INSERT INTO rsvp_main_invite (
        project_id,
        main_invite_design_file_path,
        main_invite_date,
        main_invite_ta_nos,
        main_invite_to_nos,
        main_invite_travel_counsellors_nos,
        main_invite_influencers_nos
      ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        projectId,
        filePath || null,
        item.main_invite_date || null,
        item.main_invite_ta_nos || 0,
        item.main_invite_to_nos || 0,
        item.main_invite_travel_counsellors_nos || 0,
        item.main_invite_influencers_nos || 0
      ]
    );
  }

  return await Project.getMainInvite(projectId, { id: userId, role: '1' });
},



  // AV Setup - Basic implementation for now
  getAVSetup: async (projectId, user) => {
    try {
        let result;
  if(user.role==='1'){
        result = await pool.query(
        `SELECT av.* FROM av_setup av 
         JOIN projects p ON av.project_id = p.id 
         WHERE av.project_id = $1 AND p.created_by = $2`,
        [projectId, user.id]
      );
    }
    else {
      result =  await pool.query(
        `SELECT av.* FROM av_setup av 
         JOIN projects p ON av.project_id = p.id 
         WHERE av.project_id = $1`,
        [projectId]
      );
    }
      return result.rows[0] || {};
    } catch (error) {
      // If table doesn't exist yet, return empty object
      console.log('AV Setup table might not exist yet, returning empty object');
      return {};
    }
  },

  // Embassy - Basic implementation for now
  getEmbassy: async (projectId, user) => {
    try {
       let result;
  if(user.role==='1'){
        result =  await pool.query(
        `SELECT e.* FROM embassy e 
         JOIN projects p ON e.project_id = p.id 
         WHERE e.project_id = $1 AND p.created_by = $2`,
        [projectId, user.id]
      );
    }
    else{
      result =  await pool.query(
        `SELECT e.* FROM embassy e 
         JOIN projects p ON e.project_id = p.id 
         WHERE e.project_id = $1`,
        [projectId]
      );
    }
      return result.rows[0] || {};
    } catch (error) {
      // If table doesn't exist yet, return empty object
      console.log('Embassy table might not exist yet, returning empty object');
      return {};
    }
  },

  // Client - Basic implementation for now
updateClient: async (projectId, clients, user) => {
    // First, verify project access
//console.log('updateassocia  proj mode',user.id,user.role);
     let project;
  if(user.role === '1'){
        
    project  = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND created_by = $2',
      [projectId, user.id]
    );
  }
  else{
    project = await pool.query(
      'SELECT id FROM projects WHERE id = $1',
      [projectId]
    );
  }

    if (project.rows.length === 0) {
      throw new Error('Project not found or access denied');
    }

    // Delete existing clients
    await pool.query('DELETE FROM client WHERE project_id = $1', [projectId]);

    // Insert new client
    for (const client of clients) {
      await pool.query(
        'INSERT INTO client (project_id, name, designation, contact, hotel) VALUES ($1, $2, $3, $4, $5)',
        [projectId, client.name, client.designation, client.contact, client.hotel]
      );      
    }

    return await Project.getClients(projectId, user);
  },

 // Stark - Basic implementation for now
updateStark: async (projectId, starks, user) => {
    // First, verify project access
//console.log('updateassocia  proj mode',user.id,user.role);
     let project;
  if(user.role === '1'){
        
    project  = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND created_by = $2',
      [projectId, user.id]
    );
  }
  else{
    project = await pool.query(
      'SELECT id FROM projects WHERE id = $1',
      [projectId]
    );
  }

    if (project.rows.length === 0) {
      throw new Error('Project not found or access denied');
    }

    // Delete existing clients
    await pool.query('DELETE FROM stark WHERE project_id = $1', [projectId]);

    // Insert new client
    for (const stark of starks) {
      await pool.query(
        'INSERT INTO stark (project_id, name, hotel) VALUES ($1, $2, $3)',
        [projectId, stark.name,  stark.hotel]
      );      
    }

    return await Project.getStarks(projectId, user);
  },

  getClients: async (projectId, user) => {
    console.log('getclient',projectId,user.id);
    try {
       let result;
  if(user.role==='1'){
        result = await pool.query(
        `SELECT c.* FROM client c 
         JOIN projects p ON c.project_id = p.id 
         WHERE c.project_id = $1 AND p.created_by = $2`,
        [projectId, user.id]
      );
    }
    else{
       result = await pool.query(
        `SELECT c.* FROM client c 
         JOIN projects p ON c.project_id = p.id 
         WHERE c.project_id = $1`,
        [projectId]
      );
    }
      return result.rows;
    } catch (error) {
      // If table doesn't exist yet, return empty object
      console.log('Client table might not exist yet, returning empty object');
      return {};
    }
  },
  getStarks: async (projectId, user) => {
    console.log('getstark',projectId,user.id);
    try {
       let result;
  if(user.role==='1'){
        result = await pool.query(
        `SELECT s.* FROM stark s 
         JOIN projects p ON s.project_id = p.id 
         WHERE s.project_id = $1 AND p.created_by = $2`,
        [projectId, user.id]
      );
    }
    else{
       result = await pool.query(
        `SELECT s.* FROM stark s 
         JOIN projects p ON s.project_id = p.id 
         WHERE s.project_id = $1`,
        [projectId]
      );
    }
      return result.rows;
    } catch (error) {
      // If table doesn't exist yet, return empty object
      console.log('Stark table might not exist yet, returning empty object');
      return {};
    }
  },
  //Menu
  getMenu: async (projectId, user) => {
    console.log('getmenu',projectId,user.id);
    try {
       let result;
  if(user.role==='1'){
        result = await pool.query(
        `SELECT m.* FROM menu_files m 
         JOIN projects p ON m.project_id = p.id 
         WHERE m.project_id = $1 AND p.created_by = $2`,
        [projectId, user.id]
      );
    }
    else{
       result = await pool.query(
        `SELECT m.* FROM menu_files m 
         JOIN projects p ON m.project_id = p.id 
         WHERE m.project_id = $1`,
        [projectId]
      );
    }
      return result.rows;
    } catch (error) {
      // If table doesn't exist yet, return empty object
      console.log('menu_files table might not exist yet, returning empty object');
      return {};
    }
  },
//Checklists

  getChecklists: async (projectId, user) => {

    let result;
  if(user.role==='1'){
        result = await pool.query(
      `SELECT a.* FROM checklists a 
       JOIN projects p ON a.project_id = p.id 
       WHERE a.project_id = $1 AND p.created_by = $2 
       ORDER BY a.created_at`,
      [projectId, user.id]
    );
  }
  else{
    result = await pool.query(
      `SELECT a.* FROM checklists a  
       JOIN projects p ON a.project_id = p.id 
       WHERE a.project_id = $1 
       ORDER BY a.created_at`,
      [projectId]
    );
  }

    return result.rows;
  },
   updateChecklists: async (projectId, checklists, user) => {
    // First, verify project access
     let project;
  if(user.role === '1'){
        
    project  = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND created_by = $2',
      [projectId, user.id]
    );
  }
  else{
    project = await pool.query(
      'SELECT id FROM projects WHERE id = $1',
      [projectId]
    );
  }

    if (project.rows.length === 0) {
      throw new Error('Project not found or access denied');
    }

    // Delete existing checklists
    await pool.query('DELETE FROM checklists WHERE project_id = $1', [projectId]);

    // Insert new checklists
    for (const checklist of checklists) {
      await pool.query(
        'INSERT INTO checklists (project_id, name,  selected) VALUES ($1, $2, $3)',
        [projectId, checklist.name,  checklist.selected || false]
      );      
    }

    return await Project.getChecklists(projectId, user);
  },

  // INDIVIDUAL UPDATE METHODS FOR EACH SECTION

  // Update Roadshow Information only
  updateRoadshowInfo: async (projectId, roadshowData, userId) => {
    
    
    // const { roadshow_name,  city, month, year, associate, budget, associate_graduate_no, embassy_donbear_no } = roadshowData;

     const { roadshow_name,  event_date,  budget, project_handiled_by, image_file  } = roadshowData;
    // Check if project exists and user has access
    const project = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND created_by = $2',
      [projectId, userId]
    );
console.log('pronmodel',projectId,JSON.stringify( roadshowData), userId);
    if (project.rows.length === 0) {
      throw new Error('Project not found or access denied');
    }

    // Check if details already exist
    const existingDetails = await pool.query(
      'SELECT id FROM project_details WHERE project_id = $1',
      [projectId]
    );

    if (existingDetails.rows.length > 0) {
      // Update existing
    //  console.log("🟡 Updating project_details...");
      const result = await pool.query(
        `UPDATE project_details 
         SET roadshow_name = $1, event_date = $2,
              budget = $3,project_handiled_by=$4,
             updated_at = CURRENT_TIMESTAMP 
         WHERE project_id = $5 RETURNING *`,
        [roadshow_name,  event_date,  budget, project_handiled_by, projectId]
      );  
     // console.log("✅ Updated project_details:", result.rows[0]);
     // console.log("🟣 Updating projects table...");
            await pool.query(
          `UPDATE projects 
          SET name = $1,
              event_date = $2,
               image_file = COALESCE($3, image_file),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $4`,
          [roadshow_name || '', event_date || null, image_file || null, projectId]
        );
      //   console.log("✅ Updated projects:", result.rows[0]);
      return result.rows[0];
    } else {
      // Insert new
      const result = await pool.query(
        `INSERT INTO project_details (project_id, roadshow_name,   event_date, budget,project_handiled_by) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [projectId, roadshow_name,   event_date,  budget, project_handiled_by]
      );

      // ✅ Also update project table for consistency
      await pool.query(
        `UPDATE projects 
         SET name = $1,
             event_date = $2,
             image_file = COALESCE($3, image_file),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [roadshow_name || '', event_date || null, image_file || null, projectId]
      );
      
      return result.rows[0];
    }
  },

  // Update Associates only
  updateAssociatesOnly: async (projectId, associates, userId) => {

    console.log(`updateAssociatesOnly:`, projectId,  userId);
    // Verify project access
    const project = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND created_by = $2',
      [projectId, userId]
    );

    if (project.rows.length === 0) {
      throw new Error('Project not found or access denied');
    }

    //const project = projectCheck.rows[0];
   // console.log(`Project found:`, project.rows[0]);

    // Then check if user has access (either creator or check your permission logic)
    if (project.created_by !== userId) {
      throw new Error(`User ${userId} does not have access to project ${projectId}. Project created by ${project.created_by}`);
    }
    // Delete existing associates
    await pool.query('DELETE FROM associates WHERE project_id = $1', [projectId]);

    // Insert new associates
    for (const associate of associates) {
      await pool.query(
        'INSERT INTO associates (project_id, name,  selected) VALUES ($1, $2, $3)',
        [projectId, associate.name,  associate.selected || false]
      );       
    }

    return await Project.getAssociates(projectId, userId);
  },

  // Update Venues only
  updateVenuesOnly: async (projectId, venues, userId) => {
    // Verify project access
    const project = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND created_by = $2',
      [projectId, userId]
    );

    if (project.rows.length === 0) {
      throw new Error('Project not found or access denied from updateVenuesOnly');
    }

    // Delete existing venues
    await pool.query('DELETE FROM venues WHERE project_id = $1', [projectId]);

const cleanNumeric = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return value;

  // Remove spaces and thousand separators
  let clean = value.toString().trim().replace(/\s/g, "");

  // Remove spaces and thousand separators safely
  // Case 1: European style 1.234,56 → convert to 1234.56
  if (/,\d{1,2}$/.test(clean))  {
    clean = clean.replace(/\./g, "").replace(",", ".");
  }
  // Case 2: Normal style 1,234.56 → convert to 1234.56
  else if (/,/.test(clean)) {
    clean = clean.replace(/,/g, "");
  }

  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};


    // Insert new venues
    for (const venue of venues) {
      await pool.query(
        'INSERT INTO venues (project_id, name, currency,rate, budget, selected) VALUES ($1, $2, $3, $4, $5, $6)',
        [projectId, venue.name, venue.currency,cleanNumeric(venue.rate), cleanNumeric(venue.budget), venue.selected || false]
      );       
    }

    return await Project.getVenues(projectId, userId);
  },

  // Update Trade Database only
  updateTradeDatabaseOnly: async (projectId, tradeDatabase, userId) => {
    // Verify project access
    const project = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND created_by = $2',
      [projectId, userId]
    );

    if (project.rows.length === 0) {
      throw new Error('Project not found or access denied');
    }

    // Delete existing trade database
    await pool.query('DELETE FROM trade_database WHERE project_id = $1', [projectId]);

    // Insert new trade database
    for (const trade of tradeDatabase) {
      await pool.query(
        'INSERT INTO trade_database (project_id, trade_name, travel_operator,travel_agent,travel_counsellor,media_influencers) VALUES ($1, $2, $3, $4, $5, $6)',
        [projectId, trade.trade_name, trade.travel_operator,trade.travel_agent,trade.travel_counsellor,trade.media_influencers]
      );      
    }

    return await Project.getTradeDatabase(projectId, userId);
  },

  /* Update RSVP only
  updateRSVPOnly: async (projectId, rsvp, userId) => {
    // Verify project access
    const project = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND created_by = $2',
      [projectId, userId]
    );

    if (project.rows.length === 0) {
      throw new Error('Project not found or access denied');
    }

    // Delete existing RSVP
    await pool.query('DELETE FROM rsvp WHERE project_id = $1', [projectId]);

    // Insert new RSVP
    for (const item of rsvp) {
      await pool.query(
        'INSERT INTO rsvp (project_id, date, nos) VALUES ($1, $2, $3)',        
        [projectId, item.date, item.nos]
      );      
    }

    return await Project.getRSVP(projectId, userId);
  },*/

  updateRSVPOnly: async (projectId, rsvpArray, userId, filePath = null) => {
  // Verify project access
  const project = await pool.query(
    'SELECT id FROM projects WHERE id = $1 AND created_by = $2',
    [projectId, userId]
  );

  if (project.rows.length === 0) {
    throw new Error('Project not found or access denied');
  }

  // Always delete old RSVP rows
  await pool.query('DELETE FROM rsvp WHERE project_id = $1', [projectId]);

  // Reinsert each new RSVP record
  for (const item of rsvpArray) {
    await pool.query(
      `INSERT INTO rsvp (
        project_id, 
        invitation_design_file_path,
        save_the_date,
        save_the_date_confirmation_date,
        save_the_date_ta_nos,
        save_the_date_to_nos,
        save_the_date_travel_counsellors_nos,
        save_the_date_influencers_nos       
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8
      )`,
      [
        projectId,
        filePath || null,
        item.save_the_date || null,
        item.save_the_date_confirmation_date || null,
        item.save_the_date_ta_nos || 0,
        item.save_the_date_to_nos || 0,
        item.save_the_date_travel_counsellors_nos || 0,
        item.save_the_date_influencers_nos || 0       
      ]
    );
  }
 //save_the_date_total_nos,
     //   main_invitation_date,
       // main_invitation_confirmation_date,
      //  main_invitation_ta_nos,
       // main_invitation_to_nos,
      //  main_invitation_travel_counsellors_nos,
      //  main_invitation_influencers_nos,
       // main_invitation_total_nos
  // Return updated list
  return await Project.getRSVP(projectId, { id: userId, role: '1' });
},


  /* Update AV Setup only
  updateAVSetupOnly: async (projectId, avSetup, userId) => {
    const { backdrop, backdropImage, screen, screenImage, stageImage, mic, type, projector, stage, podium } = avSetup;
    // Verify project access
    const project = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND created_by = $2',
      [projectId, userId]
    );

    if (project.rows.length === 0) {
      throw new Error('Project not found or access denied');
    }

    // Check if AV setup already exists
    const existingAV = await pool.query(
      'SELECT id FROM av_setup WHERE project_id = $1',
      [projectId]
    );

    if (existingAV.rows.length > 0) {
      // Update existing backdrop: '',    screen: '',    mic: '',    type:'',    projector: false,    podium: false,    stage: ''
      const result = await pool.query(
        `UPDATE av_setup 
         SET backdrop = $1, screen = $2, mic = $3, type = $4, projector = $5, stage = $6 , podium= $7
         WHERE project_id = $8 RETURNING *`,
        [avSetup.backdrop, avSetup.screen, avSetup.mic, avSetup.type, avSetup.projector, avSetup.stage, avSetup.podium, projectId]
      );
      return result.rows[0];
    } else {
      // Insert new
      const result = await pool.query(
        `INSERT INTO av_setup (project_id, backdrop, screen, mic, type, projector, stage, podium) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [projectId, avSetup.backdrop, avSetup.screen, avSetup.mic, avSetup.type, avSetup.projector, avSetup.stage, avSetup.podium]
      );
      return result.rows[0];
    }
  },*/

  // Update Embassy only
  updateEmbassyOnly: async (projectId, embassy, userId) => {
    // Verify project access
    const project = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND created_by = $2',
      [projectId, userId]
    );

    if (project.rows.length === 0) {
      throw new Error('Project not found or access denied');
    }

    // Check if embassy already exists
    const existingEmbassy = await pool.query(
      'SELECT id FROM embassy WHERE project_id = $1',
      [projectId]
    );

    if (existingEmbassy.rows.length > 0) {
      // Update existing
      const result = await pool.query(
        `UPDATE embassy 
         SET cheif_guest = $1, cheif_guest_designation = $2,cheif_guest_phone=$3, accommodation_contact = $4, 
          accommodation_address = $5, accommodation_phone = $6
         WHERE project_id = $7 RETURNING *`,
        [embassy.cheif_guest, embassy.cheif_guest_designation, embassy.cheif_guest_phone,embassy.accommodation_contact,
         embassy.accommodation_address,embassy.accommodation_phone,  projectId]        
      );      
      return result.rows[0];
    } else {
      // Insert new
      const result = await pool.query(
        `INSERT INTO embassy (project_id, cheif_guest, cheif_guest_designation, cheif_guest_phone,accommodation_contact,
        accommodation_address,accommodation_phone) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [projectId, embassy.cheif_guest, embassy.cheif_guest_designation,embassy.cheif_guest_phone, embassy.accommodation_contact,
          embassy.accommodation_address,embassy.accommodation_phone]
      );
      return result.rows[0];
    }
  },

  updateAVSetupOnly: async (projectId, avSetup, userId) => {
  const { backdrop, backdrop_image, screen, screen_image, stage_image, mic, type, projector, podium } = avSetup;

  // Verify project access
  const project = await pool.query(
    'SELECT id FROM projects WHERE id = $1 AND created_by = $2',
    [projectId, userId]
  );

  if (project.rows.length === 0) {
    throw new Error('Project not found or access denied');
  }

  // Check if AV setup already exists
  const existingAV = await pool.query(
    'SELECT id FROM av_setup WHERE project_id = $1',
    [projectId]
  );

  if (existingAV.rows.length > 0) {
    // ✅ UPDATE existing record
    const result = await pool.query(
      `UPDATE av_setup 
       SET 
         backdrop = $1, 
         screen = $2, 
         mic = $3, 
         type = $4, 
         projector = $5,
         podium = $6,
         backdrop_image = $7, 
         screen_image = $8, 
         stage_image = $9
       WHERE project_id = $10 
       RETURNING *`,
      [
        backdrop,
        screen,
        mic,
        type,
        projector,      
        podium,
        backdrop_image,
        screen_image,
        stage_image,
        projectId
      ]
    );
    return result.rows[0];
  } else {
    // ✅ INSERT new record
    const result = await pool.query(
      `INSERT INTO av_setup 
        (project_id, backdrop, screen, mic, type, projector, podium, backdrop_image, screen_image, stage_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        projectId,
        backdrop,
        screen,
        mic,
        type,
        projector,        
        podium,
        backdrop_image,
        screen_image,
        stage_image
      ]
    );
    return result.rows[0];
  }
},


  // Update Client only
  updateClientOnly: async (projectId, clients, user) => {
    // Verify project access
    let project;
    if (user.role === '1') {
    project = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND created_by = $2',
      [projectId, user.id]
    );

    } else {
    project = await pool.query('SELECT id FROM projects WHERE id = $1', [projectId]);
  }

    if (project.rows.length === 0) {
      throw new Error('Project not found or access denied');
    }

    // Check if client already exists
    {/*const existingClient = await pool.query(
      'SELECT id FROM client WHERE project_id = $1',
      [projectId]
    );

    if (existingClient.rows.length > 0) {
      // Update existing
      const result = await pool.query(
        `UPDATE client 
         SET name = $1, hotel = $2, address = $3 
         WHERE project_id = $4 RETURNING *`,
        [clients.name, clients.hotel, clients.address, projectId]
      );      
      return result.rows[0];
    } else {
      // Insert new
      const result = await pool.query(
        `INSERT INTO client (project_id, name, hotel, address) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [projectId, clients.name, clients.hotel, clients.address]
      );
      return result.rows[0];
    }*/}
    // ✅ Clear existing client records
  await pool.query('DELETE FROM client WHERE project_id = $1', [projectId]);

  // ✅ Insert all new clients
  for (const client of clients) {
    await pool.query(
      `INSERT INTO client (project_id, name, designation, contact, hotel)
       VALUES ($1, $2, $3, $4, $5)`,
      [projectId, client.name, client.designation, client.contact,client.hotel]
    );
  }

  // ✅ Return the updated list
  const result = await pool.query(
    'SELECT * FROM client WHERE project_id = $1 ORDER BY id',
    [projectId]
  );
   return result.rows;
  },

  // Menu file upload method
  saveMenuFile: async (projectId, fileData, userId) => {
    // Verify project access
    const project = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND created_by = $2',
      [projectId, userId]
    );

    if (project.rows.length === 0) {
      throw new Error('Project not found or access denied');
    }

    // Check if client already exists
    const menuFile = await pool.query(
      'SELECT id FROM menu_files WHERE project_id = $1',
      [projectId]
    );

    if (menuFile.rows.length > 0) {
      // Update existing
      //originalname: req.file.originalname,
       // mimetype: req.file.mimetype,
       // size: req.file.size,
       // path: req.file.path
      const result = await pool.query(
        `UPDATE menu_files 
         SET filename = $1, mime_type = $2,file_size= $3, file_path = $4 
         WHERE project_id = $5 RETURNING *`,
        [fileData.filename, fileData.mime_type, fileData.size, fileData.path, projectId]
      );      
      return result.rows[0];
    } else {
      // Insert new
      const result = await pool.query(
        `INSERT INTO menu_files (project_id,filename,mime_type, file_size, file_path) 
         VALUES ($1, $2, $3, $4,$5) RETURNING *`,
        [projectId, fileData.filename, fileData.mime_type, fileData.size, fileData.path]
      );
      return result.rows[0];
    }

    // For now, we'll just log the file info
    // In production, you would save the file to disk or cloud storage
    //console.log('Menu file upload for project:', projectId);
    //console.log('File data:', fileData);
    // Return success message
    //return { message: 'Menu file uploaded successfully', filename: fileData.originalname };
  },

   addRemark: async (data) => {
    //console.log('addingremark data',JSON.stringify(data));
    const { project_id, remarktext, userid } = data;
    const query = `
      INSERT INTO remark (project_id, remarktext, userid, isapproved, created_at)
      VALUES ($1, $2, $3, false, CURRENT_TIMESTAMP)
      RETURNING *;
    `;
    const result = await pool.query(query, [project_id, remarktext, userid]);
    return result.rows[0];
  },

  getRemarksByProject: async (projectId) => {
  const query = `
    SELECT r.*, u.name AS username
    FROM remark r
    LEFT JOIN users u ON r.userid = u.id
    WHERE r.project_id = $1
    ORDER BY r.created_at DESC;
  `;

  //console.log('Executing SQL query:', query, 'with projectId =', projectId);
  const result = await pool.query(query, [projectId]);
  //console.log('Query result rows:', result.rows);
  return result.rows;
} 
,
resolveRemark: async (req, res) => {
  try {
    const remarkId = req.params.id;
    const updated = await Project.toggleRemarkStatus(remarkId);
    //console.log('resolveRemark-updated',updated)

    if (!updated) {
      return res.status(404).json({ message: "Remark not found" });
    }

    res.status(200).json({
      message: updated.isapproved ? "Remark marked as resolved" : "Remark marked as pending",
      remark: updated,
    });
  } catch (err) {
    console.error("Error toggling remark status:", err);
    res.status(500).json({ message: "Failed to update remark status", error: err.message });
  }
},
// Mark remark as resolved by admin
toggleRemarkStatus: async (remarkId) => {
  const getQuery = `SELECT isapproved FROM remark WHERE id = $1`;
  const current = await pool.query(getQuery, [remarkId]);
  if (current.rows.length === 0) return null;

  const newStatus = !current.rows[0].isapproved;
 console.log('toggleRemarkStatus-newStatus',newStatus)
  const updateQuery = `
    UPDATE remark
    SET isapproved = $1, adminapproved_date = NOW()::date
    WHERE id = $2
    RETURNING *;
  `;
  const result = await pool.query(updateQuery, [newStatus, remarkId]);
  return result.rows[0];
},

calculateProgress: async (projectId) => {
  try {
    // Each table represents one “section” in your project
    const sections = [
      'project_details',
      'associates',
      'venues',
      'trade_database',
      'client',
      'av_setup',
      'rsvp',
      'rsvp_main_invite',
      'embassy',
      'client',
      'stark',
      'hotels',
      'checklists'    
    ];
    const cleanId = parseInt(String(projectId).replace(/[^0-9]/g, ''), 10);
  if (isNaN(cleanId)) throw new Error(`Invalid project ID: ${projectId}`);

    let completed = 0;

    for (const table of sections) {
      const result = await pool.query(`SELECT 1 FROM ${table} WHERE project_id = $1 LIMIT 1`, [cleanId]);
      if (result.rows.length > 0) {
        completed++;
      }
    }

    const total = sections.length;
    const progress = Math.round((completed / total) * 100);

    //console.log(`📊 Project ${projectId} Progress: ${completed}/${total} → ${progress}%`);

    return progress;
  } catch (error) {
    console.error('Error calculating project progress:', error);
    return 0;
  }
},

};

module.exports = Project;