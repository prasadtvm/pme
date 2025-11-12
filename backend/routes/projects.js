//console.log("✅ Using NEW projectController.createProject");
const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

//console.log('Loaded projectController keys:', Object.keys(projectController));
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
// All routes require authentication
router.use(auth);

// Specific routes first
router.get('/', projectController.getAllProjects);
router.post('/', upload.uploadProjectImage, projectController.createProject);
router.post('/remark', projectController.addRemark);
router.get('/remarks/:projectId', projectController.getRemarksByProject);

// Parameterized routes
router.get('/:id', projectController.getProjectById);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.get('/:id/details', projectController.getProjectDetails);
router.put('/:id/details', projectController.updateProjectDetails);

// Section update routes
router.put('/:id/roadshow',upload.uploadProjectImage, projectController.updateRoadshowInfo);
router.put('/:id/associates', projectController.updateAssociates);
router.put('/:id/venues', projectController.updateVenues);
router.put('/:id/trade-database', projectController.updateTradeDatabase);
router.put('/:id/rsvp', upload.uploadRSVPFile, projectController.updateRSVP);
router.put('/:id/maininvite', upload.uploadMainInviteFile, projectController.updateMainInvite);
router.put('/:id/av-setup',upload.uploadAvSetupFiles, projectController.updateAVSetup);
router.put('/:id/hotels', projectController.updateHotels);
router.put('/:id/embassy', projectController.updateEmbassy);
router.put('/:id/clients', projectController.updateClients);
router.put('/:id/checklists', projectController.updateChecklists);
router.post('/:id/menu', upload.uploadMenuFile, projectController.uploadMenu);
//remark resolve by admin
router.put('/remarks/:id/resolve',  projectController.resolveRemark);
router.get('/:id/progress', projectController.getProgress);

//router.post('/projects' projectController.createProject);

// 🆕 new route for saving remark
//router.post('/remark', projectController.addRemark);

//router.put('/:id/roadshow', projectController.updateRoadshowInfo);

//router.get('/', projectController.getAllProjects);
//router.get('/:id', projectController.getProjectById);
//router.post('/', projectController.createProject);
//router.put('/:id', projectController.updateProject);
//router.delete('/:id', projectController.deleteProject);
//router.get('/:id/details', projectController.getProjectDetails);
//router.put('/:id/details', projectController.updateProjectDetails);

//router.put('/:id/roadshow', projectController.updateRoadshowInfo);
//router.put('/:id/venues', projectController.updateVenues);
//router.put('/:id/trade-database', projectController.updateTradeDatabase);
//router.put('/:id/rsvp', projectController.updateRSVP);
//router.put('/:id/av-setup', projectController.updateAVSetup);
//router.put('/:id/embassy', projectController.updateEmbassy);
//router.put('/:id/client', projectController.updateClient);
//router.post('/:id/menu',auth,  _upload.single('menu'),projectController.uploadMenu);

// Fetch remarks by project ID
//router.get('/remarks/:projectId', projectController.getRemarksByProject);

module.exports = router;