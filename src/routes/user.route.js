import { Router } from "express"
import {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPasword,getCurrentUser,updateAccountDetails} from "../controllers/user.conntroller.js"
import {protect,admin} from "../middlewares/auth.middleware.js"



const router=Router()
router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(protect,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(protect,changeCurrentPasword)
router.route("/current-user").get(protect,getCurrentUser)
router.route("/update-account").patch(protect,updateAccountDetails)


export default router