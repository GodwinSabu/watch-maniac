var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')

const { ObjectID } = require('bson');
var objectId = require("mongodb").ObjectId;
const Razorpay = require('razorpay');
const { Collection } = require('mongodb');

var instance = new Razorpay({
    key_id: 'rzp_test_bSUWAytvaSMERx',
    key_secret: 'htlysecXsQCUEKvYPdGIoBg8'
})

module.exports = {
    doSignup: (userData) => {
        userData.status = true
        let newUser
        return new Promise(async (resolve, reject) => {
            let emailChecking = await db.get().collection(collection.USER_COLLECTION).find({ email: userData.email }).toArray()

            if (emailChecking.length !== 0) {
                console.log(emailChecking)
                resolve({ data: false, message: "Email is already used" })

            } else {
                console.log(userData, 'uuuuuuuuuuuuserrrrrrrrdataaaaaaa111');

                userData.referal = parseInt(new Date().getTime()) + userData.firstname
                userData.password = await bcrypt.hash(userData.password, 10);
                userData.date = new Date()

                newUser = await db.get().collection(collection.USER_COLLECTION).insertOne(userData)



                db.get().collection(collection.WALLET_COLLECTION).insertOne({
                    userId: userData._id,
                    walletBalance: parseInt(0),
                    referralId: userData.referal,
                    transaction: []
                })


            }
            console.log(newUser, 'nnnnnneeeeeeeeeeeeeeeewwmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmwww');
            // new one
            let frdReferal = await db.get().collection(collection.USER_COLLECTION).findOne({ 'referal': userData.referralCode })
            console.log(frdReferal, 'kkkkkkkkkkkkkkkkkkkkkkkkffffffffffffffffrrrrrrrrrrrrrrrrrreeeeeeeeeeeeeennnnnnnnnnnnnnnnddddddddddddddddddddddd');
            if (frdReferal !== 0) {
                console.log('corect refereal');
                let sinReferral = {
                    orderId: new ObjectID(),
                    date: new Date().toDateString(),
                    mode: "Credit",
                    type: "Got referral Amount",
                    amount: 100,
                }
                await db.get().collection(collection.WALLET_COLLECTION).updateOne({ userId: ObjectID(newUser.insertedId) },
                    { $set: { walletBalance: 100 }, $push: { transaction: sinReferral } })
                //old one
                let frndReeferal = {
                    orderId: new ObjectID(),
                    date: new Date().toDateString(),
                    mode: "Credit",
                    type: "Amount credited Through Referral",
                    amount: 100,
                }
                await db.get().collection(collection.WALLET_COLLECTION).updateOne({ userId: ObjectID(frdReferal._id) },
                    { $inc: { walletBalance: 100 }, $push: { transaction: frndReeferal } })
                // if referal is credited
                resolve({ data: true });
            } else {
                // if referal is not credited
                resolve({ data: true });
            }

        })
    },
    // PAGINATION
    pagination: (Collection, limit) => {

        return new Promise(async (resolve, reject) => {
            //8
            let totalItem = await db.get().collection(Collection).find().toArray()

            let numberOfItem = totalItem.length

            let pageCount = numberOfItem / limit

            pageCount = Math.ceil(pageCount)

            let page = []

            for (i = 1; i <= pageCount; i++) {

                page.push(i)

            }

            resolve(page)

        })
    },
    //GET WALLET
    getWallet: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WALLET_COLLECTION).findOne({ userId: objectId(userId) }).then((response) => {
                resolve(response)
                console.log(response, 'respooooooooooooooonse');
            })
        })
    },

    //USER LOGIN

    userLogin: (userData) => {
        console.log(userData, 'enteeeeeeeeeeeeeeeeeeeeeeee');
        let response = {};
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        response.user = user;
                        response.status = true;
                        resolve(response);
                    } else {
                        console.log('Login Failed');
                        resolve({ status: false })
                    }
                }
                )
            }
            else {
                console.log('Login err');
                resolve({ status: false })
            }

        })
    },

    // //OTP LOGIN
    otpLogin: (userData) => {
        let response = {};
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: userData })
            console.log(user, 'kkmmmmmmm');
            if (user) {
                response.user = user;
                response.status = true;
                resolve(response);
            } else {
                console.log('Login Failed');
                resolve({ status: false })
            }
        }
        )
    },

    //add to cart
    addToCart: (prodId, userId) => {

        console.log(prodId, userId);
        let productObject = {
            item: objectId(prodId),
            quantity: 1
        }
        console.log("oooooooooooooooooooooooooooooooooooooooooooooooooooooooo", productObject);
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })

            if (userCart) {
                // console.log(productid);
                let productExist = userCart.products.findIndex(
                    (products) => products.item == prodId
                );
                console.log(productExist)
                // console.log(usercart)
                if (productExist != -1) {
                    db.get()
                        .collection(collection.CART_COLLECTION)
                        .updateOne(
                            { user: objectId(userId), "products.item": objectId(prodId) },
                            {
                                $inc: { "products.$.quantity": 1 },
                            }
                        )
                        .then(() => {
                            resolve();
                        });
                } else {
                    db.get()
                        .collection(collection.CART_COLLECTION)
                        .updateOne(
                            { user: objectId(userId) },
                            {
                                $push: { products: productObject },
                            }
                        )
                        .then((response) => {
                            resolve("added to cart");
                        });
                }
            } else {
                let cartobj = {
                    user: objectId(userId),
                    products: [productObject],
                };
                db.get()
                    .collection(collection.CART_COLLECTION)
                    .insertOne(cartobj)
                    .then(() => {
                        resolve("create a cart to add product");
                    });
            }
        })
    },


    ordercart: (userId) => {


        console.log(userId);
        return new Promise(async (resolve, reject) => {

            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate(
                [
                    {
                        '$match': {
                            'user': new ObjectID(userId)
                        }
                    }, {
                        '$unwind': {
                            'path': '$products'
                        }
                    }, {
                        '$lookup': {
                            'from': 'product',
                            'localField': 'products.item',
                            'foreignField': '_id',
                            'as': 'cartproduct'
                        }
                    }, {
                        '$project': {
                            'productId': '$products.item',
                            'quantity': '$products.quantity',
                            'product': {
                                '$arrayElemAt': [
                                    '$cartproduct', 0
                                ]
                            }
                        }
                    }, {
                        '$project': {
                            'productId': 1,
                            'quantity': 1,
                            'name': '$product.name',
                            'description': '$product.description',
                            'category': '$product.category',
                            'price': '$product.price',
                            'stock': '$product.stock',
                            'date': '$product.date',
                            'offerprice': '$product.offerprice',
                            'offerPrice': '$product.offerPrice',
                            'image': '$product.image',
                            'categoryOffer': '$product.categoryOffer',
                            'productOffer': '$product.productOffer',
                            'currentOffer': '$product.currentOffer',
                            'actualPrice': '$product.actualPrice',
                        }
                    }
                ]
            ).toArray()

            for (i = 0; i < cartItems.length; i++) {
                cartItems[i].Cancel = false
                cartItems[i].Return = false
            }



            resolve(cartItems)

        })

    },



    getCartProducts: (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([

                {
                    '$match': {
                        'user': new objectId(userId)
                    }
                }, {
                    '$unwind': {
                        'path': '$products'
                    }
                }, {
                    '$project': {
                        'item': '$products.item',
                        'quantity': '$products.quantity'
                    }
                }, {
                    '$lookup': {
                        'from': 'product',
                        'localField': 'item',
                        'foreignField': '_id',
                        'as': 'cartproduct'
                    }
                }, {
                    '$project': {
                        'item': 1,
                        'quantity': 1,
                        'products': {
                            '$arrayElemAt': [
                                '$cartproduct', 0
                            ]
                        }
                    }
                }

            ]).toArray()
            resolve(cartItems)

        })
    },
    //DELTE PRODUCT FROM CART
    deleteProductFromWish: (prodId, userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WISHLIST_COLLECTION).updateOne({
                user: objectId(userId)
            },
                {
                    $pull: { products: { item: objectId(prodId) } }
                }
            ).then(() => {
                resolve()
            })
        })
    },



    //CART COUNT

    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)

        })
    },

    //CART PRODUCT QUANTITY

    changeProductQuantity: (details) => {
        console.log(details);
        count = parseInt(details.count)
        console.log(count, 'kkkkkkkkkkkkkkkk');
        quantity = parseInt(details.quantity)
        return new Promise(async (resolve, reject) => {

            if (count == -1 && quantity == 1) {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart) },
                        {
                            $pull: { products: { item: objectId(details.product) } }
                        }
                    ).then((response) => {
                        resolve({ removeProduct: true })
                    })
            } else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': count }
                        }).then((response) => {
                            resolve({ status: true })
                        })
            }

        })
    },

    //TOTAL AMOUNT OF CART PRODUCTS

    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: [{ $toInt: '$quantity' }, { $toInt: '$product.offerprice' }] } }
                    }
                }
            ]).toArray()
            console.log(total[0]?.total, 'dd');
            resolve(total[0]?.total)
        })
    },
    //GET WALLET
    getWallet: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WALLET_COLLECTION).findOne({ userId: objectId(userId) }).then((response) => {
                resolve(response)

            })
        }) 
    },

    //DECREASE WALLET

    decreaseWallet: (userId, amount) => {
        db.get().collection(collection.WALLET_COLLECTION).findOne({ userId: objectId(userId) }).then((response) => {
            let updatedBalance = response.walletBalance - amount
            db.get().collection(collection.WALLET_COLLECTION).updateOne({ userId: objectId(userId) }, { $set: { walletBalance: updatedBalance } })
        })
    },
    //WALLET AMOUNT

    walletAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let walletamt = await db.get().collection(collection.WALLET_COLLECTION).findOne({ userId: objectId(userId) })
            if (walletamt) {
                resolve(walletamt)
            }
        })
    },

    //ADDRESS DETAILS

    addressDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectId(userId)
                    }
                },
                {
                    $unwind: { path: '$address' }
                }, {
                    $project: {
                        address: 1,
                    }
                }
            ]).toArray()
            resolve(address)
        })
    },

    //DELETE ADDRESS
    deleteAddress: (userId, addressId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({
                _id: objectId(userId)
            },
                {
                    $pull: { address: { _id: objectId(addressId) } }
                }
            ).then((response) => {
                resolve()
            })
        })
    },

    getUseraddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.USER_COLLECTION).aggregate(
                [
                    {
                        '$match': {
                            '_id': new ObjectID(userId)
                        }
                    }, {
                        '$unwind': {
                            'path': '$address'
                        }
                    },
                    {
                        '$project': {
                            'address': 1
                        }
                    }
                ]
            ).toArray()
            resolve(address)
        })
    },

    deleteCartProduct: (prodId, userId) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.CART_COLLECTION)
                .updateOne(
                    {
                        user: objectId(userId),
                    },
                    {
                        $pull: { products: { item: objectId(prodId) } },
                    }
                )
                .then(() => {
                    resolve();
                });
        });

    },

    //ADD ADDRRESS

    addAddress: (data, user) => {
        data._id = new ObjectID()
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne(
                {
                    _id: ObjectID(user)

                },
                {
                    $push: { address: data }
                }
            ).then()
            resolve()

        })
    },

    //PLACE ORDER

    placeOrder: (order, products, total, paymentMethod, userId, discountCoupon, couponApply) => {
        return new Promise((resolve, reject) => {
            let status = paymentMethod === 'COD' ? 'placed' : 'pending'
            products.forEach(element => {
                element.status = status
            });
            let orderObj = {
                deliveryDetails: {
                    fullname: order[0]?.address.firstname + " " + order[0]?.address.lastname,
                    email: order[0]?.address.email,
                    address: order[0]?.address.address,
                    mobile: order[0]?.address.mobile,
                    country: order[0]?.address.country,
                    state: order[0]?.address.state,
                    district: order[0]?.address.district,
                    city: order[0]?.address.city,
                    pincode: order[0]?.address.pincode

                },
                userId: objectId(userId),
                paymentMethod: paymentMethod,
                products: products,
                totalAmount: total,
                displayDate: new Date().toDateString(),
                date: new Date(),
                coupondiscount: discountCoupon,
                // return: false
                status: "pending"
            }
            if (couponApply) {
                orderObj.couponApply = true
            } else {
                orderObj.couponApply = false
            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                if (status === 'placed') {
                    console.log('innnnnnnnnnnnnnnnnnnnnnncartdeletes');
                    db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(userId) })

                    products.forEach(element => {
                        console.log('innnnnnnnnnnnnnnnnnnnnnn');
                        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(element.productId) }, { $inc: { stock: -(element.quantity) } })
                    })
                    resolve(response.insertedId)
                } else {
                    console.log('ooouttttttttttt');
                    resolve(response.insertedId)
                }
            })
        })
    },

    //USER ORDERS
    getUserOrders: (userId, pagenumber, limit) => {
        return new Promise((resolve, reject) => {
            let orders = db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(userId) }).sort({date:-1}).skip(pagenumber * limit).limit(limit).toArray()
            resolve(orders)





            // let orders = db.get().collection(collection.ORDER_COLLECTION)
            //     .aggregate(
            // {
            //     $match: {
            //         userId: objectId(userId),
            //     }
            // },
            // {
            //     $unwind: '$products'
            // },
            // {
            //     $project: {
            //         item: '$products.item',
            //         quantity: '$products.quantity',
            //         price: '$products.offerPrice',
            //         deliveryDetails: '$deliveryDetails',
            //         paymentMethod: '$paymentMethod',
            //         totalAmount: '$totalAmount',
            //         status: '$products.status',
            //         displayDate: '$displayDate',
            //         date: '$date'
            //     }
            // }, {
            //     $lookup: {
            //         from: collection.PRODUCT_COLLECTION,
            //         localField: 'item',
            //         foreignField: '_id',
            //         as: 'product'
            //     }
            // },
            // {
            //     $project: {
            //         item: 1,
            //         quantity: 1,
            //         product: { $arrayElemAt: ['$product', 0] },
            //         deliveryDetails: 1,
            //         paymentMethod: 1,
            //         totalAmount: 1,
            //         offerPrice: '$products.offerPrice',
            //         status: 1   ,
            //         statusp: '$products.status',
            //         displayDate: 1,
            //         date: 1

            //     }
            // },
            // {
            //     $sort: { date: -1 }

            // }
            //     [
            //         {
            //             '$match': {
            //                 'userId': new ObjectID(userId)
            //             }
            //         }, {
            //             '$unwind': {
            //                 'path': '$products'
            //             }
            //         }, {
            //             '$project': {
            //                 'item': '$products.item',
            //                 'id': 1,
            //                 'quantity': '$products.quantity',
            //                 'product': '$products.products',
            //                 'deliveryDetails': 1,
            //                 'paymentMethod': 1,
            //                 'totalAmount': 1,
            //                 'offerPrice': '$products.products.offerPrice',
            //                 'statusoutside': 1,
            //                 'status': '$products.status',
            //                 'displayDate': 1,
            //                 'date': 1
            //             }
            //         },
            //         {
            //             $sort: { date: -1 }

            //         }

            //     ]
            // ).toArray()
        })
    },
    // SINGLE ORDER DATA
    singleOrderData: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderDetails = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: ObjectID(orderId) })
            resolve(orderDetails)
        })
    },

    //DELETE PENDING ORDERS

    deletePendingOrders: async () => {
        await db.get().collection(collection.ORDER_COLLECTION).deleteMany({ 'products.status': 'pending' })
    },

    //CHANGE PASSWORD

    changePassword: (password, userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).find({ _id: objectId(userId) }).toArray()
            if (user) {
                bcrypt.compare(password.password, user[0].password).then(async (status) => {
                    if (status) {
                        password.newPassword = await bcrypt.hash(password.newPassword, 10)
                        db.get().collection(collection.USER_COLLECTION).updateOne({
                            _id: objectId(userId)
                        },
                            {
                                $set: { password: password.newPassword }
                            }).then((response) => {
                                resolve(response)
                            })
                    }
                }).catch((response) => {
                    reject()
                })
            }
        })
    },

    //EDIT PROFILE

    editProfile: (userId, updatedData) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTION)
                .updateOne(
                    {
                        _id: objectId(userId)
                    },
                    {
                        "$set": {
                            firstname: updatedData.firstname,
                            lastname: updatedData.lastname,
                            email: updatedData.email,
                            mobile: updatedData.mobile
                        }
                    }
                )
            resolve()
        })
    },

    //ADD TO WISH LIST
    addToWishlist: (prodId, userId) => {
        return new Promise(async (resolve, reject) => {
            let userWish = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
            let prodObj = {
                item: objectId(prodId),
            }
            if (userWish) {
                let prodExist = userWish.products.findIndex(product => product.item == prodId)
                console.log(prodExist);
                if (prodExist == -1) {
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({
                        user: objectId(userId)
                    },
                        {
                            $push: { products: { item: objectId(prodId) } }
                        }
                    ).then((response) => {
                        resolve()
                    })
                } else {
                    db.get().collection(collection.WISHLIST_COLLECTION)
                        .updateOne({ user: objectId(userId) },
                            {
                                $pull: { products: { item: objectId(prodId) } }
                            }).then((response) => {
                                reject()
                            })
                }
            } else {
                let wishObj = {
                    user: objectId(userId),
                    products: [prodObj]
                }
                console.log('ooooooooooo', wishObj);
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishObj).then((response) => {
                    resolve()
                })
            }
        })
    },

    //WISHLIST PRODUCTS

    getWishProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let wishlist = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                    }
                }, {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            resolve(wishlist)
        })
    },

    //WISHLIST COUNT

    getWishCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count
            let wish = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
            if (wish) {
                count = wish.products.length
            }
            resolve(count)
        })
    },

    //DELTE PRODUCT FROM CART

    deleteProductFromWish: (prodId, userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WISHLIST_COLLECTION).updateOne({
                user: objectId(userId)
            },
                {
                    $pull: { products: { item: objectId(prodId) } }
                }
            ).then(() => {
                resolve()
            })
        })
    },

    //VERIFY PAYMENT

    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'htlysecXsQCUEKvYPdGIoBg8');
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })
    },

    //CART PRODUCTS
    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            resolve(cart.products)
        })
    },

    //CHANGE PAYMENT STATUS
    changePaymentStatus: (orderId, userId, products) => {
        return new Promise((resolve, reject) => {
            products.forEach(async (item) => {
                let response = await db.get().collection(collection.ORDER_COLLECTION)
                    .updateOne({
                        _id: objectId(orderId), 'products.item': objectId(item.item)
                    }, {
                        $set: {
                            'products.$.status': 'placed'
                        }
                    })
                // await db.get().collection(collection.PRODUCT_COLLECTION)
                //     .updateOne({
                //         _id: objectId(item.item)
                //     }
                //     , {
                //         $inc: {
                //             stock: -(item.quantity)
                //         }
                //     }
                //     )
                // console.log(response, 'responseeeeeeeeeeeeeee');
            })
            db.get().collection(collection.CART_COLLECTION)
                .deleteOne({
                    user: objectId(userId)
                })
            resolve()
        })
    },
    
    walletPurchase: (userId, wallet, total,products) => {
        return new Promise(async (resolve, reject) => {
            if (wallet.walletBalance >= total) {
                const obj4 = {
                    orderId: new objectId(),
                    date: new Date().toDateString(),
                    mode: "Debit",
                    type: "Purchase",
                    amount: total
                }
                await db.get().collection(collection.WALLET_COLLECTION).updateOne(
                    { userId: objectId(userId) }, { $inc: { walletBalance: -(total) }, $push: { transaction: obj4 } })
                    .then((response) => {

                        // products.forEach(element => {
                        //     console.log('innnnnnnnnnnnnnnnnnnnnnnwallet');
                        //     db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(element.item) }, { $inc: { stock: -(element.quantity) } })
                        // })
                        resolve(response)

                    })

                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(userId) })
                products.forEach(element => {
                    console.log('innnnnnnnnnnnnnnnnnnnnnnwallet');
                    db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(element.item) }, { $inc: { stock: -(element.quantity) } })
                })


            } else {
                reject("No enough amount")
            }
        })
    },

    //RAZORPAY

    generateRazorpay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: total * 100,
                currency: "INR",
                receipt: "" + orderId
            }
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('New order :', order);
                    resolve(order)
                }

            })
        })
    },

    //GET SINGLE ORDER DETAILS 

    getOrder: (orderId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).findOne(
                { _id: objectId(orderId) }
            ).then((response) => {
                resolve(response)
            })
        })
    },

    getOrderPdts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).find({ _id: objectId(orderId) })
                .toArray()
            resolve(order)
        })
    },


    //CANCEL ORDER

    // cancelOrder: (orderId) => {
    //     return new Promise((resolve, reject) => {
    //         db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectID(orderId) },
    //             {
    //                 $set: {
    //                     status: 'canceled'
    //                 }

    //             }
    //         ).then(() => {
    //             resolve()
    //         })
    //     })
    // },


    cancelOrder: (orderId, userId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
                { $set: { 'status': "cancelled" } })


            let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(orderId) })
            console.log(order, '============================================================================',);


            //   if (order[0].status !== 'pending') {
            if (order.paymentMethod == 'online' || order.paymentMethod == 'wallet') {
                const obj = {
                    orderId: new ObjectID(),
                    date: new Date().toDateString(),
                    reference: order._id,
                    mode: "Credit",
                    type: "Refund",
                    amount: order.totalAmount,
                }

                let amt = parseInt(order.totalAmount)
                console.log(amt, 'ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo--------------------------------------------------------------------------');
                await db.get().collection(collection.WALLET_COLLECTION).updateOne({ userId: objectId(userId) }, { $inc: { walletBalance: amt }, $push: { transaction: obj } })
                // console.log('lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll');
                // updateOne({user:objectid(id)},{$inc:{ balance : transaction.amount },$push:{ transactions : transaction }})
                resolve("Success");
            } else {
                resolve("Success");

            }
        }
        )
    },
    //CANCEL ORDER
    cancelSingleProduct: (orderid, productid) => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(orderid) })
            let length = order.products.length
            console.log(length,'33333333');
            console.log(order,'//////////222222')
            console.log(productid,'/////////11');


            console.log('---------------');
            console.log("oooooooooooooooooooooooooooooooooooooooooooooooo",(String)(new objectId(order.products[0].productId)) );
            console.log('---------------++++++');


            for (i = 0; i < length; i++) {
                if( (String)(new objectId(order.products[i].productId)) == objectId(productid)){
                    console.log("cancel single product matches and cancelled");
                    order.products[i].Cancel = true
                    console.log("product canceled", order.products[i].name);
                    db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderid), "products.productId": objectId(productid) },
                        { $set: { "products.$.Cancel": true, "products.$.Return": true } }).then(async (response) => {
                            console.log(response);
                            let ordercheck = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(orderid) })
                            console.log(ordercheck);
                            let ordercheckLength = ordercheck.products.length
                            console.log(ordercheckLength);
                            let cancelorder = false




                            for (j = 0; j < ordercheckLength; j++) {
                                if (ordercheck.products[j].Cancel == true) {
                                    cancelorder = true
                                } else {
                                    cancelorder = false
                                }
                            }



                            if (cancelorder == true) {
                                db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderid) }, { $set: { "status": "Cancel Order" } }).then(() => {
                                    resolve()
                                })
                            } else {
                                resolve()
                            } console.log("cancel single product matches and cancellednnnnnnnnnnnnnnn");


                        }) 
                    break
                }
            }

        })
    },

    returnOrder: (orderId, userId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
                { $set: { 'status': "return" } })


            let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(orderId) })
            const obj = {
                orderId: new ObjectID(),
                date: new Date().toDateString(),
                reference: order._id,
                mode: "Credit",
                type: "Refund",
                amount: order.totalAmount,
            }

            let amt = parseInt(order.totalAmount)
            await db.get().collection(collection.WALLET_COLLECTION).updateOne({ userId: objectId(userId) }, { $inc: { walletBalance: amt }, $push: { transaction: obj } })

            resolve("Success");
        }
        )
    },

    // returnsingleproduct: (data) => {
    //     console.log(data, 'ooopoooooooooooooooooooooooooommmmmmmmmmmmmmmbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
    //     return new Promise((resolve, reject) => {

    //         let orderId = data.orderId
    //         let prodId = data.proId
    //         console.log('ooooooooooooooombbbbbbbbbbbb3333333333333');

    //         db.get().collection(collection.ORDER_COLLECTION).updateOne(
    //             {
    //                 _id: objectId(orderId),
    //                 'products.item': objectId(prodId)

    //             },
    //             {
    //                 $set: { 'products.$.status': 'return' }
    //             }

    //         ).then(async () => {
    //             resolve()
    //             let totalprice = await db.get().collection(collection.ORDER_COLLECTION).aggregate(
    //                 [
    //                     {
    //                         '$match': {
    //                             '_id': new ObjectID(orderId),

    //                         }
    //                     }, {
    //                         '$unwind': {
    //                             'path': '$products'
    //                         }
    //                     },
    //                     {
    //                         '$match': {
    //                             'products.item': new ObjectID(prodId)
    //                         }
    //                     },
    //                     {
    //                         '$project': {
    //                             'price': '$products.products.offerprice',
    //                             'quantity': '$products.quantity',
    //                             'totalprice': {
    //                                 '$multiply': [
    //                                     '$products.products.offerprice', '$products.quantity',
    //                                 ]
    //                             },
    //                             'userId': 1

    //                         }
    //                     }
    //                 ]
    //             ).toArray()
    //             console.log(totalprice, 'llllll////////////////----');
    //             let price = totalprice[0].totalprice
    //             let user = totalprice[0].userId
    //             console.log(price, '////price');
    //             const obj3 = {
    //                 orderId: new ObjectID(),
    //                 date: new Date().toDateString(),
    //                 mode: "Credit",
    //                 type: "Return",
    //                 amount: price,
    //             }
    //             db.get().collection(collection.WALLET_COLLECTION).updateOne(
    //                 {

    //                     userId: ObjectID(user)

    //                 },
    //                 {
    //                     $inc: { walletBalance: price }, $push: { transaction: obj3 }
    //                 }
    //             )
    //         })
    //     })
    // }
    returnSingleProduct : (orderid,productid,id)=>{
        return new Promise ((resolve,reject)=>{
          
          db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderid),"products.productId":objectId(productid)},
          { $set: {"products.$.Return" : true} }).then(async (response)=>{
            console.log(response)
    
            let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(orderid)})
            console.log(order,'--------------------]]');
            let length = order.products.length


            for(i=0; i < length  ; i++){
                if( (String)(new objectId(order.products[i].productId)) == objectId(productid)){

                    db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderid), "products.productId": objectId(productid) },
                    { $set: { "products.$.Cancel": true, "products.$.Return": true } })

                    order.products[i].Return = true
                }
            }
            


            let NOTreturn  = false

            for(j=0 ; j< length; j++){

                if ( order.products[j].Return  == false  ) {
                    NOTreturn= true
                    break;
                }
            }

            if (NOTreturn) {
                console.log('complete not orser return');
            } else {
               await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderid) }, { $set: { "status": "return" } })
            }
    
    
    
            resolve()
          })
        })
    },

    wallet: (userId) => {
        return new Promise(async (resolve, reject) => {
            let wallet = await db.get().collection(collection.WALLET_COLLECTION).aggregate([
                {
                    $match: {
                        userId: objectId(userId)
                    }
                },
                {
                    $unwind: {
                        path: "$transaction"
                    }
                },
                {
                    $project: { "transaction": 1 }
                },
                {
                    $sort: { "transaction.date": -1 }
                }
            ]).toArray()
            resolve(wallet)

        })
    },

    //REDEEM COUPON
    redeemCoupon: (couponDetails) => {
        let couponName = couponDetails.coupon.toUpperCase()
        return new Promise(async (resolve, reject) => {
            currentDate = new Date()
            let couponCheck = await db.get().collection(collection.COUPON_COLLECTION).findOne({ $and: [{ coupon: couponName }, { expDate: { $gte: currentDate } }] })
            console.log(couponCheck);
            if (couponCheck !== null) {
                resolve(couponCheck)
            } else {
                reject()
            }
        })
    },
}    