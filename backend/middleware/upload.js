const multer = require('multer');
//const path = require('path');
//const fs = require('fs');

const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

//  Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//  Dynamic folder mapping (like your old setup)
const getFolder = (req, file) => {
  const url = (req.originalUrl || '').toLowerCase();
console.log("🟣 Upload middleware reached", file.fieldname);
  if (url.includes('/menu') || file.fieldname === 'menu') return 'menu';
  if (url.includes('/rsvp') || file.fieldname === 'invitation_design_file') return 'rsvp';
  if (url.includes('/projects') || file.fieldname === 'image_file') return 'project';
  return 'misc';
};

//  Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: getFolder(req, file),
    public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`,
    resource_type: 'image', // ensures only images are uploaded
    format: 'png', // optional: force PNG output
  }),
});

//  Multer Upload Middleware
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 }, // 1 MB limit
  fileFilter: (req, file, cb) => {
    //console.log("Upload middleware reached image_file", file.fieldname);
    //console.log("☁️ Cloudinary:", cloudinary.config().cloud_name,cloudinary.config().api_key,cloudinary.config().api_secret);
    if (file.mimetype.startsWith('image/'))  cb(null, true);    
    else cb(new Error('Only image files are allowed!'), false);
  },  
});


// 🟢 Generic handler to wrap upload.single()
const handleUpload = (fieldName) => (req, res, next) => {
  const singleUpload = upload.single(fieldName);
  singleUpload(req, res, (err) => {
    if (err) {
      console.error(`❌ Upload error for ${fieldName}:`, err);
      return res.status(500).json({ error: err.message || 'Upload error' });
    }
    console.log(`✅ Upload successful for ${fieldName}. File:`, req.file ? req.file.originalname : 'none');
    next(); // pass control to next function (controller)
  });
};





//const UPLOAD_BASE = process.env.UPLOAD_DIR ? path.join(__dirname, '..', process.env.UPLOAD_DIR) : path.join(__dirname, '../uploads');

// Helper: dynamically create folder if missing
//const ensureFolder = (folderPath) => {
 // if (!fs.existsSync(folderPath)) {
 //   fs.mkdirSync(folderPath, { recursive: true });
//  }
//};

// Dynamic storage (based on route or request type)
//const storage = multer.diskStorage({
 // destination: (req, file, cb) => {
  //  let uploadPath = UPLOAD_BASE;

     //console.log('🔍 Upload request details:');
   // console.log('Original URL:', req.originalUrl);
   // console.log('Path:', req.path);
   // console.log('Body:', req.body);


    // Use route path or query param to choose subfolder
   // if (req.baseUrl.includes('menu')) {
   //   uploadPath = path.join(uploadPath, 'menu');
   // } else if (req.baseUrl.includes('project')) {
   //   uploadPath = path.join(uploadPath, 'project');
  //  }

     // Determine subfolder based on URL
    //if (req.originalUrl.includes('/projects') || req.body.type === 'project') {
    //  uploadPath = path.join(uploadPath, 'project');
    //} else if (req.originalUrl.includes('/menu') || req.body.type === 'menu') {
    //  uploadPath = path.join(uploadPath, 'menu');
    //}


     // Determine subfolder based on URL
    //if (req.originalUrl.includes('/projects') && req.originalUrl.includes('/menu')) {
    //  uploadPath = path.join(uploadPath, 'menu');
   // } else if (req.originalUrl.includes('/projects') && req.originalUrl.includes('/rsvp')) {
    //  uploadPath = path.join(uploadPath, 'rsvp'); // ✅ new folder for RSVP uploads
    //} else if (req.originalUrl.includes('/projects')) {
    //  uploadPath = path.join(uploadPath, 'project');
    //}

    // ✅ Folder selection logic
   // if (req.originalUrl.includes('/menu')) {
    //  uploadPath = path.join(uploadPath, 'menu');
   // } 
  //  else if (req.originalUrl.includes('/rsvp')) {
   //   uploadPath = path.join(uploadPath, 'rsvp');
  //  } 
   // else if (req.originalUrl.includes('/projects')) {
  //    uploadPath = path.join(uploadPath, 'project');
  //  }
 //console.log(`📁 Final upload path: ${uploadPath}`);
// determine subfolder heuristics
 //   const url = (req.originalUrl || '').toLowerCase();
 //   if (url.includes('/menu') || file.fieldname === 'menu') {
 //     uploadPath = path.join(uploadPath, 'menu');
 //   } else if (url.includes('/rsvp') || file.fieldname === 'invitation_design_file') {
 //     uploadPath = path.join(uploadPath, 'rsvp');
 //   } else if (url.includes('/projects') || file.fieldname === 'image_file') {
 //     uploadPath = path.join(uploadPath, 'project');
 //   } else {
      // default
  //    uploadPath = path.join(uploadPath, 'misc');
   // }
    // Ensure folder exists
   // ensureFolder(uploadPath);
  //  cb(null, uploadPath);
  //},
  //filename: (req, file, cb) => {
   // const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
   // //console.log("🖼️ Saving file:", uniqueName);
   // cb(null, uniqueName);
  //}
//});

// File filter: only allow images
//const imageFilter = (req, file, cb) => {
  //if (file.mimetype.startsWith('image/')) {
  //  cb(null, true);
  //} else {
 //   cb(new Error('Only image files are allowed'), false);
  //}
//};

// Multer upload instance
//const upload = multer({
 // storage,
  //limits: { fileSize: 1024 * 1024 }, // 1 MB
  //fileFilter: imageFilter,
//});
module.exports = {
  uploadProjectImage: handleUpload('image_file'),
  uploadMenuFile: handleUpload('menu'),
  uploadRSVPFile: handleUpload('invitation_design_file'),
};

