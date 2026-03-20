import { Router } from "express"
import { protect,admin } from "../middlewares/auth.middleware.js"
import {getUserCart,addItemToCart,removeItemFromCart,updateItemToCart} from "../controllers/cart.controller.js"


const router=Router()
router.route("/").get(protect,getUserCart)
router.route("/add").post(protect,addItemToCart)
router.route("/remove/:productId").delete(protect,removeItemFromCart)
router.route("/update/:productId").put(protect,updateItemToCart)
export default router