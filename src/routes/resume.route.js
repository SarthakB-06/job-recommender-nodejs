import { Router } from "express";
import { verifyJWT } from "../middlewares/authentication.js";
import { uploadResumeToCloudinary } from "../controllers/resume.controller.js";
import { saveParsedResumeData, viewResume } from "../controllers/resume.controller.js";

const router = Router()

router.route("/upload-resume").post(verifyJWT , uploadResumeToCloudinary)
router.route("/save-parsed-resume").post(verifyJWT , saveParsedResumeData)
router.route("/view").post(verifyJWT , viewResume)


export default router