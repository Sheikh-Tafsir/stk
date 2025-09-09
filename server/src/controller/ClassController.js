const express = require('express');

const AsyncHandler = require('../middleware/AsyncHandler');
const AuthenticationMiddleware = require('../middleware/AuthenticationMiddleware');
const AuthorizationMiddleware = require('../middleware/AuthorizationMiddleware');
const ClassService = require('../service/ClassService')
const { UserRole } = require('../utils/Enum');

const router = express.Router();

router.get("", AuthenticationMiddleware, AuthorizationMiddleware(UserRole.PATIENT), AsyncHandler(async (req, res) => {
    res.status(200).json(await ClassService.findAllByUserId(req.user?.id));
}));

router.get("/:id", AuthenticationMiddleware, AuthorizationMiddleware(UserRole.PATIENT), AsyncHandler(async (req, res) => {
    res.status(200).json(await ClassService.findById(req.params?.id, req.user?.id));
}));

router.post("", AuthenticationMiddleware, AuthorizationMiddleware(UserRole.PATIENT), AsyncHandler(async (req, res) => {
    res.status(201).json(await ClassService.create(req.body, req.user?.id));
}));

router.put("/:id", AuthenticationMiddleware, AuthorizationMiddleware(UserRole.PATIENT), AsyncHandler(async (req, res) => {
    res.status(200).json(await ClassService.update(req.params?.id, req.body, req.user?.id));
}));

router.delete("/:id", AuthenticationMiddleware, AuthorizationMiddleware(UserRole.PATIENT), AsyncHandler(async (req, res) => {
    res.status(200).json(await ClassService.remove(req.params?.id, req.user?.id));
}));

module.exports = router;