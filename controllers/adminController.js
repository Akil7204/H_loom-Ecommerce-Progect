const adminModel = require('../model/adminModel')
const adminRouter = require('../routers/adminRouter')
const userModel = require('../model/userModel')
const categoryModel = require('../model/categoryModel')
const productModel = require('../model/productModel')
// const couponModel = require('../models/couponModel')
// const bannerModel = require('../models/bannerModel')
const orderModel=require('../model/orderModel')
const sharp=require('sharp')
const fs = require('fs');


const adminHome = (req, res) => {

    if (req.session.admin) {
        res.render('adminHome')
    } else {
        res.render('adminLogin')
    }
}

const adminLogin = (req, res) => {

    if (req.session.admin) {
        res.redirect('/')
    } else {
        res.render('adminLogin')
    }
}

const postadminLogin = async (req, res) => {

    const { email, password } = req.body
    const admin = await adminModel.findOne({ email })

    if (admin) {
        if (password == admin.password) {
            req.session.admin = {
                name: admin.name
            }
            console.log(req.session.admin);
            res.redirect('/admin')
        } else {
            res.render('adminLogin', { err: 'incorrect password' })
        }
    } else {
        res.render('adminLogin', { error: 'please enter all fields' })
    }

}

const productMngt = async (req, res) => {
    try {
      
        id = req.params.id
        // let products = await productModel.find({})
        let categories = await categoryModel.find({})
        req.session.pageNum = parseInt(req.query.page ?? 1);
      req.session.perpage =4;
      let products = await productModel
        .find()
        .countDocuments()
        .then((documentCount) => {
          docCount = documentCount;
          return productModel
            .find()
            .skip((req.session.pageNum - 1) * req.session.perpage)
            .limit(req.session.perpage)
            .lean();
        });
      username = req.session.user;
      let pageCount = Math.ceil(docCount / req.session.perpage);
      let pagination = [];
      for (i = 1; i <= pageCount; i++) {
        pagination.push(i);
      }
    
        res.render('productMngt', { products, categories,pagination, user: req.session.user })
      
    } catch (err) {
      console.log(err)
    }
  
}

const userMngt = async (req, res) => {

    let users = await userModel.find({}, { password: 0 }).lean()
    // console.log(users)

    res.render('userMngt', { users })
}

const categoryMngt = async (req, res) => {

    const categories = await categoryModel.find().lean()
    res.render('categoryMngt', { categories })
}


const orderMngt = async (req, res) => {
    try {
      const order = await orderModel.find().lean();
      res.render("orderMngt", { order });
    } catch (err) {
      console.log("ful err");
      console.log(err);
    }
}

const getuserBlock = async (req, res) => {
    var id = req.params.id
    console.log(id)

    await userModel.findByIdAndUpdate(id, { $set: { status: 'block' } }).then(() => {

        res.redirect('/userMngt')
    }).catch((err) => {
        console.log(err)
    })

}

const getuserUnblock = async (req, res) => {
    var id = req.params.id
    console.log(id)

    await userModel.findByIdAndUpdate(id, { $set: { status: 'Unblock' } }).then(() => {

        res.redirect('/userMngt')
    }).catch((err) => {
        console.log(err)
    })

}

const getaddproduct = async (req, res) => {

    const categories = await categoryModel.find({}).lean()

    console.log(categories)
    res.render('addProducts', { categories })
}

const add_product = async (req, res) => {
    try {
        const { name, category, quantity, price, brand, description, mrp } = req.body;

        // Check if required fields are missing
        if (!name || !category || !quantity || !price || !brand || !description || !mrp) {
            const fieldRequired = 'All Fields Are Required';
            const categories = await categoryModel.find().lean();
            return res.render('addProducts', { fieldRequired, categories });
        }

        // Check if files are present in the request
        if (!req.files || !req.files.images || req.files.images.length === 0) {
            const noImagesError = 'At least one image is required';
            const categories = await categoryModel.find().lean();
            return res.render('addProducts', { noImagesError, categories });
        }

        // Image Processing
        const processedImages = await Promise.all(
            req.files.images.map(async (image) => {
                await sharp(image.path)
                    .png()
                    .resize(600, 600, {
                        kernel: sharp.kernel.nearest,
                        fit: 'contain',
                        position: 'center',
                        background: { r: 255, g: 255, b: 255, alpha: 0 }
                    })
                    .toFile(image.path + ".png");

                image.filename = image.filename + ".png";
                image.path = image.path + ".png";

                return image.filename;
            })
        );

        // Create Product Object
        const product = new productModel({
            name,
            category,
            quantity,
            price,
            brand,
            description,
            mrp,
            mainImage: processedImages,
        });

        console.log(product);

        // Save Product to Database
        await product.save();
        console.log('Product saved successfully');

        // Send a success response
        return res.redirect('/productMngt');

    } catch (error) {
        // Handle the error
        console.error(error.message);
        return res.status(500).send({ error: 'Internal Server Error' });
    }
};

const editProduct = async (req, res) => {
    try {
        const id = req.params.id
        const products = await productModel.findOne({ _id: id })
        console.log(products)

        const categories = await categoryModel.find({})
        console.log(categories)


        res.render('productEdit', { products, categories })
    } catch (err) {
        console.log(err);
    }
}

const update_product =async(req,res)=>{
    try {
      console.log('update_product');
      let dataobj;
      console.log(req.body);
      
      const images = [];
      if (req.files) {
        for (let i = 0; i < req.files.length; i++) {
          images[i] = req.files[i].filename;
        }
        dataobj = {
          productname: req.body.productname,
          category: req.body.category,
          brand: req.body.brand,
          quantity: req.body.quantity,
          mrp: req.body.mrp,
          price: req.body.price,
          description: req.body.description,
          mainImage: images,
        };
        
      } else {
   
        dataobj = {
          name: req.body.productname,
          category: req.body.category,
          brand: req.body.brand,
          quantity: req.body.quantity,
          mrp: req.body.mrp,
          price: req.body.price,
          description: req.body.description,
        };
      }
      // console.log(dataobj);
       await product.findByIdAndUpdate(
        { _id: req.body.id },
        { $set: dataobj },
        { new: true }
      );
      
      res.redirect("/productMngt");
    } catch (error) {
      console.log(error.message);
      res.status(500).send({ success: false, msg: error.message });
    }
}

const listProduct = async (req, res) => {
    var id = req.params.id
    console.log(id)

    await productModel.findByIdAndUpdate(id, { $set: { status: 'available' } }).then(() => {

        res.redirect('/productMngt')
    }).catch((err) => {
        console.log(err)
    })

}

const unlistproduct = async (req, res) => {
    var id = req.params.id
    console.log(id)

    await productModel.findByIdAndUpdate(id, { $set: { status: 'unavailable' } }).then(() => {

        res.redirect('/productMngt')
    }).catch((err) => {
        console.log(err)
    })

}

const getaddcategory = (req, res) => {
    res.render('addCategory')
}

const postAddCategory=async (req, res) => {
    const category = req.body.category.toLowerCase();
    const categories=await categoryModel.findOne({category})
   console.log(categories)

    if(categories){
       return res.render('addCategory',{error:true,duplicate:'category already exist'})
    }
    if (category == ""|| category==null) {
        return res.redirect("/addCategory")
    } else {
        // const category = req.body.Category
        console.log(req.body)

        const categories = new categoryModel({ category })

        categories.save()

        res.redirect('/categoryMngt')
    }
}

const listcategory = async (req, res) => {
    var id = req.params.id
    console.log(id)

    await categoryModel.findByIdAndUpdate(id, { $set: { status: 'available' } }).then(() => {

        res.redirect('/categoryMngt')
    }).catch((err) => {
        console.log(err)
    })

}

const unlistcategory = async (req, res) => {
    var id = req.params.id
    console.log(id)

    await categoryModel.findByIdAndUpdate(id, { $set: { status: 'unavailable' } }).then(() => {

        res.redirect('/categoryMngt')
    }).catch((err) => {
        console.log(err)
    })
}

const posteditCategory = async (req, res) => {
    try {
        const categoryExist = await categoryModel.findOne({category:req.body.category})
        
        if(!categoryExist || req.params.id == categoryExist.id ){
            await categoryModel.findOneAndUpdate({_id: req.params.id},{  $set:{category: req.body.category} })
            const categories= await categoryModel.find({})
            res.render('categoryMngt', {categories} )
        }else{
            const categories= await categoryModel.find({})
            res.render("editCategory",{categories, duplicate:'category already exist'})
        }
    } catch (err) {
        console.log(err);
    }

}

const geteditcategory = async (req, res) => {
    console.log(req.params.id)
    const categories = await categoryModel.findOne({_id : req.params.id})
        console.log(categories);
        res.render('editCategory', { categories })

}


const adminLogout = (req, res) => {

    req.session.admin = false
    res.redirect('/admin')

}





module.exports = {
    adminHome,
    adminLogin,
    postadminLogin,
    productMngt,
    userMngt,
    categoryMngt,
    orderMngt,
    getuserBlock,
    getuserUnblock,
    getaddproduct,
    add_product,
    listProduct,
    unlistproduct,
    editProduct,
    update_product,
    getaddcategory,
    postAddCategory,
    listcategory,
    unlistcategory,
    posteditCategory,
    geteditcategory,
    adminLogout,
}




