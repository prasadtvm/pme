
# PME System
###Project Description
This project is Project Management Evaluation have following dependencies in backend
{
  "name": "backend",
  "version": "1.0.0",
  "description": "PME backend API server",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'No build step needed for backend'",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "Prasad Narayan",
  "license": "ISC",
  "dependencies": {
    "bcryptjs": "^3.0.2",
    "body-parser": "^2.2.0",
    "cloudinary": "^1.41.3",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.1.0",
    "jsonwebtoken": "^9.0.2",
    "multer": "^2.0.2",
    "multer-storage-cloudinary": "^4.0.0",
    "pg": "^8.16.3"
  },
  "devDependencies": {
    "nodemon": "^3.1.10"
  }
}
with creating api in which login have to check email and password 
if admin 1 ie role=1 then he will be having the right to add or edit projects but 
where a viewer 1 ie role=2 can see the projects readable only & can comment in remarks
This project is have following dependencies in frontend
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
"description": "PME Frontend - Roadshow Project Management System",
  "dependencies": {
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.0",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^13.5.0",
    "axios": "^1.12.2",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.9.3",
    "react-scripts": "^0.0.0",
    "web-vitals": "^2.1.4"
  },
  "type": "module",
  "scripts": {
    "dev": "vite",
    "start": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.4",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.37.0",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^6.1.1",
    "eslint-plugin-react-refresh": "^0.4.23",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.18",
    "vite": "^7.1.9"
  }
}

###Project Folder Structure
pme/
|_ProjectDescription.md
backend
|_config
|  |_databse.js
|  |_dbSchema.md
├─ server.js
├─ routes/
│  └─ auth.js
|  |_ project.js
├─ controllers/
│  └─ authController.js
|  |_projectController.js
|__middleware
|  |_ upload.js
|  |_auth.js
├─ models/
│  └─ projectModel.js
├─ package.json
|_frontend
|_src
| |_componensts
| | |_Login.jsx
| | |_ProjectDetails.jsx
| | |_ProjectPage.jsx
| | |_viewprojects.jsx
| |_services
| |  |_api.js
| |_styles
| |  |_App.css    
| |_App.js  



## Local Setup
cd backend && npm install
cd frontend && npm install
npm run dev

## Deploy
- Backend → Render
- Frontend → Vercel
- Environment variables listed in backend/.env.example and frontend/.env.example

