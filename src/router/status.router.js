import express from "express";
import { getPingController } from "../controllers/status.controller.js";
import {  verifyTokenMiddleware } from "../middleware/auth.middleware.js";

const statusRouter = express.Router()

statusRouter.get('/ping', getPingController)
statusRouter.get('/protected-route/ping', verifyTokenMiddleware(['admin', 'user']), getPingController)

export default statusRouter

