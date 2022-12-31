var db = require('../config/connection')
var collection = require('../config/collection');
const { ObjectId } = require('mongodb');
var objectId = require("mongodb").ObjectId;

module.exports = {

  //  ADD PRODUCT
  addProduct: (product, urls) => {
    return new Promise(async (resolve, reject) => {
      
      product.stock = parseInt(product.stock)
      product.date = new Date()
      product.description = product.description

      product.price = parseInt(product.price)

      product.offerprice = parseInt(product.price)
 let category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ category: product.category })
      if (category.categoryOffer) {
        let checkCategoryOffer = category.categoryOffer
        if (checkCategoryOffer > 0) {
          let discount = product.price * checkCategoryOffer / 100
          product.offerprice = parseInt(product.price - discount)
          product.offerPrice=product.offerprice
        }else{
          product.categoryOffer=0
          product.productOffer=0
          
        }
      }else{
        product.offerPrice=product.price
        product.categoryOffer=0
          product.productOffer=0
      }
      product.image = urls

      console.log(product,'lllllklkkllklklklklklklklk00000000000000000000000000000000000000000000');

      db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
        console.log(data);
        let id = data.insertedId
        resolve(id)
      })
    })
  },
  //ADD PRODUCT
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
      resolve(products);
    });
  },
  //DELETE PRODUCT
  deleteProduct: (prodId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(prodId) }).then((response) => {
        console.log(response);
        resolve(response)
      })
    })
  },

  //--------------------STOCK TAKING------------------------
  getStockCount: (prodId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(prodId) }).then((response) => {
        console.log("ggggggggggggggggggggggg", response.stock);
        resolve(response.stock)
      })
    });
  },

  //Get product details
  getProductDetails: (prodId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(prodId) }).then((product) => {
        resolve(product);
      });
    });

   
  },
   //edit product
  updateProduct: (proId, proDetails, urls, img) => {

    return new Promise(async (resolve, reject) => {
      let pro = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) })
      let image1 = pro.image[0]
      let image2 = pro.image[1]
      let image3 = pro.image[2]
      let image4 = pro.image[3]
      let uploadImg = []
      if (img.img1) {
        uploadImg[0] = urls[0]
        if (urls == null) {
        } else {
          urls.shift()
        }
      } else {
        uploadImg[0] = image1
      }
      if (img.img2) {
        uploadImg[1] = urls[0]
        if (urls == null) {

        } else {
          urls.shift()
        }
      } else {
        uploadImg[1] = image2
      }

      if (img.img3) {
        uploadImg[2] = urls[0]
        if (urls == null) {

        } else {
          urls.shift()
        }
      } else {
        uploadImg[2] = image3
      }

      if (img.img4) {
        uploadImg[3] = urls[0]
        if (urls == null) {

        } else {
          urls.shift()
        }
      } else {
        uploadImg[3] = image4
      }



      console.log(uploadImg, ';;;;;;;;img');
      let category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ category: proDetails.category })
      let checkCategoryOffer
      let checkProductOffer 
      if (category.categoryOffer || pro.productOffer ) {
         checkCategoryOffer = category.categoryOffer
        checkProductOffer = pro.productOffer
        
      } else {
        proDetails.offerprice=Number(proDetails.price)
      }
      
       
     
      if (checkProductOffer || checkCategoryOffer) {

        if (checkProductOffer > checkCategoryOffer) {

          currentOffer = checkProductOffer

          discount = proDetails.price * currentOffer / 100

        } else {

          currentOffer = checkCategoryOffer

          discount = proDetails.price * currentOffer / 100

        }

        console.log(discount, "xxxxxxxxxxxxxxxxxxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXxxxxxxxxxxxxxxxxxxxxxxxxxxx");

        proDetails.offerprice = parseInt(proDetails.price) - discount


        proDetails.offerprice = parseInt(Math.ceil(proDetails.offerprice))

      }else{

      }


      proDetails.price = parseInt( proDetails.price)
      proDetails.stock =parseInt( proDetails.stock)


      db.get().collection(collection.PRODUCT_COLLECTION)
        .updateOne({ _id: objectId(proId) }, {
          $set: {
            name: proDetails.name,
            description: proDetails.description,
            category: proDetails.category,
            price: proDetails.price,

            offerprice: proDetails.offerprice,

            stock: proDetails.stock,
            image: uploadImg,

            offerPrice: proDetails.offerprice

          }
        }).then((response) => {
          console.log('pppppppppppp', response);
          resolve()
        })
    })
  },


  

  // updateProduct: (proId, proDetails, img) => {
  //   return new Promise(async (resolve, reject) => {
  //     let pro = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) })
  //     let image1 = pro.image[0]
  //     let image2 = pro.image[1]
  //     let image3 = pro.image[2]
  //     let image4 = pro.image[3]
  //     let uploadImg = []
  //     if (img.img1) {
  //       uploadImg[0] = urls[0]
  //       if (urls == null) {
  //       } else {
  //         urls.shift()
  //       }
  //     } else {
  //       uploadImg[0] = image1
  //     }
  //     if (img.img2) {
  //       uploadImg[1] = urls[0]
  //       if (urls == null) {

  //       } else {
  //         urls.shift()
  //       }
  //     } else {
  //       uploadImg[1] = image2
  //     }

  //     if (img.img3) {
  //       uploadImg[2] = urls[0]
  //       if (urls == null) {

  //       } else {
  //         urls.shift()
  //       }
  //     } else {
  //       uploadImg[2] = image3
  //     }

  //     if (img.img4) {
  //       uploadImg[3] = urls[0]
  //       if (urls == null) {

  //       } else {
  //         urls.shift()
  //       }
  //     } else {
  //       uploadImg[3] = image4
  //     }
  //     // productDetails.stock = parseInt(productDetails.stock)
  //     // productDetails.actualprice = parseInt(productDetails.actualprice)
  //     // productDetails.offerprice = parseInt(productDetails.actualprice)
  //     product.price = Number(product.price),
  //     product.offerprice = Number(product.offerprice),
  //     product.stock = Number(product.stock)
  //     let category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id:ObjectId(product.category )})
  // let prod = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ product: productDetails.product })
  // if (prod.prodOfferPer || category.categoryOfferPer) {
  //   if (prod.prodOfferPer > category.categoryOfferPer) {
  //     offerPer = prod.prodOfferPer
  //     discount = productDetails.actualprice * offerPer / 100
  //   } else {
  //     offerPer = category.categoryOfferPer
  //     discount = productDetails.actualprice * offerPer / 100
  //   }
  //   productDetails.offerprice = productDetails.actualprice - discount
  //   productDetails.offerprice = parseInt(Math.ceil(productDetails.offerprice))
  // }
  // db.get()
  //   .collection(collection.PRODUCT_COLLECTION)
  //   .updateOne(
  //     { _id: objectId(prodId) },
  //         {
  //           $set: {
  //             product: productDetails.product,
  //             brand: productDetails.brand,
  //             stock: productDetails.stock,
  //             actualprice: productDetails.actualprice,
  //             offerprice: productDetails.offerprice,
  //             category: productDetails.category,
  //             description: productDetails.description,
  //             image: uploadImg
  //           },
  //         }
  //       )
  //       .then((response) => {
  //         resolve(response);
  //       });
  //   });
  // },




  //ADD CATEGORY
  addCategory: (categoryData) => {
    return new Promise(async (resolve, reject) => {
      categoryData.category = categoryData.category.toUpperCase()
      categoryData.date = new Date();
      let categoryCheck = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ category: categoryData.category })
      if (categoryCheck == null) {
        db.get().collection(collection.CATEGORY_COLLECTION).insertOne(categoryData).then((response) => {
          resolve(response.insertedId)
        })
      } else {
        reject()
      }
    })
  }, 

  //UPDATE PRODUCT CATEGORY
  updateProductCategory: (category) => {
    return new Promise(async (resolve, reject) => {
      category.inputValue = category.inputValue.toUpperCase()
      await db.get().collection(collection.PRODUCT_COLLECTION).updateMany({
        category: category.categoryName
      }, {
        $set: {
          category: category.inputValue
        }
      })
      resolve()
    })
  },

  getCategory: () => {
    return new Promise(async (resolve, reject) => {
      let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
      resolve(category)
    })
  },

  deleteCategory: (ctgryId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: objectId(ctgryId) }).then((response) => {
        resolve(response)
      })
    })
  },
  getcategoryProducts: (categoryname) => {
    return new Promise((resolve, reject) => {
      let categoryProduct = db.get().collection(collection.PRODUCT_COLLECTION).find({ category: categoryname }).toArray()
      resolve(categoryProduct)
    })
  },

  //ADD PRODUCT OFFER
  addProductOffer: (offer) => {
    let prodId = objectId(offer.product)
    let offerPercentage = Number(offer.productOffer)
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
        {
          _id: ObjectId(prodId) 
        },
        {
          $set: { productOffer: offerPercentage }
        }
      )

      let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id:  ObjectId(prodId)  })


      
      if (product.productOffer >= product.categoryOffer) {
        console.log('44444444444444555555555555555555555555555555555555555555555555555555 iffffffffffffffff');
       
        let temp = (product.price * product.productOffer) / 100
        let updatedOfferPrice = (product.price - temp)

        let updatedProduct = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
          {
            _id: prodId
          },
          {
            $set: {
              offerPrice: updatedOfferPrice,
              offerprice: updatedOfferPrice,
              currentOffer: product.productOffer
            }
          }
        )
        resolve(updatedProduct)
      } else if (product.productOffer < product.categoryOffer) {
        console.log('44444444444444555555555555555555555555555555555555555555555555555555 iffffffffffelseeeeeeeeeeeeeee');

        let temp = (product.price * product.categoryOffer) / 100
        let updatedOfferPrice = (product.price - temp)
        let updatedProduct = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
          {
            _id: prodId
          },
          {
            $set: {
              offerPrice: updatedOfferPrice,
              offerprice: updatedOfferPrice,
              currentOffer: product.categoryOffer
            }
          }
        )
        resolve(updatedProduct)
      }else{
        console.log('44444444444444555555555555555555555555555555555555555555555555555555   elseeeeeeeeeeeeeee');
        let temp = (product.price * product.productOffer) / 100
        let updatedOfferPrice = (product.price - temp)
        let updatedProduct = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
          {
            _id: prodId
          },
          {
            $set: {
              offerPrice: updatedOfferPrice,
              offerprice: updatedOfferPrice,
              currentOffer: product.categoryOffer
            }
          }
        )
        resolve(updatedProduct)

      }    
    })
  },
  //GET UPDATED PRODUCT WITH OFFER
  getProductOffer: () => {
    return new Promise(async (resolve, reject) => {
      let productOffer = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate(
        [
          {
            '$match': {
              'productOffer': {
                '$gt': 0
              }
            }
          }, {
            '$project': {
              'name': 1,
              'productOffer': 1
            }
          }
        ]
      ).toArray()
      console.log(productOffer, 'llloo77777');
      resolve(productOffer)
    })
  },

  //DELETE PORDUCT OFFER
  deleteProductOffer: (prodId, product) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(prodId) },
        {
          $set: { productOffer: 0 }
        }
      ).then((response) => {
        db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(prodId) }).then(async (response) => {
          if (response.productOffer == 0 && response.categoryOffer == 0) {
            response.offerPrice = response.actualPrice
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(prodId) }, {
              $set: {
                offerPrice: response.offerPrice,
                actualPrice: response.actualPrice,
                currentOffer: 0
              }
            })
          } else if (product.productOffer < product.categoryOffer) {
            let temp = (product.actualPrice * product.categoryOffer) / 100
            let updatedOfferPrice = (product.actualPrice - temp)
            let updatedProduct = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
              {
                _id: prodId
              },
              {
                $set: {
                  offerPrice: updatedOfferPrice,
                  actualPrice: 0,
                  currentOffer: product.categoryOffer
                }
              }
            )
            resolve(updatedProduct)
          }
        })
        resolve()
      })
    })
  },

  //ADD CATEGORY OFFER
  addCategoryOffer: (offer) => {
    let category = offer.category
    let offerPercentage = Number(offer.categoryOffer)
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.CATEGORY_COLLECTION).updateOne(
        {
          category: category
        },
        {
          $set: {
            categoryOffer: offerPercentage
          }
        }
      )
      await db.get().collection(collection.PRODUCT_COLLECTION).updateMany(
        {
          category: category
        },
        {
          $set: {
            categoryOffer: offerPercentage
          }
        }
      )
      let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({
        category: category
      }).toArray()

      for (let i = 0; i < products.length; i++) {

        if (products[i].categoryOffer >= products[i].productOffer) {

          let temp = (products[i].price * products[i].categoryOffer) / 100
          let updatedOfferPrice = (products[i].price - temp)
          db.get().collection(collection.PRODUCT_COLLECTION).updateOne({
            _id: objectId(products[i]._id)
          },
            {
              $set: {
                offerPrice: updatedOfferPrice,
                currentOffer: products[i].categoryOffer
              }
            } 
          )

        } else if (products[i].categoryOffer < products[i].productOffer) {

          let temp = (products[i].price * products[i].productOffer) / 100
          let updatedOfferPrice = (products[i].price - temp)
          db.get().collection(collection.PRODUCT_COLLECTION).updateOne({
            _id: objectId(products[i]._id)
          },
            {
              $set: {
                offerPrice: updatedOfferPrice,
                currentOffer: products[i].productOffer
              }
            }
          )
        }
      }
      resolve()
    })

  },

  //GET UPDATED CATEGORY WITH OFFER
  getCategoryOffer: () => {
    return new Promise(async (resolve, reject) => {
      let categoryOffer = await db.get().collection(collection.CATEGORY_COLLECTION).find(
        {
          categoryOffer: { $gt: 0 }
        }
      ).toArray()
      resolve(categoryOffer)
    })
  },

  //DELTE CATEGORY OFFER
  deleteCategoryOffer: (category) => {
    return new Promise(async (resolve, reject) => {
      db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ category: category }, { $set: { categoryOffer: 0 } })
      db.get().collection(collection.PRODUCT_COLLECTION).updateMany({ category: category }, { $set: { categoryOffer: 0 } }).then(async (response) => {
        let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: category }).toArray()
        for (i = 0; i < products.length; i++) {
          if (products[i].productOffer == 0 && products[i].categoryOffer == 0) {
            products[i].offerPrice = products[i].price
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(products[i]._id) }, { $set: { offerPrice: products[i].offerPrice, currentOffer: 0 } })
          } else if (products[i].categoryOffer < products[i].productOffer) {
            let temp = (products[i].price * products[i].productOffer) / 100
            let updatedOfferPrice = (products[i].price - temp)
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({
              _id: objectId(products[i]._id)
            },
              {
                $set: {
                  offerPrice: updatedOfferPrice,
                  currentOffer: products[i].productOffer
                }
              }
            )
          }
        }
      })
      resolve()
    })
  },

};



