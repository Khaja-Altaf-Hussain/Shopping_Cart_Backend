import { Router } from "express"
import {
    fetchAllProduct,
    fetchSingleProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from "../controllers/product.controller.js"
import { protect,admin } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"
const router=Router()

// console.log("protect:",protect)
// router.get('/',fetchAllProduct)

// router.get('/:id',fetchSingleProductById)


// router.post('/',protect,admin,createProduct)

// router.put('/:id',protect,admin,updateProduct)

// router.delete('/:id',protect,admin,deleteProduct)


router.route('/').get(fetchAllProduct)
.post(protect,upload.single("imageUrl"),createProduct)

router.route('/:id').get(fetchSingleProductById)
.put(protect,updateProduct)
.delete(protect,deleteProduct)

export default router