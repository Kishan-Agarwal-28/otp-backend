import {Router} from 'express';
import {    
    loginUser,
    logoutUser,
    generateNewTokens,
    verifyUser,
    resendVerificationToken,
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
const router=Router()

router.route("/").get((req,res)=>{
    res.status(200).json({message:"Welcome to we-write-code"})
})
router.route("/login").post(loginUser)
router.route("/generateNewTokens").post(generateNewTokens)
router.route("/verify").post(verifyUser)
router.route("/resendVerificationToken").post(resendVerificationToken)

//secured routes
router.route("/logout").post(verifyJWT,logoutUser)
export default router