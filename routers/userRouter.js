const express=require('express')
const controller=require('../controllers/userController')
// const VerifyUser=require('../middlewares/verifyUser')
const router=express()



router.set('view engine','ejs')
router.set('views', './views/User');


router.get('/', controller.userLogin)
router.get('/login', controller.login)
router.post('/login', controller.userVerfication)
router.get('/signup', controller.getSignupPage)
router.post('/signup',controller.postSignupPage)


// ----------------------OTP-----------------------
// router.get('/otp',controller.getVerifyOtp)
router.post('/otp',controller.postVerifyOtp)



// ---------------product page---------------------

router.get('/product',controller.productspage)
router.get('/productView/:id',controller.getproductDetails)

// ------------------------whishlist--------------------------

router.get("/wishlist", controller.wishlist);
router.get("/addto-wishlist/:id", controller.addtowishList);
router.get("/remove-wishlist/:id", controller.removeWishlist);

// ----------------------cart-------------------------------

router.get("/cart", controller.getCartPage);
router.get("/addto-cart/:id", controller.addtoCart);
router.get("/remove-cart/:id", controller.removeCart);
router.get("/add-quantity/:id", controller.addQuantity);
router.get("/minus-quantity/:id", controller.minQuantity);

// ----------------------check out-------------------------

router.get("/product-checkout", controller.getcheckout);



// ----------------------profile-------------------------

router.get('/profile',controller.getuserProfile)
router.get('/dashboard',controller.getuserdashboard)
router.get('/address',controller.getuseraddress)
router.get('/add-address',controller.getAddress)
router.post('/add-address',controller.postAddress)
router.get('/edit-address/:id', controller.getEditAddress)
router.post('/edit-address', controller.posteditAddress)
router.get('/delete-address/:id',controller.deleteAddress)



//  -------------------------LOgout----------------------------
router.get('/logout', controller.logout)







module.exports = router;
