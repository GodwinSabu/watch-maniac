var express = require('express');
var router = express.Router();
var adminHelpers = require('../helpers/admin-helpers')
var productHelpers = require('../helpers/product-helpers')
// let mkdirp = require('mkdirp')

// --multer--
const cloudinary = require('../utils/cloudinary')
const multer = require('multer')
const path = require('path');
const collection = require('../config/collection');

upload = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname)
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext !== ".webp") {
      cb(new Error("File type is not supported"), false)
      console.log('Its workinggggggggggggggggggggg');
      return
    }
    cb(null, true)
  }
})

/* GET home page. */

router.get('/', function (req, res, next) {
  res.render('admin/adminlogin')
});

router.post('/', (req, res) => {
  let adminData = req.body
  console.log('ppppppp');
  adminHelpers.adminLogin(adminData).then((response) => {
    console.log(response);
    if (response.status) {
      res.redirect('/admin/dashboard')
    } else {
      res.redirect('/admin')
    }
  })
})

//PRODUCTS LISTING
router.get('/product', function (req, res) {
  productHelpers.getAllProducts().then((products) => {
    res.render('admin/products', { products, admin: true });
  })
});
// ADD-PRODUCTS
router.get('/add-product', async (req, res) => {
  let category = await adminHelpers.getCategory()
  res.render('admin/add-products', { admin: true, category })
})

router.post('/add-product', upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 },
]), async (req, res) => {
  console.log(req.files);
  const cloudinaryImageUploadMethod = (file) => {
    console.log("qwertyui");
    return new Promise((resolve) => {
      cloudinary.uploader.upload(file, (err, res) => {
        console.log(err, " asdfgh");
        if (err) return res.status(500).send("Upload Image Error")
        resolve(res.secure_url)
      })
    })
  }

  const files = req.files
  let arr1 = Object.values(files)
  let arr2 = arr1.flat()
  const urls = await Promise.all(
    arr2.map(async (file) => {
      const { path } = file
      const result = await cloudinaryImageUploadMethod(path)
      return result
    })
  )
  console.log(urls);

  productHelpers.addProduct(req.body, urls).then((id) => {
    res.redirect('/admin/product')
  })

})

//edit product

router.get('/edit-product/:id', async (req, res) => {
  let admin = req.session.admin;
  let product = await productHelpers.getProductDetails(req.params.id)
  let category = await adminHelpers.getCategory()

  console.log(product, 'kkkkoo', category, 'lllllll');
  res.render('admin/edit-product', { product, admin: true, admin, category })
})

router.post('/edit-product/:id', upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 },
]), async (req, res) => {
  console.log(req.files);
  let img = {}
  if (req.files.image1) {
    img.img1 = true
  } else {
    img.img1 = false
  }
  if (req.files.image2) {
    img.img2 = true
  } else {
    img.img2 = false
  }
  if (req.files.image3) {
    img.img3 = true
  } else {
    img.img3 = false
  }
  if (req.files.image4) {
    img.img4 = true
  } else {
    img.img4 = false
  }

  const cloudinaryImageUploadMethod = (file) => {
    console.log("qwertyui");
    return new Promise((resolve) => {
      cloudinary.uploader.upload(file, (err, res) => {
        console.log(err, " asdfgh");
        if (err) return res.status(500).send("Upload Image Error")
        resolve(res.secure_url)
      })
    })
  }

  const files = req.files
  let arr1 = Object.values(files)
  let arr2 = arr1.flat()
  const urls = await Promise.all(
    arr2.map(async (file) => {
      const { path } = file
      const result = await cloudinaryImageUploadMethod(path)
      return result
    })
  )
  console.log(urls);
  productHelpers.updateProduct(req.params.id, req.body, urls,img).then((id) => {
    res.redirect('/admin/product')
  })
})

//DELETE PRODUCT

router.get('/delete-product/:id', (req, res) => {
  let prodId = req.params.id
  productHelpers.deleteProduct(prodId).then((response) => {
    res.json(response)
  })
})

//USER-LISTS
router.get('/users', async (req, res) => {
  let limit = 7
  let pageCount = await adminHelpers.pagination(collection.USER_COLLECTION, limit)
  console.log(pageCount, 'kkkkk1234567890lst');
  let pagenumber = 0
  if (req.query?.page) {
    pagenumber = req.query?.page - 1
  }
 let userdata =await adminHelpers.userdata(pagenumber, limit)
    let count = parseInt( userdata.length)
    let i = pagenumber * limit
    for (j = 1; j <= count; j++) {
      userdata [j - 1].number = i + j
    }
    res.render('admin/userlist', { admin: true, userdata , pageCount})
  })


// let orderItems = await adminHelpers.getOrderDetails(pagenumber, limit)
// let count = parseInt(orderItems.length)
// let i = pagenumber * limit
// for (j = 1; j <= count; j++) {
//   orderItems[j - 1].number = i + j
// }
// res.render('admin/order', { admin: true, orderItems, pageCount })
// })
//Change Status of User
router.get("/users/:id", function (req, res) {
  adminHelpers.changeStatus(req.params.id).then((response) => {
    res.redirect("/admin/users");
  })
})

//category
router.get('/category', (req, res) => {
  console.log('oooooppp1111!!!!!1');
  productHelpers.getCategory().then((category) => {
    res.render('admin/category', { category, admin: true })
  })
})

router.post('/category', (req, res) => {
  console.log(req.body, '%%%%%%%%%%%5');
  productHelpers.addCategory(req.body).then(() => {

  res.json({status:true})
  
  }).catch(() => {
    res.json({status: false})
  })
})

//DELETE CATEGORY 
router.get('/delete-category/:id', (req, res) => {
  console.log(req.params.id);
  let catId = req.params.id
  productHelpers.deleteCategory(catId).then((response) => {
    res.json(response)
  })
})

////EDIT CATEGORY
router.put('/edit-category', (req, res) => {
  console.log(req.body, '###########');
  adminHelpers.editCategory(req.body).then(async () => {
    console.log(req.body, 'INNNNNNnnnnnnnnnnnnnnnn');
    await productHelpers.updateProductCategory(req.body)
    res.json({ status: true })
  }).catch(() => {
    res.json({ status: false })
  })
})

//ORDERS


router.get('/orders', async (req, res) => {
  let limit = 5
  let pageCount = await adminHelpers.pagination(collection.ORDER_COLLECTION, limit)
  console.log(pageCount, 'kkkkk1234567890');
  let pagenumber = 0
  if (req.query?.page) {
    pagenumber = req.query?.page - 1
  }
  let orderItems = await adminHelpers.getOrderDetails(pagenumber, limit)
  let count = parseInt(orderItems.length)
  let i = pagenumber * limit
  for (j = 1; j <= count; j++) {
    orderItems[j - 1].number = i + j
  }
  res.render('admin/order', { admin: true, orderItems, pageCount })
})

//ORDER STATUS
router.get('/orders/:status', (req, res) => {
  adminHelpers.getOrderDetails(req.params.status).then((response) => {
    res.json(response)
  })
})

router.post('/order-status', (req, res) => {
  console.log(req.body, '%%%%%%%%%%bbbbbbbbbbbbbbb');
  adminHelpers.changeOrderStatus(req.body.prodId, req.body.orderId, req.body.status).then(() => {
    res.json({ status: true })
  })
})

//DASHBOARD COUNT
router.get('/dashboard', (req, res) => {
  console.log('lll23');
  res.render('admin/dasboard', { admin: true })
})

router.get('/dashboard/:days', (req, res) => {
  console.log('lllloopp', req.params.days);
  adminHelpers.dashboardCount(req.params.days).then((data) => {

    res.json(data)
  })
})

// //BANNER MANAGEMENT
router.get('/banner-management', async (req, res) => {
  let banner = await adminHelpers.getBanner()
  console.log('hhh');
  res.render('admin/banner-management', { admin: true, banner })
})

router.post('/banner', upload.fields([
  { name: 'banner1', maxCount: 1 },
  { name: 'banner2', maxCount: 1 },
  { name: 'banner3', maxCount: 1 },
  { name: 'banner4', maxCount: 1 },
]), async (req, res) => {
  console.log(req.files);
  const cloudinaryImageUploadMethod = (file) => {
    return new Promise((resolve) => {
      cloudinary.uploader.upload(file, (err, res) => {
        console.log(err, " asdfgh");
        if (err) return res.status(500).send("Upload Image Error")
        resolve(res.secure_url)
      })
    })
  }

  const files = req.files
  let arr1 = Object.values(files)
  let arr2 = arr1.flat()
  const urls = await Promise.all(
    arr2.map(async (file) => {
      const { path } = file
      const result = await cloudinaryImageUploadMethod(path)
      return result
    })
  )
  console.log(urls);

  adminHelpers.addBanner(req.body, urls).then(() => {
    res.redirect('/admin/banner-management')
  })
})

//OFFERS
router.get('/offer-management', async (req, res) => {

  let products = await productHelpers.getAllProducts()
  let category = await adminHelpers.getCategory()
  let productOffer = await productHelpers.getProductOffer()
  let categoryOffer = await productHelpers.getCategoryOffer()
  console.log(products, productOffer, 'ooooooooooproducytss');

  res.render('admin/offer', { admin: true, products, category, productOffer, categoryOffer })
})

router.post('/offer-management/product_offer', async (req, res) => {
  productHelpers.addProductOffer(req.body).then((response) => {
    res.redirect('/admin/offer-management')
  })
})
//DELETE PRODUCT OFFER
router.post('/offer-management/delete-product-offer/:id', async (req, res) => {
  let products = await productHelpers.getAllProducts()
  productHelpers.deleteProductOffer(req.params.id, products).then((response) => {
    res.json({ status: true })
  })
})

//CATEGORY OFFER.
router.post('/offer-management/category-offer', (req, res) => {
  productHelpers.addCategoryOffer(req.body).then((response) => {
    res.redirect('/admin/offer-management')
  })
})

//DELETE CATEGORY OFFER
router.post('/offer-management/delete-category-offer', (req, res) => {
  productHelpers.deleteCategoryOffer(req.body.category).then((response) => {
    res.json({ status: true })
  })
})

//COUPON
router.get('/coupon', async (req, res) => {
  let coupon = await adminHelpers.getCoupon()
  res.render('admin/coupon', { admin: true, coupon })
})

//ADD COUPON
router.post('/add-coupon', (req, res) => {
  adminHelpers.addCoupon(req.body).then(() => {
    res.json({ status: true })
  }).catch(() => {
    console.log('Failed');
    res.json({ status: false })
  })
})

//DELETE COUPON
router.post('/delete-coupon', (req, res) => {
  adminHelpers.deleteCoupon(req.body.coupon).then((response) => {
    res.json({ response })
  })
})
//SALES REPORT
router.get('/sales-report', async (req, res) => {
  console.log('lllllll-------------))');
  if (req.query?.month) {
    let month = req.query?.month.split("-")
    let [yy, mm] = month;

    deliveredOrders = await adminHelpers.deliveredOrderList(yy, mm)
    console.log('lllllll-------------))======',deliveredOrders);
  } else if (req.query?.daterange) {
    deliveredOrders = await adminHelpers.deliveredOrderList(req.query);
  } else {
    deliveredOrders = await adminHelpers.deliveredOrderList();
  }
  let amount = await adminHelpers.totalAmountOfdelivered()
  res.render('admin/sales-report', { admin: true, deliveredOrders, amount })
})

// LOGOUT

router.get('/logout', (req, res) => {
  res.redirect('/admin')
})


module.exports = router;
