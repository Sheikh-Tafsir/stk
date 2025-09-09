const express = require('express');

const AsyncHandler = require('../middleware/AsyncHandler');
const AuthenticationMiddleware = require('../middleware/AuthenticationMiddleware');
const ValidateNumericParams = require('../middleware/ValidateNumericParams');
const BudgetService = require('../service/BudgetService');
const AuthorizationMiddleware = require('../middleware/AuthorizationMiddleware');
const { UserRole } = require('../utils/Enum');
const router = express.Router();

router.get("/type", AuthenticationMiddleware, AuthorizationMiddleware(UserRole.PATIENT, UserRole.ADMIN), AsyncHandler(async (req, res) => {
    res.status(200).json(await BudgetService.findAllTypesByUserId(req.user?.id));
}));

router.get("/type/:id", ValidateNumericParams('id'), AuthenticationMiddleware, AuthorizationMiddleware(UserRole.PATIENT, UserRole.ADMIN), AsyncHandler(async (req, res) => {
    res.status(200).json(await BudgetService.findTypeById(req.params?.id, req.user?.id));
}));

router.post("/type", AuthenticationMiddleware, AuthorizationMiddleware(UserRole.PATIENT, UserRole.ADMIN), AsyncHandler(async (req, res) => {
    res.status(201).json(await BudgetService.createType(req.body, req.user?.id));
}));

router.put("/type/:id", ValidateNumericParams('id'), AuthenticationMiddleware, AuthorizationMiddleware(UserRole.PATIENT, UserRole.ADMIN), AsyncHandler(async (req, res) => {
    res.status(200).json(await BudgetService.updateType(req.params?.id, req.body, req.user?.id));
}));

router.delete("/type/:id", ValidateNumericParams('id'), AuthenticationMiddleware, AuthorizationMiddleware(UserRole.PATIENT, UserRole.ADMIN), AsyncHandler(async (req, res) => {
    res.status(200).json(await BudgetService.deleteType(req.params?.id, req.user?.id));
}));


router.get("/transaction", AuthenticationMiddleware, AuthorizationMiddleware(UserRole.PATIENT), AsyncHandler(async (req, res) => {
    res.status(200).json(await BudgetService.findAllTransactions(req.query, req.user?.id));
}));

router.get("/transaction/:id", ValidateNumericParams('id'), AuthenticationMiddleware, AuthorizationMiddleware(UserRole.PATIENT), AsyncHandler(async (req, res) => {
    res.status(200).json(await BudgetService.findTransactionById(req.params?.id, req.user?.id));
}));

router.post("/transaction", AuthenticationMiddleware, AuthorizationMiddleware(UserRole.PATIENT), AsyncHandler(async (req, res) => {
    res.status(201).json(await BudgetService.createTransaction(req.body, req.user?.id));
}));

router.put("/transaction/:id", ValidateNumericParams('id'), AuthenticationMiddleware, AuthorizationMiddleware(UserRole.PATIENT), AsyncHandler(async (req, res) => {
    res.status(200).json(await BudgetService.updateTransaction(req.params?.id, req.body, req.user?.id));
}));

router.delete("/transaction/:id", ValidateNumericParams('id'), AuthenticationMiddleware, AuthorizationMiddleware(UserRole.PATIENT), AsyncHandler(async (req, res) => {
    res.status(200).json(await BudgetService.deleteTransaction(req.params?.id, req.user?.id));
}));


router.get("/summary", AuthenticationMiddleware, AsyncHandler(async (req, res) => {
    res.status(200).json(await BudgetService.findSummaryByUserAndDate(req.query, req.user?.id));
}));

module.exports = router;