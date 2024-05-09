const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/'); // Define the upload directory (create it if it doesn't exist)
    },
    filename: function (req, file, cb) {
        req.body.Imagename= Date.now() + '-' + file.originalname
        cb(null, Date.now() + '-' + file.originalname); // Define the filename
    }
});

const upload = multer({ storage: storage });





// Define storage configuration for category images
const categoryStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/categories/'); // Define the upload directory for category images
    },
    filename: function (req, file, cb) {
        // Rename the file with a unique name based on timestamp and original filename
        req.body.imageName = Date.now() + '-' + file.originalname;
        cb(null, req.body.imageName);
    }
});

// Create a Multer instance specifically for category image uploads
const categoryUpload = multer({ storage: categoryStorage });

module.exports = { storage, upload, categoryStorage, categoryUpload };
