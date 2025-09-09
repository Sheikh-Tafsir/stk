const multer = require('multer');
const { RuntimeError } = require('../utils/Utils');
const MAX_SIZE = 5 * 1024 * 1024;

// FileUpload.single("image") → puts the file in req.file

// FileUpload.array("image") → puts files in req.files (array)

// FileUpload.fields([{ name: "avatar" }, { name: "cover" }]) → puts files in req.files.avatar, req.files.cover (array)
const FileUpload = multer({
    // dest: 'uploads/',
    limits: { fileSize: MAX_SIZE }, 
    // fileFilter: (req, file, cb) => {
    //   if (allowedImageTypes.includes(file.mimetype)) {
    //     cb(null, true);
    //   } else {
    //     cb(new RuntimeError(422, 'file type not allowed!'));
    //   }
    // },
});

module.exports = FileUpload