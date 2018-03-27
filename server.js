// loading dependencies
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path')
const sgMail = require('@sendgrid/mail');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');

sgMail.setApiKey('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');


const app = express();
const port = process.env.PORT || 8080;


// bring in bodyParser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// load static files
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// express validator middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));



// setting about/home route
app.get('/', (req, res) => {
    res.render('about', {
        title: 'About Me'
    })
});

// setting projects route
app.get('/projects', (req, res) => {
    res.render('projects', {
        title: 'Projects'
    })
});

// setting contact route
app.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Contact Me'


    });
});


app.post('/sent', (req, res) => {

    const email = req.body.email;
    const subject = req.body.subject;
    const body = req.body.body;

    req.checkBody('subject', 'Subject is required').notEmpty();
    req.checkBody('body', 'Body of email is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();

    let errors = req.validationErrors();

    if (errors) {
        res.render('contact', {
            errors: errors
        });
    } else {
        const msg = {
            to: 'dweick2323@gmail.com',
            from: req.body.email,
            subject: req.body.subject,
            html: '<p>' + req.body.body + '</p>',

        };
        sgMail.send(msg);
        console.log(msg);

        req.flash('success', 'Email Successfully sent');
        res.redirect('/contact');

    }
});


app.get('*', function(req, res, next) {
    res.locals.user = req.user || null;
    next();
});


app.listen(port, () => {
    console.log('Your app is listening on port', port);
});