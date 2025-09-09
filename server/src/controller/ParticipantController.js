const express = require('express');

const Repository = require('../common/Repository');
const AsyncHandler = require('../middleware/AsyncHandler');
const AuthenticationMiddleware = require('../middleware/AuthenticationMiddleware');
const AuthorizationMiddleware = require('../middleware/AuthorizationMiddleware');
const ValidateNumericParams = require('../middleware/ValidateNumericParams');
const ValidateIdMatch = require('../middleware/ValidateParamsIdMatch')
const Participant = require('../model/Participant');
const { UserRole } = require('../utils/Enum');
const { DELETED } = require('../utils/Messages');
const { ApiMessageResponse } = require('../utils/Utils');
const ParticipantService = require('../service/ParticipantService');

const router = express.Router();

router.get("", AuthenticationMiddleware, AuthorizationMiddleware(UserRole.ADMIN, UserRole.CARE_GIVER), AsyncHandler(async (req, res) => {
    res.status(200).json(await ParticipantService.getAllByPagination(req.user?.id, req.query));
}));

router.get("/:id", ValidateNumericParams('id'), AuthenticationMiddleware, AuthorizationMiddleware(UserRole.ADMIN, UserRole.CARE_GIVER), AsyncHandler(async (req, res) => {
    res.status(200).json(await ParticipantService.getById(req.params?.id));
}));

router.put("/:id", ValidateNumericParams('id'), AuthenticationMiddleware, AuthorizationMiddleware(UserRole.ADMIN, UserRole.CARE_GIVER), ValidateIdMatch, AsyncHandler(async (req, res) => {
    res.status(200).json(await ParticipantService.update(req.params.id, req.body));
}));

router.delete("/:id", ValidateNumericParams('id'), AuthenticationMiddleware, AuthorizationMiddleware(UserRole.ADMIN, UserRole.CARE_GIVER), AsyncHandler(async (req, res) => {
    await Repository.remove(Participant, req.params.id);
    res.status(200).json(ApiMessageResponse(DELETED));
}));

router.get("/:id/gaze", ValidateNumericParams('id'), AuthenticationMiddleware, AuthorizationMiddleware(UserRole.ADMIN, UserRole.CARE_GIVER), AsyncHandler(async (req, res) => {
    res.status(200).json(await ParticipantService.getGazeById(req.params.id));
}));

router.get("/:id/predict", ValidateNumericParams('id'), AsyncHandler(async (req, res) => {
    res.status(200).json(await ParticipantService.getPredictionById(req.params?.id));
}));

module.exports = router;