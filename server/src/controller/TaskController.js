const express = require('express');

const AsyncHandler = require('../middleware/AsyncHandler');
const AuthorizationMiddleware = require('../middleware/AuthorizationMiddleware');
const AuthenticationMiddleware = require('../middleware/AuthenticationMiddleware');
const FileUpload = require('../middleware/FileUpload');
const ValidateNumericParams = require('../middleware/ValidateNumericParams');
const TaskService = require('../service/TaskService');
const { UserRole } = require('../utils/Enum');

const router = express.Router();

router.get("", AuthenticationMiddleware, AuthorizationMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PATIENT), AsyncHandler(async (req, res) => {
    res.status(200).json(await TaskService.getAllTasksByUserId(req.user.id));
}));

router.post("", FileUpload.single('image'), AuthenticationMiddleware, AuthorizationMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PATIENT), AsyncHandler(async (req, res) => {
    res.status(201).json(await TaskService.simplifyTask(req.user?.id, req.body, req?.file));
}));

router.delete("/:id", ValidateNumericParams('id'), AuthorizationMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PATIENT), AsyncHandler(async (req, res) => {
    res.status(200).json(await TaskService.deleteTask(req.params.id));
}));

router.get("/:id", ValidateNumericParams('id'), AuthenticationMiddleware, AuthorizationMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PATIENT), AsyncHandler(async (req, res) => {
    res.status(200).json(await TaskService.getAllTodosByTaskId(parseInt(req.params?.id), req.user?.id));
}));

router.put("/:id/todos/:todoId", ValidateNumericParams('id', 'todoId'), AuthenticationMiddleware, AuthorizationMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PATIENT), AsyncHandler(async (req, res) => {
    res.status(200).json(await TaskService.updateTodoDone(parseInt(req.params?.id), parseInt(req.params?.todoId), req.body, req.user?.id));
}));


module.exports = router;
