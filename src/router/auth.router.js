import express from "express";
import { 
    forgotPasswordController, 
    loginController, 
    registerUserController,
    resetTokenController,
    verifyMailValidationTokenController 
} from "../controllers/auth.controller.js";



const authRouter = express.Router()

authRouter.post('/register',  registerUserController)
authRouter.get('/verify/:verificationToken', verifyMailValidationTokenController)
authRouter.post('/login',  loginController)
authRouter.post('/forgot-password', forgotPasswordController)
authRouter.post('/reset-password/:reset_token' )
authRouter.put('/reset-password/:reset_token',  resetTokenController)


export default authRouter