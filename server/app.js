'use strict'
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const MongoDBStore = require('connect-mongodb-session')(session);
const appConfig = require('./appConfig');   
const basePath = '/graduate';

// Load environment variables
require('dotenv').config();   

const homeRouter = require('./routes/homeRouter')
const accountRouter = require('./routes/accountRouter')
const searchFormsRouter = require('./routes/searchFormsRouter')
const adminRouter = require('./routes/adminRouter')
const partnerRouter = require('./routes/partnerRouter')
const galleryRouter = require('./routes/galleryRouter')
const newsRouter = require('./routes/newsRouter')
const editMainPageRouter = require('./routes/editMainPageRouter')

const startTimerNotify = require('./other/notify')();

const app = express();
    
app.locals.base_path = basePath;

app.use(morgan('common', {
    stream: fs.createWriteStream(path.join(__dirname, '../access.log'), { flags: 'a' })
}));

app.use(morgan('common', {
    skip: (req, res) => { return res.statusCode < 400 },
    stream: fs.createWriteStream(path.join(__dirname, '../error.log'), { flags: 'a' })
}));

app.use(express.json({ extended: false, limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false, limit: '5mb' }));

// Serve static files
app.use(`${basePath}/images`, express.static(path.join(__dirname, '../public/images')));
app.use(`${basePath}/images/avatars`, express.static(path.join(__dirname, '../server/other/avatars')));


// Serve Vue.js built assets
app.use(`${basePath}/assets`, express.static(path.join(__dirname, '../dist/assets')));

//auth
const store = new MongoDBStore({
    uri: appConfig.db_url,
    collection: 'sessions'
});

app.use(cookieParser());
app.use(session({
    store: store,
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET || appConfig.salt,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict'
    },
}));

// API routes
app.use(basePath + '/api', homeRouter)
app.use(basePath + '/api/account', accountRouter)
app.use(basePath + '/api/forms', searchFormsRouter)
app.use(basePath + '/api/admin', adminRouter)
app.use(basePath + '/api/partners', partnerRouter)
app.use(basePath + '/api/gallery', galleryRouter)
app.use(basePath + '/api/news', newsRouter)
app.use(basePath + '/api/edit_main_page', editMainPageRouter)

// Serve Vue.js app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
}); 

// catch 404 and forward to error handler
app.use(function (req, res, next) {
     var err = new Error('Not Found');
     err.status = 404;
     next(err);
});

// error handlers
app.use(function (err, req, res, next) {
    if (err.name == 'UserError' && err.type_response == 'json') {
        res.status(200);
        res.json({ success: false, msg: err.message })
    }
    else {
        console.error(err.message)
        console.error(err.stack || '')
        res.status(err.status || 500)
        res.json({
            message: err.message,
            status: err.status || 500,
            stack: process.env.NODE_ENV === 'development' ? err.stack : ''
        });
    }
});

app.set('port', process.env.PORT || 1337);

async function startServer() {
    try {
        await mongoose.connect(appConfig.db_url);
        console.log('MongoDB подключён');

        app.listen(app.get('port'), '0.0.0.0', () => {
            console.log(`Сервер запущен на порту ${app.get('port')}`);
        });

    } catch (err) {
        console.error('Ошибка подключения к MongoDB:', err);
        process.exit(1);
    }
}

startServer(); 