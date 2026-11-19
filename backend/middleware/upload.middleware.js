
const { upload } = require('../config/multer');

function setUploadFolder(folder) {
  return (req, res, next) => {
    req.uploadFolder = folder;
    next();
  };
}

// Optional single image upload
function optionalSingle(fieldName) {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  };
}

// Optional multiple fields upload
function optionalFields(fields) {
  return (req, res, next) => {
    upload.fields(fields)(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  };
}

module.exports = {
  setUploadFolder,
  optionalSingle,
  optionalFields,
};




















// const { upload } = require('../config/multer');

// function setUploadFolder(folder) {
//   return (req, res, next) => {
//     req.uploadFolder = folder;
//     next();
//   };
// }

// function optionalSingle(fieldName) {
//   return (req, res, next) => {
//     upload.single(fieldName)(req, res, (err) => {
//       if (err) return next(err);
//       next();
//     });
//   };
// }

// module.exports = { setUploadFolder, optionalSingle };
