var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs =require('express-handlebars')
var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');
// const { Db } = require('mongodb');
const bodyParser = require('body-parser');
let db = require('./config/connection')
let adminHelpers=require('./helpers/admin-helpers') 
let productHelpers = require('./helpers/product-helpers')
var userHelpers=require('./helpers/user-helpers')
var Handlebars = require('handlebars')
let session = require("express-session")
// var fileUpload = require("express-fileupload");
const middleware = require('./middleware/authentication-check')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


app.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/layout/",
    partialsDir: __dirname + "/views/partials/",
  })
);
Handlebars.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});
Handlebars.registerHelper('ifCheck', function (arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this)
})
Handlebars.registerHelper('multy',function(a, b) {
  return Number(a) * Number(b);
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(fileUpload());
app.use(session({secret: "key",cookie: {maxAge:600000000000}}));

//mongodb connection
db.connect((err)=>{
  if( err) console.log("connection err")
  else console.log("database connected")
})

app.use('/admin', adminRouter);
app.use('/users', usersRouter);

app.get('/',(req,res)=>{
  res.render('home')
})
//signup
app.get('/signup', middleware.loginUnchecked, (req, res)=>{
  res.render('user/userSignup',{ "signupErr": req.session.signupErr, not: true })
  req.session.signupErr = false
})

app.post('/signup',(req,res)=>{
  console.log(req.body,'mmmmmmmmmmmmmmmmsjsjsjjsjjsj0000111111')
  let userData=req.body
  userHelpers.doSignup(userData).then((resolve)=>{
    console.log(resolve)
  if (resolve.data) {
    res.redirect('/login')
  }else{
    req.session.signupErr = resolve.message;
    res.redirect('/signup');
  }
  }) 
})

//login
app.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/users/home')
  }else{
    res.render('user/userLogin', { not: true,"loginErr": req.session.loginErr, "otpErr": req.session.otpErr });
    req.session.loginErr = false;
  }

})

app.post('/login',(req,res)=>{
  
  let user=req.body
  console.log(user,';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;');
  userHelpers.userLogin(user).then((response)=>{
    console.log(response);
    if (response.status) {
      req.session.loggedIn = true
      req.session.user=response.user
      
      res.redirect('/users/home')
    } else {
      req.session.loginErr="Invalid password or email"
      // res.send('login failed')
      res.redirect('/login')  
    }
  })
})

//USER LOGOUT
app.get('/logout', (req, res) => {
  req.session.loggedIn = false
  req.session.user = null
  res.redirect('/');
})


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
