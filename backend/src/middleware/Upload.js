const Logger = require('../infra/logging/Logger.Service');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3: s3Client } = require('../config');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(process.cwd(), 'uploads');
const hasS3Storage = Boolean(s3Client && process.env.AWS_S3_BUCKET);

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
    cb(null, filename);
  }
});

const s3Storage = hasS3Storage
  ? multerS3({
      s3: s3Client,
      bucket: process.env.AWS_S3_BUCKET,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `${file.fieldname}/${uniqueSuffix}${path.extname(file.originalname)}`;
        cb(null, filename);
      }
    })
  : localStorage;

const upload = multer({
  storage: s3Storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // Majestic Standard: 100MB limit
  }
});

const encodePathSegment = (value) => encodeURIComponent(value).replace(/%2F/g, '/');

const buildInternalCdnUrl = (key) => `/api/cdn/${encodePathSegment(key)}`;

const sanitizeS3File = (file) => {
  if (!hasS3Storage) {
    file.url = `/uploads/${file.filename}`;
    file.location = file.url;
    return file;
  }

  const key = file.key;
  const cdnUrl = buildInternalCdnUrl(key);

  file.storageKey = key;
  file.url = cdnUrl;
  file.location = cdnUrl;
  return file;
};

const uploadMultipleFields = (fields) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.fields(fields);

    uploadMiddleware(req, res, (err) => {
      if (err) {
        Logger.error('Œ [Multer-S3 Error]:', err);
        return res.badRequest({
          message: err.message || 'File upload failed'
        });
      }

      if (req.files) {
        Object.keys(req.files).forEach(fieldName => {
          req.files[fieldName] = req.files[fieldName].map(file => sanitizeS3File(file));
        });
      }

      next();
    });
  };
};

const uploadAvatar = uploadMultipleFields([{ name: 'avatar', maxCount: 1 }]);
const uploadCoverPhoto = uploadMultipleFields([{ name: 'coverPhoto', maxCount: 1 }]);
const uploadSingleFile = (fieldName) => uploadMultipleFields([{ name: fieldName, maxCount: 1 }]);
const uploadPostMedia = uploadMultipleFields([
  { name: 'media', maxCount: 10 },
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 1 }
]);

const parseProfileJSON = (req, res, next) => {
  try {
    if (req.body.data) {
      try {
        const parsedData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
        Object.assign(req.body, parsedData);
        delete req.body.data;
      } catch (parseErr) {
        Logger.error('Œ Error parsing JSON from req.body.data:', parseErr.message);
      }
    }
    if (req.body.socialLinks && typeof req.body.socialLinks === 'string') {
      try {
        req.body.socialLinks = JSON.parse(req.body.socialLinks);
      } catch (parseErr) {}
    }
    next();
  } catch (error) {
    Logger.error('Œ [ParseProfileJSON Error]:', error.message);
    return res.badRequest({
      message: 'Invalid JSON format in profile data'
    });
  }
};

const deleteFile = async (key) => {
  if (!key) return;
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    });
    await s3Client.send(command);
  } catch (error) {
    Logger.error('Œ Error deleting file from S3:', error);
  }
};

const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('.amazonaws.com/')) return null;
  try {
    const parts = url.split('.amazonaws.com/');
    return parts[1];
  } catch (error) {
    return null;
  }
};

module.exports = {
  uploadMultipleFields,
  uploadAvatar,
  uploadCoverPhoto,
  uploadSingleFile,
  uploadPostMedia,
  deleteFile,
  getPublicIdFromUrl,
  parseProfileJSON
};
