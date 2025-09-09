const express = require('express');
const dotenv = require('dotenv');

const AsyncHandler = require('../middleware/AsyncHandler');
const AuthService = require('../service/AuthService');
const { ACCESS_AND_REFRESH_TOKEN_REQUIRED } = require('../utils/Messages');
const { ApiResponse } = require('../utils/Utils');

const router = express.Router();

dotenv.config();

const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME;
const COOKIE_EXPIRY_DURATION = 7 * 86400 * 1000;

router.post("/signup", AsyncHandler(async (req, res) => {
    const response = await AuthService.signup(user);

    res.cookie(REFRESH_COOKIE_NAME, response.refreshToken, {
        httpOnly: true,
        secure: true,
        // secure: process.env.NODE_ENV === 'production',
        sameSite: 'None',
        path: '/',
        expires: new Date(Date.now() + COOKIE_EXPIRY_DURATION),
    });

    res.status(201).json(ApiResponse("User registration successful", { accessToken: response.accessToken }));
}));

router.post("/login", AsyncHandler(async (req, res) => {
    const response = await AuthService.login(req.body);

    res.cookie(REFRESH_COOKIE_NAME, response.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        path: '/',
        expires: new Date(Date.now() + COOKIE_EXPIRY_DURATION),
    });

    res.status(200).json(ApiResponse("User login successful", { accessToken: response.accessToken }));
}));

router.post("/google-login", AsyncHandler(async (req, res) => {
    const response = await AuthService.googleLogin(req.body);

    res.cookie(REFRESH_COOKIE_NAME, response.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        path: '/',
        expires: new Date(Date.now() + COOKIE_EXPIRY_DURATION),
    });

    res.status(200).json(ApiResponse("User login successful", { accessToken: response.accessToken }));
}));

router.post('/refresh', async (req, res) => {
    try {
        const token = await AuthService.refreshAccessToken(req.cookies.refreshToken);
        res.status(200).json({
            token,
            message: "Access token refreshed successfully.",
        });
    } catch (error) {
        res.status(401).json(AuthService.AuthResponse(ACCESS_AND_REFRESH_TOKEN_REQUIRED, false));
    }
});

router.get('/logout', AsyncHandler(async (req, res) => {
    res.clearCookie(REFRESH_COOKIE_NAME, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        path: '/',
    });

    res.status(200).json({
        message: "Logout successful.",
    });
}));

router.post('/forgot-password', AsyncHandler(async (req, res) => {
    res.status(200).json(await AuthService.forgotPassword(req.body));
}));

router.put('/reset-password', AsyncHandler(async (req, res) => {
    res.status(200).json(await AuthService.resetPassword(req.body));
}));

module.exports = router;
