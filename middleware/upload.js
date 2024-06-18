// 
// middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Set upload directory, use /tmp for serverless environments
const uploadDirectory = process.env.UPLOAD_DIRECTORY || '/tmp/uploads';

// Ensure the directory exists
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDirectory);
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // Limit file size to 1MB
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('resume');

// Check file type
function checkFileType(file, cb) {
    const filetypes = /pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Resumes only!');
    }
}

module.exports = upload;
