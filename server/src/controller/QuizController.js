const express = require('express');

const AsyncHandler = require('../middleware/AsyncHandler');
const AuthenticationMiddleware = require('../middleware/AuthenticationMiddleware');
const QuizService = require('../service/QuizService');
const AuthorizationMiddleware = require('../middleware/AuthorizationMiddleware');
const { UserRole } = require('../utils/Enum');

const router = express.Router();

router.get("", AuthenticationMiddleware, AuthorizationMiddleware(UserRole.PATIENT, UserRole.ADMIN), AsyncHandler(async (req, res) => {
    res.status(200).json(await QuizService.findByCourseAndDiff(req.query, req.user?.id));
}));

router.post("", AuthenticationMiddleware, AuthorizationMiddleware(UserRole.ADMIN), AsyncHandler(async (req, res) => {
    res.status(201).json(await QuizService.create(req.body));
}));

router.post("/:id/participate", AuthenticationMiddleware, AuthorizationMiddleware(UserRole.PATIENT), AsyncHandler(async (req, res) => {
    res.status(201).json(await QuizService.saveUserAnswers(req.body, req.user?.id));
}));


module.exports = router;