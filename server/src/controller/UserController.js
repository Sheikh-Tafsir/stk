const express = require('express');

const AsyncHandler = require('../middleware/AsyncHandler');
const AuthenticationMiddleware = require('../middleware/AuthenticationMiddleware');
const FileUpload = require('../middleware/FileUpload');
const ValidateNumericParams = require('../middleware/ValidateNumericParams');
const UserService = require('../service/UserService');

const router = express.Router();

router.get("", AuthenticationMiddleware, AsyncHandler(async (req, res) => {
    res.status(200).json(await UserService.getAllByPagination(req.query));
}));

router.get("/all", AuthenticationMiddleware, AsyncHandler(async (req, res) => {
    res.status(200).json(await UserService.getAll(req.user.id));
}));

router.get("/:id", ValidateNumericParams('id'), AuthenticationMiddleware, AsyncHandler(async (req, res) => {
    res.status(200).json(await UserService.getById(req.params.id));
}));

router.put("/:id", ValidateNumericParams('id'), AuthenticationMiddleware, FileUpload.single("image"), AsyncHandler(async (req, res) => {
    res.status(200).json(await UserService.update(req.body, req?.file, req.params.id));
}));

router.delete("/:id", ValidateNumericParams('id'), AuthenticationMiddleware, AsyncHandler(async (req, res) => {
    res.status(200).json(await UserService.remove(req.params.id));
}));

module.exports = router;
