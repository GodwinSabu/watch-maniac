const mongoClient = require('mongodb').MongoClient;
const dotenv = require('dotenv')
require('dotenv').config()
const state = {
    db:null,
};

module.exports.connect = function (done) {
    const url = process.env.mongodb;
    const dbname = "watchess";

    mongoClient.connect(url, (err, data)=>{
        if (err){
            console.log(err);
            return done(err);

        }
        state.db = data.db(dbname);
        done()
    })
}

module.exports.get = function() {
    return state.db
}