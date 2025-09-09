const express = require('express');

const AsyncHandler = require('../middleware/AsyncHandler');
const AuthenticationMiddleware = require('../middleware/AuthenticationMiddleware');
const AuthorizationMiddleware = require('../middleware/AuthorizationMiddleware');
const FileUpload = require('../middleware/FileUpload');
const ValidateNumericParams = require('../middleware/ValidateNumericParams');
const CareGiverService = require('../service/CareGiverService');
const { UserRole } = require('../utils/Enum');

const router = express.Router();

router.get("", AuthenticationMiddleware, AuthorizationMiddleware(UserRole.ADMIN), AsyncHandler(async (req, res) => {
    res.status(200).json(await CareGiverService.getAllByPagination(req.query));
}));

router.post("", AuthenticationMiddleware, AuthorizationMiddleware(UserRole.ADMIN), FileUpload.fields([{ name: 'image', maxCount: 1 }]), AsyncHandler(async (req, res) => {
    res.status(201).json(await CareGiverService.create(req.body));
}));

router.get("/:id", ValidateNumericParams('id'), AuthenticationMiddleware, AuthorizationMiddleware(UserRole.ADMIN, UserRole.CARE_GIVER), AsyncHandler(async (req, res) => {
    res.status(200).json(await CareGiverService.getById(req.params?.id));
}));

module.exports = router;