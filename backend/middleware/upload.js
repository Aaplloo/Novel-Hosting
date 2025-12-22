const multer = require('multer');
const path = require('path');

// Set up storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  let allowedTypes;

  if (file.fieldname === 'coverImage') {
    allowedTypes = /jpeg|jpg|png|gif/;
  } else {
    allowedTypes = /md|pdf/;
  }

  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    cb(null, true);
  } else {
    cb(new Error(`Error: Invalid file type for ${file.fieldname}!`));
  }
};

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: fileFilter,
});

module.exports = upload;
