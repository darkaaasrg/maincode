import multer from 'multer';
import path from 'path';

// 1. Налаштування сховища
const storage = multer.diskStorage({
  // Вказуємо папку, куди зберігати файли
  destination: function (req, file, cb) {
    // 'uploads/' — папка в корені 'backend'
    cb(null, 'uploads/'); 
  },
  // Генеруємо унікальне ім'я файлу
  filename: function (req, file, cb) {
    // Унікальне ім'я: [поточний час]-[оригінальна назва файлу]
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// 2. Фільтр файлів (дозволяємо лише зображення)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/gif') {
    cb(null, true); // Прийняти файл
  } else {
    cb(new Error('Дозволено завантажувати лише .jpeg, .jpg, .png або .gif'), false); // Відхилити
  }
};

// 3. Ініціалізація та експорт multer
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10 // Обмеження розміру файлу 5MB
  },
  fileFilter: fileFilter
});

export default upload;