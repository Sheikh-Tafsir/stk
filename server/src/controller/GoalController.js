const express = require('express');

const AsyncHandler = require('../middleware/AsyncHandler');
const AuthenticationMiddleware = require('../middleware/AuthenticationMiddleware');
const AuthorizationMiddleware = require('../middleware/AuthorizationMiddleware');
const ValidateNumericParams = require('../middleware/ValidateNumericParams');
const GoalService = require('../service/GoalService');
const { UserRole } = require('../utils/Enum');
const router = express.Router();

router.get("", AuthenticationMiddleware, AuthorizationMiddleware(UserRole.PATIENT), AsyncHandler(async (req, res) => {
    res.status(200).json(await GoalService.findTodaysTasks(req.user?.id));
}));

router.get("/:id", ValidateNumericParams('id'), AuthenticationMiddleware, AuthorizationMiddleware(UserRole.PATIENT), AsyncHandler(async (req, res) => {
    res.status(200).json(await GoalService.findById(req.params?.id, req.user?.id));
}));

router.post("", AuthenticationMiddleware, AuthorizationMiddleware(UserRole.PATIENT), AsyncHandler(async (req, res) => {
    res.status(201).json(await GoalService.create(req.body, req.user?.id));
}));

router.put("/:id", ValidateNumericParams('id'), AuthenticationMiddleware, AuthorizationMiddleware(UserRole.PATIENT), AsyncHandler(async (req, res) => {
    res.status(200).json(await GoalService.update(req.params?.id, req.body, req.user?.id));
}));

router.put("/:id/check", ValidateNumericParams('id'), AuthenticationMiddleware, AuthorizationMiddleware(UserRole.PATIENT), AsyncHandler(async (req, res) => {
    res.status(200).json(await GoalService.updateCheck(req.params?.id, req.user?.id));
}));

router.delete("/:id", ValidateNumericParams('id'), AuthenticationMiddleware, AuthorizationMiddleware(UserRole.PATIENT), AsyncHandler(async (req, res) => {
    res.status(200).json(await GoalService.remove(req.params?.id, req.user?.id));
}));

module.exports = router;