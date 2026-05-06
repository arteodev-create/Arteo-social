const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('../../core/Errors');

const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|mp4|webm|ogg|mp3|wav/;
    const valid = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
    if (valid) return cb(null, true);
    cb(new AppError('Invalid file type.', 400));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = {
    upload,
    uploadSingle: (field) => upload.single(field),
    uploadMultiple: (field, max = 5) => upload.array(field, max),
    uploadFields: (fields) => upload.fields(fields)
};
