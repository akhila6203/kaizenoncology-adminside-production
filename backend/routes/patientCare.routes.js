const express=require('express');
const multer=require('multer');
const crypto=require('crypto');
const path=require('path');
const fs=require('fs');
const customerAuth=require('../middleware/customerPatientAuth');
const adminAuth=require('../middleware/auth.middleware');
const controller=require('../controllers/patientCare.controller');
const router=express.Router();

// const dir=path.join(__dirname,'../private-patient-files');fs.mkdirSync(dir,{recursive:true});
const dir = path.join(__dirname, "../uploads/patient-care");
fs.mkdirSync(dir, { recursive: true });

const allowed=new Set(['application/pdf','image/jpeg','image/png','image/webp','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

// const upload=multer({storage:multer.diskStorage({destination:dir,filename:(_,file,cb)=>cb(null,crypto.randomUUID())}),limits:{fileSize:10*1024*1024},fileFilter:(_,file,cb)=>cb(null,allowed.has(file.mimetype))});
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdir(dir, { recursive: true }, (err) => {
        cb(err, dir);
      });
    },

    filename: (req, file, cb) => {
      cb(null, crypto.randomUUID() + path.extname(file.originalname));
    },
  }),

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
  if (!allowed.has(file.mimetype)) {
    return cb(
      new Error(
        "Only PDF, JPG, JPEG, PNG, WEBP and Word documents are allowed."
      )
    );
  }

  cb(null, true);
},
});

router.get('/me',customerAuth,controller.me);
router.patch('/me/:section',customerAuth,controller.update);
router.post('/me/documents',customerAuth,upload.single('file'),controller.upload);
router.get('/me/documents/:documentId',customerAuth,controller.download);
router.delete('/me/documents/:documentId',customerAuth,controller.remove);
router.get('/admin',adminAuth,controller.list);
router.get('/admin/:id',adminAuth,controller.getOne);
router.patch('/admin/:id/:section',adminAuth,controller.update);
router.post('/admin/:id/documents',adminAuth,upload.single('file'),controller.upload);
router.get('/admin/:id/documents/:documentId',adminAuth,controller.download);
router.delete('/admin/:id/documents/:documentId',adminAuth,controller.remove);
module.exports=router;
