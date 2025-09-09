const express = require('express');

const AsyncHandler = require('../middleware/AsyncHandler');
const AuthenticationMiddleware = require('../middleware/AuthenticationMiddleware');
const FileUpload = require('../middleware/FileUpload');
const UserService = require('../service/UserService')

const router = express.Router();

router.get("", AuthenticationMiddleware, AsyncHandler(async (req, res) => {
    res.status(200).json(await UserService.getById(req.user?.id));
}));

router.put("", AuthenticationMiddleware, FileUpload.single("image"), AsyncHandler(async (req, res) => {
    res.status(200).json(await UserService.update(req.body, req?.file, req.user?.id));
}));

module.exports = router;