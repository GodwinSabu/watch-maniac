var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
var objectId = require("mongodb").ObjectId;

// ADMIN LOGIN
module.exports = {
    adminLogin: (Data) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let mail = Data.email
            let pass = Data.password
            response = {
                status: false
            }
            let adminData = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: mail })
            console.log(adminData);
            if (adminData) {
                await bcrypt.compare(pass, adminData.password).then((status) => {
                    if (status) {
                        console.log('password matched')
                        response.admin = adminData
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('pass wrong');
                        resolve(response)
                    }
                })
            } else {
                resolve(response)
            }
        })
    }, userdata: (pagenumber, limit) => {
        return new Promise((resolve, reject) => {
            let data = db.get().collection(collection.USER_COLLECTION).find({}).skip(pagenumber * limit).limit(limit).toArray()
            resolve(data)

        })
    },    // User blocking and unblocking
    changeStatus: (userId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, [
                { $set: { status: { $not: "$status" } } }
            ]).then((response) => {
                resolve(response);
            })
            // resolve("Success");
        });
    },
    //DELETE PRODUCT
    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objId(proId) }).then((response) => {
                resolve();
            })
        })
    },

    //CATEGORY
    getCategory: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).find({}).sort({ date: -1 }).toArray()
            resolve(category);
        })
    },
    editCategory: (categoryData) => {
        console.log('///...');
        return new Promise(async (resolve, reject) => {
            categoryData.inputValue = categoryData.inputValue.toUpperCase()
            let categoryCheck = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ category: categoryData.inputValue })
            if (categoryCheck == null) {
                db.get().collection(collection.CATEGORY_COLLECTION).updateOne(
                    {
                        // _id: objectId(categoryData.categoryId),
                        category: categoryData.categoryName
                    }, {
                    $set: {
                        category: categoryData.inputValue
                    }
                }
                ).then((response) => {
                    resolve(response.insertedId)
                })
            } else {
                reject()
            }
        })
    },


    // order details
    getOrderDetails: (pagenumber, limit) => {
        return new Promise(async (resolve, reject) => {
            // let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate(
            //     [
            //         {
            //             '$unwind': {
            //                 'path': '$products'
            //             }
            //         }, {
            //             '$project': {
            //                 'item': '$products.item',
            //                 'quantity': '$products.quantity',
            //                 'deliveryDetails': '$deliveryDetails',
            //                 'paymentMethod': '$paymentMethod',
            //                 'totalAmount': '$totalAmount',
            //                 'status': '$products.status',
            //                 'date': '$date'
            //             }
            //         }, {
            //             '$lookup': {
            //                 'from': 'product',
            //                 'localField': 'item',
            //                 'foreignField': '_id',
            //                 'as': 'product'
            //             }
            //         }, {
            //             '$project': {
            //                 'item': 1,
            //                 'quantity': 1,
            //                 'product': {
            //                     '$arrayElemAt': [
            //                         '$product', 0
            //                     ]
            //                 },
            //                 'deliveryDetails': 1,
            //                 'paymentMethod': 1,
            //                 'totalAmount': 1,
            //                 'status': 1,
            //                 'date': 1
            //             }
            //         },
            //         {
            //             $sort: {
            //                 date: -1
            //             }
            //         }
            //     ]
            // ).skip(pagenumber * limit).limit(limit).toArray()

            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).find().skip(pagenumber * limit).limit(limit).toArray()

            console.log(orderItems, '------------iou');
            resolve(orderItems)
        })
    },

    //ORDER STATUS
    changeOrderStatus: (prodId, orderId, status) => {
        console.log(prodId, '^^^^^^^^^');
        return new Promise((resolve, reject) => {
            let dateStatus = new Date()
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId)},
                { $set: { 'status': status, statusUpdateDate: dateStatus } }).then(() => {
                    resolve()
                })
        })
    },
    //SALES REPORT
    deliveredOrderList: (yy, mm) => {
        return new Promise(async (resolve, reject) => {
            let agg = [{
                $match: {
                    'products.status': 'delivered'
                }
            }, {
                $unwind: {
                    path: '$products'
                }
            }, {
                $project: {
                    item: '$products.item',
                    totalAmount: '$totalAmount',
                    paymentMethod: '$paymentMethod',
                    statusUpdateDate: '$statusUpdateDate',
                }
            }, {
                $lookup: {
                    from: 'product',
                    localField: 'item',
                    foreignField: '_id',
                    as: 'result'
                }
            }, {
                $project: {
                    totalAmount: 1,
                    productPrice: '$result.offerPrice',
                    statusUpdateDate: 1,
                    paymentMethod: '$paymentMethod'
                }
            }]

            if (mm) {
                let start = "1"
                let end = "30"
                let fromDate = mm.concat("/" + start + "/" + yy)
                let fromD = new Date(new Date(fromDate).getTime() + 3600 * 24 * 1000)

                let endDate = mm.concat("/" + end + "/" + yy)
                let endD = new Date(new Date(endDate).getTime() + 3600 * 24 * 1000)
                dbQuery = {
                    $match: {
                        statusUpdateDate: {
                            $gte: fromD,
                            $lte: endD
                        }
                    }
                }
                agg.unshift(dbQuery)
                let deliveredOrders = await db
                    .get()
                    .collection(collection.ORDER_COLLECTION)
                    .aggregate(agg).toArray()
                resolve(deliveredOrders)
            } else if (yy) {
                let dateRange = yy.daterange.split("-")
                let [from, to] = dateRange
                from = from.trim("")
                to = to.trim("")
                fromDate = new Date(new Date(from).getTime() + 3600 * 24 * 1000)
                toDate = new Date(new Date(to).getTime() + 3600 * 24 * 1000)
                dbQuery = {
                    $match: {
                        statusUpdateDate: {
                            $gte: fromDate,
                            $lte: toDate
                        }
                    }
                }
                agg.unshift(dbQuery)
                let deliveredOrders = await db
                    .get()
                    .collection(collection.ORDER_COLLECTION)
                    .aggregate(agg).toArray()
                resolve(deliveredOrders)
            } else {
                let deliveredOrders = await db
                    .get()
                    .collection(collection.ORDER_COLLECTION)
                    .aggregate(agg).toArray()
                resolve(deliveredOrders)
            }
        })
    },

    //TOTAL AMOUNT OF DELIVERED PRODUCTS
    totalAmountOfdelivered: () => {
        return new Promise(async (resolve, reject) => {
            let amount = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    '$match': {
                        'products.status': 'delivered'
                    }
                }, {
                    '$group': {
                        '_id': null,
                        'total': {
                            '$sum': '$totalAmount'
                        }
                    }
                }
            ]).toArray()
            resolve(amount[0]?.total)
        })
    },

    //DASHBOARD COUNT
    dashboardCount: (days) => {
        days = parseInt(days)
        return new Promise(async (resolve, reject) => {
            let startDate = new Date();
            let endDate = new Date();
            startDate.setDate(startDate.getDate() - days)

            let data = {};

            data.deliveredOrders = await db.get().collection(collection.ORDER_COLLECTION).find({
                date: { $gte: startDate, $lte: endDate }, 'products.status': 'delivered'
            }).count()
            data.orderCount = await db.get().collection(collection.ORDER_COLLECTION).find().count()
            data.shippedOrders = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: startDate, $lte: endDate }, 'products  .status': 'shipped' }).count()
            data.placedOrders = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: startDate, $lte: endDate }, 'products.status': 'placed' }).count()
            data.pendingOrders = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: startDate, $lte: endDate }, 'products.status': 'pending' }).count()
            data.canceledOrders = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: startDate, $lte: endDate }, 'products.status': 'cancel' }).count()
            data.returnedOrders = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: startDate, $lte: endDate }, 'products.status': 'return' }).count()
          

            let codTotal = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        date: {
                            $gte: startDate, $lte: endDate
                        },
                        paymentMethod: 'COD'
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: {
                            $sum: "$totalAmount"
                        }
                    }
                }
            ]).toArray()
            console.log(codTotal, 'lllllllllcodTotal');
            data.codTotal = codTotal?.[0]?.totalAmount
            console.log(data.codTotal, 'lllllllllddddddata.codTotal');
            let onlineTotal = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        date: {
                            $gte: startDate, $lte: endDate
                        },
                        paymentMethod: 'online'
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: {
                            $sum: "$totalAmount"
                        }
                    }
                }
            ]).toArray()
            data.onlineTotal = onlineTotal?.[0]?.totalAmount
            console.log(data.onlineTotal, 'lllllllll data.onlineTotal');
            let totalAmount = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        date: {
                            $gte: startDate, $lte: endDate
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: {
                            $sum: "$totalAmount"
                        }
                    }
                }
            ]).toArray()
            data.totalAmount = totalAmount?.[0]?.totalAmount
            console.log(data.totalAmount, 'llllllllldata.totalAmount');
            resolve(data)
        })
    },

    //ADD BANNER
    addBanner: (data, urls) => {
      
        return new Promise((resolve, reject) => {
            data.image = urls
            db.get().collection(collection.BANNER_COLLECTION).updateOne({_id:objectId('638d900726cf48ece27d3361')},
                {
                    $set:{
                        image:urls
                    }
                }
                ).then(() => {
                resolve()
            })
        })
    },

    //GET BANNER
    getBanner: () => {
        return new Promise(async (resolve, reject) => {
            let bannerImages = await db.get().collection(collection.BANNER_COLLECTION).find({}).toArray()
            resolve(bannerImages)
        })
    },
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

    //GET COUPONS
    getCoupon: () => {
        return new Promise(async (resolve, reject) => {
            let coupons = await db.get().collection(collection.COUPON_COLLECTION).find({}).toArray()
            resolve(coupons)
        })
    },

    //ADD COUPON
    addCoupon: (data) => {
        data.coupon = data.coupon.toUpperCase()
        data.couponOffer = Number(data.couponOffer)
        data.minPrice = Number(data.minPrice)
        data.priceLimit = Number(data.priceLimit)
        data.expDate = new Date(data.expDate)
        data.user = []
        return new Promise(async (resolve, reject) => {
            let couponCheck = await db.get().collection(collection.COUPON_COLLECTION).findOne({ coupon: data.coupon })
            if (couponCheck == null) {
                db.get().collection(collection.COUPON_COLLECTION).insertOne(data).then((response) => {
                    resolve()
                })
            } else {
                console.log('Rejected');
                reject()
            }
        })
    },

    //DELETE COUPON
    deleteCoupon: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).deleteOne({ coupon: data })
            resolve()
        })
    },
    //SALES REPORT
    deliveredOrderList: (yy, mm) => {
        return new Promise(async (resolve, reject) => {
            // let agg = [{
            //     $match: {
            //         'products.status': 'delivered'
            //     }
            // }, {
            //     $unwind: {
            //         path: '$products'
            //     }
            // }, {
            //     $project: {
            //         item: '$products.item',
            //         totalAmount: '$totalAmount',
            //         paymentMethod: '$paymentMethod',
            //         statusUpdateDate: '$statusUpdateDate',
            //     }
            // }, {
            //     $lookup: {
            //         from: 'product',
            //         localField: 'item',
            //         foreignField: '_id',
            //         as: 'result'
            //     }
            // }, {
            //     $project: {
            //         totalAmount: 1,
            //         productPrice: '$result.offerPrice',
            //         statusUpdateDate: 1,
            //         paymentMethod: '$paymentMethod'
            //     }
            // }]
            let agg = [
                {
                  '$match': {
                    'status': 'delivered'
                  }
                }
              ]

            if (mm) {
                let start = "1"
                let end = "30"
                let fromDate = mm.concat("/" + start + "/" + yy)
                let fromD = new Date(new Date(fromDate).getTime() + 3600 * 24 * 1000)

                let endDate = mm.concat("/" + end + "/" + yy)
                let endD = new Date(new Date(endDate).getTime() + 3600 * 24 * 1000)
                dbQuery = {
                    $match: {
                        statusUpdateDate: {
                            $gte: fromD,
                            $lte: endD
                        }
                    }
                }
                agg.unshift(dbQuery)
                let deliveredOrders = await db
                    .get()
                    .collection(collection.ORDER_COLLECTION)
                    .aggregate(agg).toArray()
                resolve(deliveredOrders)
            } else if (yy) {
                let dateRange = yy.daterange.split("-")
                let [from, to] = dateRange
                from = from.trim("")
                to = to.trim("")
                fromDate = new Date(new Date(from).getTime() + 3600 * 24 * 1000)
                toDate = new Date(new Date(to).getTime() + 3600 * 24 * 1000)
                dbQuery = {
                    $match: {
                        statusUpdateDate: {
                            $gte: fromDate,
                            $lte: toDate
                        }
                    }
                }
                agg.unshift(dbQuery)
                let deliveredOrders = await db
                    .get()
                    .collection(collection.ORDER_COLLECTION)
                    .aggregate(agg).toArray()
                resolve(deliveredOrders)
            } else {
                let deliveredOrders = await db
                    .get()
                    .collection(collection.ORDER_COLLECTION)
                    .aggregate(agg).toArray()
                resolve(deliveredOrders)
            }
        })
    },

    //TOTAL AMOUNT OF DELIVERED PRODUCTS
    totalAmountOfdelivered: () => {
        return new Promise(async (resolve, reject) => {
            let amount = await db.get().collection(collection.ORDER_COLLECTION).aggregate(
                [
                    {
                      '$match': {
                        'status': 'delivered'
                      }
                    }, {
                      '$group': {
                        '_id': null, 
                        'total': {
                          '$sum': '$totalAmount'
                        }
                      }
                    }
                  ]
            ).toArray()
            resolve(amount[0]?.total)
        })
    }


}


