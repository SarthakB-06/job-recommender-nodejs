import { Router } from "express";
import { getUserProfile, markResumeUploaded, userLogin, userRegister , userLogout,updateUserProfile , updateUserPassword , updateUserPreferences ,deleteUserAccount } from "../controllers/user.controller.js";
// import verifyJWT from "../middlewares/authentication.js";
import { verifyJWT } from "../middlewares/authentication.js";
// import { uploadResumeToCloudinary } from "../controllers/resume.controller.js";

const router = Router();

router.route("/register").post(userRegister)
router.route("/login").post(userLogin)
router.route("/me").get(verifyJWT , getUserProfile )
router.route('/logout').post(verifyJWT , userLogout)

router.put('/profile', verifyJWT, updateUserProfile);
router.put('/password', verifyJWT, updateUserPassword);
router.put('/preferences', verifyJWT, updateUserPreferences);
router.delete('/account', verifyJWT, deleteUserAccount);
router.route("/resume-uploaded").post(verifyJWT , markResumeUploaded)



export default router; 