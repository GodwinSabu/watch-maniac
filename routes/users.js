var express = require('express');
var router = express.Router();
var userHelpers = require('../helpers/user-helpers')
var productHelpers = require('../helpers/product-helpers')
const adminHelpers = require('../helpers/admin-helpers');
const otp = require('../otp-token');
const client = require('twilio')(otp.accountSID, otp.authToken)
var paypal = require('paypal-node-sdk');
const collection = require('../config/collection');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AZNCtIl6rrjyCXaJeB6jsFs_dn1rmarRwUeDAv_26CQJT3M3XKnYpEaa2Bxp-4uudqmA8CLtCaY2ezJl',
  'client_secret': "EGhn4m_7tMWYbPWGTJ0_hn5hzuu-FLmZeBwndNBG31tB33u5LPr1hJSD0zRA3s6AtptVfqv77hgP86Ws"
});


router.get('/home', async function (req, res) {
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }
  let banner = await adminHelpers.getBanner()
  let category = await productHelpers.getCategory()
  // productHelpers.getAllProducts().then((products) => {
  //   let user = req.session.user;
  //   res.render('user/user-homepage', { user, products, category, banner, cartCount, user: true });
  // })

  let Products= await productHelpers.getAllProducts()
  let wishlist= await userHelpers.getWishlistlove(req.session.user._id)
console.log(wishlist,'---------------------------------');
  if (wishlist) {
    if (wishlist[0].products.length > 0) {
      for(let i=0;i<Products.length;i++){
        for(let j=0;j<wishlist[0].products.length;j++){
          let productId= Products[i]._id.toString()
          let item = wishlist[0].products[j].item.toString()
          if(productId===item){
            Products[i].wishlist='true'
          }
        }
      }
    }
  }
  let user = req.session.user;
  res.render('user/user-homepage', { user, Products, category, banner, cartCount, user: true });
});

//USER LOGOUT
router.get('/logout', (req, res) => {
  req.session.loggedIn = false
  req.session.user = null
  res.redirect('/');
})

//OTP LOGIN
router.get('/otp-login', (req, res) => {
  res.render('user/otp-login', { not: true })
})

router.post('/otp-login', (req, res) => {
  userHelpers.otpLogin(req.body).then((response) => {
    let phone = response.user.mobile
    client
      .verify
      .services(otp.serviceID)
      .verifications
      .create({
        to: `+91${phone}`,
        channel: 'sms'
      }).then((data) => {
        req.session.user = response.user;
        res.render('user/otp-verification', { phone, not: true })
      }).catch((err) => {
        console.log(err);
      })
  }).catch((response) => {
    req.session.loginErr = "Please check your mobile number";
    res.redirect('/login')
  })
})

//OTP VERIFICATION
router.get('/otp-verification', (req, res) => {
  res.render('user/otp-verification', { not: true })
})

router.post('/otp-verification', (req, res) => {
  console.log(req.body.mobile);
  client
    .verify
    .services(otp.serviceID)
    .verificationChecks
    .create({
      to: `+91${req.body.mobile}`,
      code: req.body.otp
    }).then((data) => {
      console.log(data);
      if (data.valid) {
        req.session.loggedIn = true;
        res.redirect('/users/home')
      } else {
        delete req.session.user
        req.session.otpErr = "Enter valid OTP"
        res.redirect('/login')
      }
    }).catch((err) => {
      delete req.session.user
      res.redirect('/login')
    })
})
router.get('/resendOtp/:phone', async (req, res) => {
  let phone = req.params.phone
  console.log(phone, 'ppppppphhhhhhhhhhhhhhhhhhhhhhooooooooooooone111');
  userHelpers.otpLogin(phone).then((response) => {
    let phone = response.user.mobile
    client
      .verify
      .services(otp.serviceID)
      .verifications
      .create({
        to: `+91${phone}`,
        channel: 'sms'
      }).then((data) => {
        req.session.user = response.user;
        res.render('user/otp-verification', { phone, not: true })
      }).catch((err) => {
        console.log(err);
      })
  }).catch((response) => {
    req.session.loginErr = "Please check your mobile number";
    res.redirect('/login')
  })
})

// //view product details

router.get("/product-details/:id", async (req, res) => {
  let user = req.session.user;
  // console.log(user);
  let cartCount = null;
  if (user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }
  productHelpers.getProductDetails(req.params.id).then((response) => {
    // console.log(response);
    res.render("user/product-details", { response, user, cartCount, user: true });
  });
})

//get cart product

router.get('/add-to-cart/:id', (req, res) => {
  // console.log('dddddddddddddddddddddddddd');
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.render('user/product-details', { user: true })
  })
})

// })
router.get('/catpro/:categoryname', (req, res) => {
  // console.log(req.params.categoryname, 'kkkkk;;;');
  productHelpers.getcategoryProducts(req.params.categoryname).then((categoryProducts) => {
    res.render('user/categorydisplay', { user: true, categoryProducts })

  })

})

//CART

router.get('/cart', async (req, res) => {
  console.log("oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo11");
  let userId = req.session.user._id;
  cartCount = await userHelpers.getCartCount(req.session.user._id);
  console.log("oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo22222");
  let total = await userHelpers.getTotalAmount(userId)
  console.log("ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo.33333o");
  let products = await userHelpers.getCartProducts(userId)
  console.log("oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo4444");
  userHelpers.getCartProducts(userId).then((cartItems) => {
    res.render('user/cart', { user: true, cartItems, cartCount, total, products })
  })
})

//CHANGE PRODUCT FROM CART

router.post("/change-product-quantity", async (req, res) => {
  console.log('hiiiiiiiii09');
  let itemQuantity = parseInt(req.body.count) + parseInt(req.body.quantity)
  console.log(itemQuantity, 'ooooookfuckkkyeakhhj');
  let prodstock = await productHelpers.getStockCount(req.body.product)
  // console.log('pproductstockkkkkkk', prodstock);
  if (prodstock >= itemQuantity) {
    userHelpers.changeProductQuantity(req.body).then(async (response) => {
      response.total = await userHelpers.getTotalAmount(req.session.user._id);  //user is passed from ajax in order to reload total amount without refreshing
      res.json(response);
      console.log(response);
    });
  } else {
    res.json({ status: false })
  }

});


//WISHLIST
router.get('/wishlist', async (req, res) => {
  let userId = req.session.user._id
  let products = await userHelpers.getWishProducts(userId)
  let user = req.session.user
  // console.log(products, "909999999999999999999999999999999999999999999999999999999999999999999999999999999");
  res.render('user/wishlist', { products, user, userId })
})

//ADD TO WISHLIST
router.get('/add-to-wishlist/:id', (req, res) => {
  userHelpers.addToWishlist(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })
  }).catch((response) => {
    res.json({ status: false })
  })  
})

//DELETE WISHLIST PRODUCT
router.get('/delete-wish-product/:id', (req, res) => {
  console.log();
  console.log('llllllllllllllll--==========================================================');
  userHelpers.deleteProductFromWish(req.params.id, req.session.user._id).then(() => {
    res.redirect('/users/wishlist')
  })
})


//wishlist remove ri

// router.post('/wishlist-product-remove', (req, res, next) => {
//   // console.log('heeeeeeeeelllllloooooooooo');
//   // console.log(req.body);
//   userHelpers.deleteProductFromWish(req.body).then((response) => {
//     res.json(response)
//   })
// })

//DELETE PRODUCT FROM CART

router.get("/delete-cart-product/:id", (req, res) => {
  userHelpers.deleteCartProduct(req.params.id, req.session.user._id).then((response) => {
      res.json({ status: true })
    });
});




// COUPON
router.post('/redeem-coupon', async (req, res) => {
 let userId = req.session.user._id
  let totalAmount = await userHelpers.getTotalAmount(userId)
  // console.log(totalAmount, '*******');
  await userHelpers.redeemCoupon(req.body).then((couponData) => {
    let minMsg = "This coupen is only valid for purchase above ₹" + couponData.minPrice
    if (totalAmount >= couponData.minPrice) {
      console.log('yeyeyeeeeeeee');
      let temp = (totalAmount * couponData.couponOffer) / 100
      // console.log(temp, '__________________');
      if (temp < couponData.priceLimit) {
        // console.log('temp<<<<<<<<<<<');
        totalAmount = (totalAmount - temp)
        console.log(totalAmount);
      } else if (temp >= couponData.priceLimit) {
        // console.log('temp>>>>>>>>>>>>>');
        temp = couponData.priceLimit
        totalAmount = (totalAmount - temp)
      }

      res.json({ total: totalAmount, offer: temp })

    } else if (totalAmount <= couponData.minPrice) {

      res.json({ msg: minMsg, total: totalAmount })

    }
  }).catch(() => {
    let msg = "Invalid Coupon Or It's already Expired"
    res.json({ msg: msg, total: totalAmount })
  })
})


//CHECKOUT FORM
router.get("/place-order", async (req, res) => {
  let users = req.session.user
  let userId = req.session.user._id
  let cartproducts = await userHelpers.getCartProducts(userId)
  let total = await userHelpers.getTotalAmount(userId)
  let address = await userHelpers.addressDetails(userId)
  let cartCount = await userHelpers.getCartCount(userId)
  let wishCount = await userHelpers.getWishCount(userId)
  let wallet = await userHelpers.getWallet(userId)
  res.render("user/place-order", { total, users, cartproducts, wallet, wishCount, address, cartCount, user: true })
})


router.post('/place-order', async (req, res) => {
  let userId = req.session.user._id
  let products = await userHelpers.ordercart(userId)
  let wallet = await userHelpers.getWallet(userId)
  let address = await userHelpers.getUseraddress(userId)
  let totalPrice
  let discountCoupon



  if ( req.body.discount) {
    totalPrice = req.body.total
    discountCoupon = req.body.discount
    couponApply = true
  } else {
    couponApply = false
    totalPrice = await userHelpers.getTotalAmount(userId)
  }
  userHelpers.placeOrder(address, products, totalPrice, req.body['payment-method'], userId,discountCoupon,couponApply).then((orderId) => {

    if (req.body['payment-method'] === 'COD') {

      res.json({ codSuccess: true })

    } else if (req.body['payment-method'] === 'online') {

      userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
        res.json({ razorpay: true, response })
      })
    } else if (req.body['payment-method'] === 'paypal') {
      req.session.orderId = orderId
      var create_payment_json = {
        "intent": "sale",
        "payer": {
          "payment_method": "paypal"
        },
        "redirect_urls": {
          "return_url": "http://localhost:3000/success",
          "cancel_url": "http://cancel.url"
        },
        "transactions": [{
          "item_list": {
            "items": [{
              "name": 'item',
              "sku": "item",
              "price": '1.00',
              "currency": "USD",
              "quantity": 1
            }]
          },
          "amount": {
            "currency": "USD",
            "total": '1.00'
          },
          "description": "This is the payment description."
        }]
      };
      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {x
          throw error;
        } else {
          console.log("Create Payment Response");
          console.log(payment);
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === 'approval_url') {
              console.log(payment.links[i].href);
              res.json({ url: payment.links[i].href, paypal: true });
            }
          }
        }
      });
    } else {
      userHelpers.walletPurchase(userId, wallet, totalPrice,products).then((response) => {
        // userHelpers.placeOrder(address, products, totalPrice, req.body['payment-method'], userId, wallet)
        // .then((orderId) => {
        res.json({ walletSuccess: true })
        // });
      }).catch((err) => {
        res.json({ walletFailure: true })
      })
    }

  })
  console.log(req.body, '//////////??????????')
})

router.get('/success', async (req, res) => {
  let products = await userHelpers.getCartProductList(req.session.user._id)
  userHelpers.changePaymentStatus(req.session.orderId, req.session.user._id, products).then(() => {
    req.session.orderId = null
    res.redirect('/users/orders')
  })
})

router.post('/verify-payment', async (req, res) => {
  let products = await userHelpers.getCartProductList(req.session.user._id)
  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers.changePaymentStatus(req.body['order[receipt]'], req.session.user._id, products).then(() => {
      res.json({ status: true })
    })
  }).catch((err) => {
    console.log(err);
    res.json({ status: 'Payment failed' })
  })

})

//ORDER SUCCESS
router.get('/order-success', (req, res) => {
  res.render("user/order-success", { user: req.session.user, user: true })
})

//USER PROFILE
router.get('/profile', async (req, res) => {
  let user = req.session.user
  let cartCount = await userHelpers.getCartCount(user._id)
  let wishCount = await userHelpers.getWishCount(req.session.user._id)
  res.render('user/profile', { user, cartCount, wishCount })
})

//EDIT PROFILE
router.post('/profile', (req, res) => {
  userHelpers.editProfile(req.session.user._id, req.body).then(() => {
    req.session.user = req.body
    res.redirect('/users/profile')
  })
})

// ADDRESS
router.get('/address', async (req, res) => {
  let user = req.session.user._id
  let address = await userHelpers.getUseraddress(user)
  res.render("user/address", { user, address })

})

//DELETE ADDRESS
router.get('/delete-address/:id', (req, res) => {
  userHelpers.deleteAddress(req.session.user._id, req.params.id).then(() => {
    res.redirect('/users/address')
  })
})

//ADD ADDRESS
router.post('/add-address', (req, res) => {
  let user = req.session.user._id
  userHelpers.addAddress(req.body, user).then(() => {
    res.redirect('/users/address')
  })
})

//ADD - ADDRESS
router.post('/add-address-checkout', (req, res) => {
  let user = req.session.user._id
  userHelpers.addAddress(req.body, user).then(() => {
    res.redirect('/users/place-order')
  })
})

//CHANGE PASSWORD
router.get('/password', async (req, res) => {
  let user = req.session.user._id
  let cartCount = await userHelpers.getCartCount(user)
  let wishCount = await userHelpers.getWishCount(user)
  res.render('user/password', { user, cartCount, wishCount })
})

//password post
router.post('/password', (req, res) => {
  userHelpers.changePassword(req.body, req.session.user._id).then(() => {
    req.session.loggedIn = false
    req.session.user = null
    res.redirect('/login')
  })
})

// order
router.get('/orders', async (req, res) => {
  let userId = req.session.user._id
  let limit = 4
  let pageCount = await userHelpers.pagination(collection.ORDER_COLLECTION, limit)
  console.log(pageCount, 'kkkkk123456789055--')
  let pagenumber = 0
  if (req.query?.page) {
    pagenumber = req.query?.page - 1
  }

  let orders = await userHelpers.getUserOrders(userId,pagenumber, limit)
  let count = parseInt( orders.length)
  let i = pagenumber * limit
  for (j = 1; j <= count; j++) {
    orders[j - 1].number = i + j
  }
  res.render('user/orders', { orders, user: req.session.user, user: true ,pageCount})
})

// sinGle order details

router.get('/order/:id',async (req,res)=>{
  let orderId =req.params.id
 let orderdata = await userHelpers.singleOrderData(orderId)
  res.render('user/singleOrder',{user: true ,orderdata })

})

// INVOICE
router.get('/order/invoice/:id', async (req, res) => {
  let user = req.session.user
  let order = await userHelpers.getOrder(req.params.id)
  await userHelpers.getOrderPdts(req.params.id).then((response) => {
    res.render('user/invoice', { order, response, user: true, user })
  })
})

//cancel

router.post('/cancel-order', (req, res) => {
  let orderId = req.body.orderId
  let userId = req.session.user._id
  userHelpers.cancelOrder(orderId,userId).then((response) => {
    res.json({ status: true })
  })
})
///////////////////////////////
router.post('/order/cancelproduct', (req,res)=>{
  let orderid = req.body.orderid
  let productid = req.body.productid
  console.log("cancel single product",orderid ,productid,'============');
  userHelpers.cancelSingleProduct(orderid,productid).then(()=>{
    res.json({status:true})
  })
})

//order 
router.post('/return-order', (req, res) => {
  let orderId = req.body.orderId
  let userId = req.session.user._id
  userHelpers.returnOrder(orderId,userId).then((response) => {
    res.json({ status: true })
  })
})


//RETURN prod
// router.post('/order/returnproduct', async (req, res) => {
//   let product = await productHelpers.getProductDetails(req.body.prodId)

//   userHelpers.returnsingleproduct(req.body).then((response) => {
//     res.json({ status: true })
//   })
// })


router.post('/order/returnproduct', async(req,res)=>{
  let orderid = req.body.orderid
  let productid = req.body.productid
  let id = req.session.user._id
  console.log("return single product")
  userHelpers.returnSingleProduct(orderid,productid,id).then(()=>{
    res.json({status:true})
  })
})











//WALLET
router.get('/wallet', async (req, res) => {
  console.log('--------------------//');
  let userId = req.session.user._id
  let user = req.session.user
  let cartCount = await userHelpers.getCartCount(userId)
  let wallet = await userHelpers.wallet(userId)
  let walletamt = await userHelpers.walletAmount(userId)
  res.render('user/wallet', { user, wallet, cartCount, walletamt })
})




module.exports = router;


/////////
