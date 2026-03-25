if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const csrf = require('csurf');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const connectDB = require('./utils/db');
const seedDatabase = require('./utils/seedData');
const User = require('./models/user');
const Spot = require('./models/spot');
const { SPOT_CATEGORIES } = require('./utils/constants');
const userRoutes = require('./routes/users');
const spotRoutes = require('./routes/spots');
const reviewRoutes = require('./routes/reviews');
const collectionRoutes = require('./routes/collections');

const app = express();
const csrfProtection = csrf();
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3000;

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(mongoSanitize());
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

const sessionConfig = {
    name: 'citydiaries.sid',
    secret: process.env.SESSION_SECRET || 'dev-session-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(csrfProtection);

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.csrfToken = req.csrfToken();
    res.locals.categories = SPOT_CATEGORIES;
    res.locals.dbInfo = app.locals.dbInfo;
    next();
});

app.get('/', catchAsync(async (req, res) => {
    const featuredSpots = await Spot.find({})
        .populate('author')
        .sort({ ratingAverage: -1, createdAt: -1 })
        .limit(3);

    res.render('home', { featuredSpots });
}));

app.use('/', userRoutes);
app.use('/spots', spotRoutes);
app.use('/spots/:id/reviews', reviewRoutes);
app.use('/collections', collectionRoutes);

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        req.flash('error', 'Your session expired. Please try the form again.');
        return res.redirect(req.get('Referrer') || '/');
    }

    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no, something went wrong.';
    res.status(statusCode).render('error', { err });
});

async function startServer() {
    try {
        const dbInfo = await connectDB();
        await seedDatabase();

        app.locals.dbInfo = dbInfo;

        app.listen(port, () => {
            const mode = dbInfo.isInMemory ? 'in-memory preview database' : dbInfo.mongoUrl;
            console.log(`Serving on port ${port}`);
            console.log(`Connected using ${mode}`);
        });
    } catch (error) {
        console.error('Failed to start CityDiaries');
        console.error(error);
        process.exit(1);
    }
}

startServer();
