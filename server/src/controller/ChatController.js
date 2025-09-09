const express = require('express');

const AsyncHandler = require('../middleware/AsyncHandler');
const AuthenticationMiddleware = require('../middleware/AuthenticationMiddleware');
const ValidateNumericParams = require('../middleware/ValidateNumericParams');
const ChatService = require('../service/ChatService');

const router = express.Router();

router.get("", AuthenticationMiddleware, AsyncHandler(async (req, res) => {
    res.status(200).json(await ChatService.getAllChatsByUserId(req.user?.id, req?.query));
}));

router.get("/:id", ValidateNumericParams('id'), AuthenticationMiddleware, AsyncHandler(async (req, res) => {
    res.status(200).json(await ChatService.getChatById(req.params?.id, req.user?.id));
}));

router.get("/:id/messages", ValidateNumericParams('id'), AuthenticationMiddleware, AsyncHandler(async (req, res) => {
    res.status(200).json(await ChatService.getAllMessageByChatId(req.params?.id, req.user?.id));
}));

router.post("/:id/view", ValidateNumericParams('id'), AuthenticationMiddleware, AsyncHandler(async (req, res) => {
    res.status(201).json(await ChatService.seenChatMessage(req.params?.id, req.body, req.user?.id));
}));

module.exports = router;