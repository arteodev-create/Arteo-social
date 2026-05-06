const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const config = require('./Registry');

if (config.storage.cloudinary.url) {
    cloudinary.config(true);
} else {
    // Legacy fallback handled by Registry validation
    cloudinary.config(true); 
}

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'arteo_media',
        allowed_formats: 'jpg,png,jpeg,gif,webp,mp4',
        resource_type: 'auto'
    },
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };
