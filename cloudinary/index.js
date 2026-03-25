const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

const hasCloudinaryConfig = process.env.CLOUDINARY_CLOUD_NAME
    && process.env.CLOUDINARY_KEY
    && process.env.CLOUDINARY_SECRET;

if (hasCloudinaryConfig) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECRET
    });
}

const storage = hasCloudinaryConfig
    ? new CloudinaryStorage({
        cloudinary,
        params: {
            folder: 'CityDiaries',
            allowedFormats: ['jpeg', 'png', 'jpg', 'webp']
        }
    })
    : multer.diskStorage({
        destination: path.join(__dirname, '..', 'public', 'uploads'),
        filename: (req, file, cb) => {
            const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-').toLowerCase()}`;
            cb(null, safeName);
        }
    });

module.exports = {
    cloudinary,
    storage,
    hasCloudinaryConfig,
    formatUploadedFiles(files = []) {
        if (hasCloudinaryConfig) {
            return files.map(file => ({ url: file.path, filename: file.filename }));
        }

        return files.map(file => ({
            url: `/uploads/${file.filename}`,
            filename: file.filename
        }));
    }
};
