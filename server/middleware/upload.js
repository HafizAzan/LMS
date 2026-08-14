const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const VIDEO_MIME = 'video/mp4';
const DOCUMENT_MIMES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype === VIDEO_MIME;

    return {
      folder: isVideo ? 'lms/videos' : 'lms/resources',
      resource_type: isVideo ? 'video' : 'raw',
      public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}`,
    };
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'video') {
    if (file.mimetype === VIDEO_MIME) {
      return cb(null, true);
    }
    return cb(new Error('Video must be an MP4 file'));
  }

  if (file.fieldname === 'resources') {
    if (DOCUMENT_MIMES.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error('Resources must be PDF or DOCX files'));
  }

  return cb(new Error('Unexpected file field'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 200 * 1024 * 1024 },
});

const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'lms/thumbnails',
    resource_type: 'image',
    public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}`,
  }),
});

const imageFilter = (req, file, cb) => {
  if (IMAGE_MIMES.includes(file.mimetype)) {
    return cb(null, true);
  }
  return cb(new Error('Thumbnail must be a JPEG, PNG, WEBP, or GIF image'));
};

const imageUpload = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const handleMulterError = (err, res, next) => {
  if (!err) {
    return next();
  }

  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large' });
  }

  return res.status(400).json({ message: err.message });
};

const uploadLessonFiles = (req, res, next) => {
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'resources', maxCount: 10 },
  ])(req, res, (err) => handleMulterError(err, res, next));
};

const uploadThumbnail = (req, res, next) => {
  imageUpload.single('thumbnail')(req, res, (err) =>
    handleMulterError(err, res, next),
  );
};

module.exports = { upload, uploadLessonFiles, uploadThumbnail };
