const express=require('express')
const controller=require('../controllers/adminController')
const adminModel=require('../model/adminModel')
const userModel=require('../model/userModel')
const router=express()

// const VerifyAdmin=require('../middleware/verifyAdmin')
const upload = require('../middleware/multer')


router.set('view engine', 'ejs');
router.set('views', './views/Admin');


router.get('/admin',controller.adminHome)
router.get('/login',controller.adminLogin)
router.post('/admin',controller.postadminLogin)


// ------------------Admin pages-----------------

router.get('/productMngt',controller.productMngt)
router.get('/orderMngt',controller.orderMngt)
router.get('/categoryMngt',controller.categoryMngt)
router.get('/userMngt',controller.userMngt)
router.get('/adminlogout',controller.adminLogout)



// ----------------------user block---------------------

router.post('/block-user/:id',controller.getuserBlock)
router.post('/unblock-user/:id',controller.getuserUnblock)

// -----------------------product page-------------------

router.get('/addProducts',controller.getaddproduct)
router.post('/addproducts', upload.fields([{name:'images', maxCount:5}]), controller.add_product)

router.get('/productEdit/:id', controller.editProduct)
router.post('/productEdit/:id',upload.array('images'), controller.update_product)

router.post('/list-product/:id',controller.listProduct)
router.post('/unlist-product/:id',controller.unlistproduct)



// --------------------------------------------category page------------------------------------------------------

router.get('/addCategory',controller.getaddcategory)
router.post('/addCategory',controller.postAddCategory)

router.get('/edit-category/:id', controller.geteditcategory)
router.post('/edit-category/:id',controller.posteditCategory)

router.post('/list-category/:id',controller.listcategory)
router.post('/unlist-category/:id',controller.unlistcategory)





module.exports=router