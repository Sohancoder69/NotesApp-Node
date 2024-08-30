require('dotenv').config();

const express = require('express');
const expressEjsLayouts = require('express-ejs-layouts');
const connectDB = require('./server/config/db');
const session = require('express-session');
const methodOverride = require('method-override');

const passport = require('passport');
const MongoStore = require('connect-mongo');

const app = express();
const port = 5000 || process.env.PORT;

app.use(session({
  secret: 'MongoDb Id',
  resave : false,
  saveUninitialized : true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  }),
  cookie: {maxAge: new Date ( Date.now() + (3600000))}
}))

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"))

app.use(express.urlencoded({ extended: true }))
app.use(express.json());

// Connect To Database
connectDB()

app.use(express.static('public'));

// Templating Engine
app.use(expressEjsLayouts);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

// Routes
app.use('/', require('./server/routes/auth'));
app.use('/', require('./server/routes/index'));
app.use('/', require('./server/routes/dashboard'));


app.get('*', function (req, res) {
  res.status(404).render('404');
});


app.listen(port, () => {
  console.log(`App Listening On Port ${port}`);
});
