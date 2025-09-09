const express = require('express');

const Repository = require('../common/Repository')
const AsyncHandler = require('../middleware/AsyncHandler');
const AuthenticationMiddleware = require('../middleware/AuthenticationMiddleware');
const FileUpload = require('../middleware/FileUpload');

const router = express.Router();

router.post("/upload-image", AuthenticationMiddleware, FileUpload.single('image'), AsyncHandler(async (req, res) => {
    res.status(201).json(await Repository.uploadImage(req?.file));
}));

router.post("/generate-story", AuthenticationMiddleware, AsyncHandler(async (req, res) => {
    res.status(201).json(await Repository.generateStory(req.body));
}));

router.get("/stream", AsyncHandler(async (req, res) => {
    const range = req.headers.range;
    //const filename = req.query.filename;
    const filename = "exp10.webm";
    try {
        const { statusCode, headers, stream } = await Repository.streamVideo(filename, range);

        res.writeHead(statusCode, headers);
        stream.pipe(res);
    } catch (err) {
        if (err.message === 'VIDEO_NOT_FOUND') {
            return res.status(404).send('Video not found');
        }
        res.status(500).send('Internal server error');
    }
}));

router.get('/download-file', AsyncHandler(async (req, res) => {
    const { filePath, fileName } = Repository.downloadFile(req.query);

    // res.download handles setting Content-Disposition + streaming
    res.download(filePath, fileName, (err) => {
        if (err) {
            console.error('Download failed:', err);
            res.status(404).send('File not found or inaccessible.');
        }
    });
}));

module.exports = router;