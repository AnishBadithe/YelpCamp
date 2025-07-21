if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express');
const app = express();

app.set('query parser', 'extended');

const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const helmet = require('helmet');

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const users = require('./routes/users');

const User = require('./models/user');

const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const mongoSanitize = require('./utils/mongoSanitize');

const dbURL = process.env.DB_URL

const MongoStore = require('connect-mongo');


//connecting to database
mongoose.connect(dbURL);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//below line is used to parse json data from req.body
app.use(express.urlencoded( {extended: true}));

//below line is used to rewrite post request to other requests like put, patch, delete
app.use(methodOverride('_method'));

//below line is to use public folder for scripts and additional styles
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({ replaceWith: '_' }));

const store = MongoStore.create({
    mongoUrl : 'mongodb://127.0.0.1:27017/yelp-camp',
    touchAfter: 24 * 3600,
    crypto: {
        secret: 'thisshouldbeabettersecret'
    }
});

store.on("error", function(e) {
    console.log("Session Store Error", e);
});

//setting up session and cookie
const sessionConfig = {
    store,
    name: 'session',
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: (1000 * 60 * 60 * 24 * 7)
    }
};

app.use(session(sessionConfig));

//setting up flash messages
app.use(flash());

//helmet method is used to mitigate a few headers that come with a request
app.use(helmet({contentSecurityPolicy: false}));

//initializing passport for authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); //to add user to a session using passport
passport.deserializeUser(User.deserializeUser()); //to remove user from a session using passport

//setting a middleware that runs wherever called for success, error and to store current user
app.use((req, res, next) => {
    
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

//using the campgrounds router
app.use('/campgrounds', campgrounds);

//using the reviews router
app.use('/campgrounds/:id/reviews', reviews);

//using the users router
app.use('/', users);

app.get('/', (req, res) => {
    res.render('home');
});

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((error, req, res, next) => {

    const { status = 500 } = error;
    if(!error.message) error.message = 'Something Went Wrong!';
    res.status(status).render('error', { error });
});

//listening on port 3000
app.listen(3000, () => {
    console.log('Listening on PORT: 3000');
});