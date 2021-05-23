var express = require('express');
var app = express();
var passport = require('passport')
var session = require('express-session')
var bodyParser = require('body-parser')
var env = require('dotenv').config('./.env')
var exphbs = require ('express-handlebars')
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var path = require('path');

//For BodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// For Passport

app.use(session({ secret: 'keyboard cat' /*secret key*/ , resave: true, saveUninitialized:true})); // session secret
app.use(passport.initialize());//
app.use(passport.session()); // persistent login sessions

//For Handlebars
app.set("view engine", "hbs");
app.set("views", "./dist/views");

app.engine(
  "hbs",
  exphbs({
    extname: "hbs",
    defaultLayout: false,
    layoutsDir: "./dist/views"
  })
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// tslint:disable-next-line:no-console
// console.log(path.join(__dirname, 'public')); coppy to dist!
app.use(express.static('public'));

//Routes by passport for login
var authRoute = require('./routes/auth.js');
authRoute(app, passport);

// Cho phép các api của ứng dụng xử lý dữ liệu từ body của request
app.use(express.json());

//load database Models
const models = require("./models");
//Sync Database

models.sequelize.sync(/*{force: true}*/).then(function() {// sys db [new model, update,...]
  // tslint:disable-next-line:no-console
  console.log('Nice! Database looks fine')
}).catch(function(err) {
  // tslint:disable-next-line:no-console
  console.log(err, "Something went wrong with the Database Update!");
});

const streamcontroller = require("./controllers/streamcontroller");
streamcontroller.init(models);

const tokenauthcontroller = require("./controllers/tokenauthcontroller");
tokenauthcontroller.setupDatabase(models);// setup tokenauthencontroller
//chatController:
const chatController = require("./controllers/chatController");
chatController.setupDatabase(models);// setup chatcontroller
// routes by jwt for chat

const appAuthenticate = require('./routes/appAuthenticate.js');
appAuthenticate(app, tokenauthcontroller, chatController);// setup chat router

const streamAPI = require('./routes/streamAPI.js');
streamAPI(app, streamcontroller);// setup stream router

const chatAPI = require('./routes/chatAPI.js');
chatAPI(app, chatController);// setup chat router

//load passport strategies
const pssprt = require('./config/passport/passport.js');
pssprt(passport, models.users);// setup user

module.exports = app;
