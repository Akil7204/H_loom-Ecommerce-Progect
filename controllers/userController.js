const UserCollection = require("../model/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const sendOtp = require("../actions/otp");
const idcreate = require("../actions/idcreate");
const productModel = require("../model/productModel");
const categoryModel = require("../model/categoryModel");

// ------------------USER LOGIN--------------

const userLogin = (req, res) => {
  res.render("home", { user: req.session.user });
};

const login = (req, res) => {
  if (req.session.user && req.session.user.status === "Unblock") {
    res.redirect("/");
  } else {
    res.render("userlogin");
  }
};

const getSignupPage = (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("usersignUp");
  }
};

const postSignupPage = async (req, res) => {
  const { email, name, mobile, password, confirmpassword } = req.body;
  const user = await UserCollection.findOne({ email });
  console.log(user);

  if (user) {
    return res.render("userSignUp", { duplicate: "user already found" });
  }
  if (
    name == "" ||
    email == "" ||
    password == "" ||
    mobile == "" ||
    confirmpassword == ""
  ) {
    const fieldRequired = " All Fields Are Required";
    res.render("userSignUp", { fieldRequired });
  } else {
    if (password != confirmpassword) {
      res.render("userSignUp", { passworder: "passwords are not same" });
    } else {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      console.log(hashedPassword);

      randomOtp = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
      req.session.otp = randomOtp;
      console.log(randomOtp);

      sendOtp(req.body.email, randomOtp)
        .then(() => {
          req.session.signup = req.body;
          req.session.signup.password = hashedPassword;
          return res.render("otp", { user: req.session.signup });
        })
        .catch((err) => {
          return res.render("userSignUp", {
            error: true,
            message: "email sent failed",
          });
        });
    }
  }
};

const postVerifyOtp = async (req, res) => {
  const { name, email, password, mobile } = req.session.signup;
  console.log(req.session.signup);

  // const Email=req.body.email
  // console.log(Email+ "OTPEMAIL")

  if (req.body.otp == req.session.otp) {
    console.log("otp verified");

    const user = new UserCollection({ name, email, mobile, password });
    console.log(user);

    user.save();
    req.session.otp = false;

    res.render("userlogin", {
      regerstrationMessage: "Account successfully created! Please login.",
    });
  } else {
    res.render("otp", { error: true, wrong: "Invalid OTP", ...req.body });
  }
};

const userVerfication = async (req, res) => {
  const email = req.body.email;

  let userExists = await UserCollection.findOne({ email: email });

  if (userExists) {
    const password = bcrypt.compareSync(req.body.password, userExists.password);
    console.log(password);
    console.log(req.body.password);

    if (password && userExists.status == "Unblock") {
      req.session.user = userExists;
      console.log("session started");
      res.redirect("/");
    } else if (userExists.status == "block") {
      res.render("userlogin", { wrong: "You are blocked " });
    } else {
      res.render("userlogin", { wrong: "Invalid email or password " });
    }
  } else {
    res.render("userlogin", { wrong: "user not found" });
  }
};

const productsPerPage = 8; // Number of products to display per page

const productspage = async (req, res) => {
  try {
    console.log(req.session.user_id);
    const page = parseInt(req.query.page) || 1;

    const totalProducts = await productModel.countDocuments(); // Count the total number of products
    const category = await categoryModel.find({});
    const products = await productModel
      .find()
      .skip((page - 1) * productsPerPage)
      .limit(productsPerPage)
      .exec();

    // const offers = await Offers.find(); // Retrieve all offers from the offer model

    res.render("product", {
      userdetail: req.session.user,
      products: products,
      category: category,
      user: req.session.user_id,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / productsPerPage), // Calculate the total number of pages
    });
  } catch (error) {
    res.render("error", { error: error.message });
  }
};

const getproductDetails = async (req, res) => {
  try {
    const _id = req.params.id;
    console.log(req.params.id);

    const product = await productModel.findById({ _id }).lean();
    const id = req.session.user;
    const user = await UserCollection.findOne({ _id: id }).lean();
    // Render the page with the product details
    res.render("productView", { product, user });
  } catch (err) {
    console.error(err);
    // Handle the error appropriately, e.g., render an error page
    res.render("error", {
      error: "An error occurred while fetching product details",
    });
  }
};

// -----------------whishlist--------------------

const wishlist = async (req, res) => {
  try {
    if (req.session.user) {
      const id = req.session.user._id;

      const user = await UserCollection.findById({ _id: id }).lean();

      const wishlist = user.wishlist;

      const product = await productModel
        .find({ _id: { $in: wishlist } })
        .lean();

      res.render("wishlist", { product, user });
    } else {
      res.render("userlogin");
    }
  } catch (err) {
    console.log(err);
  }
};

const addtowishList = async (req, res) => {
  try {
    const _id = req.session.user.id;

    const proId = req.params.id;
    await UserCollection.updateOne(
      { _id },
      {
        $addToSet: {
          wishlist: proId,
        },
      }
    );
    res.redirect("back");
  } catch (err) {
    res.render("404");
    console.log(err);
  }
};

const removeWishlist = async (req, res) => {
  try {
    const _id = req.session.user.id;
    const id = req.params.id;

    await userModel.updateOne(
      { _id },
      {
        $pull: {
          wishlist: id,
        },
      }
    );

    res.redirect("back");
  } catch (err) {
    res.render("404");
    console.log(err);
  }
};

// --------------------cart------------------------

const getCartPage = async (req, res) => {
  try {
    console.log(req.session.user);
    const _id = req.session.user;
    console.log(_id);
    const { cart } = await UserCollection.findOne({ _id }, { cart: 1 });
    console.log(cart);
    const cartList = cart.map((item) => {
      return item.id;
    });

    const product = await productModel.find({ _id: { $in: cartList } }).lean();

    let totalPrice = 0;

    product.forEach((item, index) => {
      totalPrice = totalPrice + item.price * cart[index].quantity;
    });

    let totalMrp = 0;

    product.forEach((item, index) => {
      totalMrp = totalMrp + item.mrp * cart[index].quantity;
    });
    let empty;
    cart.length == 0 ? (empty = true) : (empty = false);

    const id = req.session.user;
    const user = await UserCollection.findOne({ _id: id }).lean();

    res.render("cart", { product, totalPrice, cart, totalMrp, empty, user });
  } catch (err) {
    console.log(err);
  }
};

const addtoCart = async (req, res) => {
  try {
    const _id = req.session.user;
    const productId = req.params.id;

    await UserCollection.updateOne(
      { _id },
      { $addToSet: { cart: { id: productId, quantity: 1 } } }
    );

    res.redirect("/cart");
  } catch (err) {
    console.log(err);
  }
};

const addQuantity = async (req, res) => {
  try {
    const user = await UserCollection.updateOne(
      {
        _id: req.session.user,
        cart: { $elemMatch: { id: req.params.id } },
      },
      {
        $inc: { "cart.$.quantity": 1 },
      }
    );
    console.log(user);
    res.json({ user });
  } catch (err) {
    console.log(err);
  }
};
const minQuantity = async (req, res) => {
  try {
    let { cart } = await UserCollection.findOne(
      { "cart.id": req.params.id },
      { _id: 0, cart: { $elemMatch: { id: req.params.id } } }
    );
    console.log(cart);
    if (cart[0].quantity <= 1) {
      return res.redirect("/cart");
    }

    const user = await UserCollection.updateOne(
      {
        _id: req.session.user,
        cart: { $elemMatch: { id: req.params.id } },
      },
      {
        $inc: {
          "cart.$.quantity": -1,
        },
      }
    );
    console.log(user);
    return res.json({ user });
  } catch (err) {
    console.log(err);
  }
};

const removeCart = async (req, res) => {
  try {
    const _id = req.session.user;
    const productId = req.params.id;

    await UserCollection.updateOne(
      { _id },
      {
        $pull: {
          cart: { id: productId },
        },
      }
    );
    res.redirect("/cart");
  } catch (err) {
    console.log(err);
  }
};

// ------------------------------------------profile page--------------------------------------

const getuserProfile = async (req, res) => {
  try {
    const id = req.session.user;
    console.log(id);
    const user = await UserCollection.findOne({ _id: id }).lean();
    console.log(user);

    res.render("Profile", { user });
  } catch (err) {
    console.log(err);
  }
};

const getuserdashboard = async (req, res) => {
  try {
    const id = req.session.user;
    console.log(id);
    const user = await UserCollection.findOne({ _id: id }).lean();
    console.log(user);

    res.render("dashboard", { user });
  } catch (err) {
    console.log(err);
  }
};
const getuseraddress = async (req, res) => {
  try {
    const id = req.session.user;
    
    const user = await UserCollection.findOne({ _id: id }).lean();
    console.log(user);

    res.render("address", { user });
  } catch (err) {
    console.log(err);
  }
};

const getAddress = async (req, res) => {
  const id = req.session.user;
    
    const user = await UserCollection.findOne({ _id: id }).lean();
  res.render("AddAddress", {user});
};
const postAddress = async (req, res) => {
  try {
    const _id = req.session.user;

    const user = await UserCollection.updateOne(
      { _id },
      {
        $addToSet: {
          address: {
            ...req.body,
            id: idcreate(),
          },
        },
      }
    );
    console.log(user.address + "  3");
    res.redirect("/profile");
  } catch (err) {
    console.log(err);
  }
};

const getEditAddress = async (req, res) => {
  const _id = req.params.id;
  try {
    let { address } = await UserCollection.findOne(
      { "address._id": _id },
      { _id: 0, address: { $elemMatch: { _id } } }
    );
    res.render("editAddress", { address: address[0] });
  } catch (err) {
    console.log(err);
  }
};

const posteditAddress = async (req, res) => {
  try {
    const _id = req.session.user;

    const user = await UserCollection.updateOne(
      { _id },
      {
        $addToSet: {
          address: {
            ...req.body,
            id: idcreate(),
          },
        },
      }
    );
    console.log(user.address + "  3");
    res.redirect("/address");
  } catch (err) {
    console.log(err);
  }
};

const deleteAddress = async (req, res) => {
  try {
    
    const id = req.params.id;

    await UserCollection.updateOne(
      { _id: req.session.user._id },
      { $pull: { address: { _id: id } } }
    );

    res.redirect("/address");
  } catch (err) {
    console.log(err);
  }
};

// --------------------check out------------------------------

 const getcheckout = async (req, res) => {
  try {
    let totalPrice = 0;
    const id = req.session.user._id;
    const user = await UserCollection.findById({ _id: id }).lean();
    for (const i of user.cart) {
      let product = await productModel.findOne({ _id: i.id });
      totalPrice = totalPrice + product.price * i.quantity;
    }
    res.render("checkout", { user, totalPrice });
  } catch (err) {
   
    console.log(err);
  }
}

// --------------LOgout---------------------

const logout = (req, res) => {
  req.session.user = false;
  console.log("session ends");
  res.redirect("/login");
};

module.exports = {
  userLogin,
  login,
  getSignupPage,
  postSignupPage,
  postVerifyOtp,
  userVerfication,
  productspage,
  getproductDetails,
  wishlist,
  addtowishList,
  removeWishlist,
  getCartPage,
  addtoCart,
  addQuantity,
  minQuantity,
  removeCart,
  getuserProfile,
  getuserdashboard,
  getuseraddress,
  getAddress,
  postAddress,
  getEditAddress,
  posteditAddress,
  deleteAddress,
  getcheckout,
  logout,
};
