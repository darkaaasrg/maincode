import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});


const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/gif') {
    cb(null, true);
  } else {
    cb(new Error('Дозволено завантажувати лише .jpeg, .jpg, .png або .gif'), false); // Відхилити
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10 
  },
  fileFilter: fileFilter
});

export default upload;