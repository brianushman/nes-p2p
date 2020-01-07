var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var hbs = require('nodemailer-express-handlebars');
var Recaptcha = require('express-recaptcha');

var browserPreviewTransport = require("nodemailer-browserpreview-transport");

var recaptcha = new Recaptcha('6Le8q0QUAAAAAFwMl2owXx_0_27w1xjLrV7QGU9A', '6Le8q0QUAAAAAKzAl5TOUZ0BYZf4tDKo6PYhgRUD');

router.post('/', /*recaptcha.middleware.verify,*/ function (req, res, next) {
    /*if (req.recaptcha.error){
        console.log("captcha error");
        return;
    }
    console.log('successful captcha');*/

    var email = req.body.email;
    var message = req.body.message;
    var name = req.body.name;
    
    var options = {
        service:'Zoho',
        host: 'smtp.zoho.com',
        secureConnection: false,
        port: 587,
        ignoreTLS:true,
        requireTLS:false,
        auth: {
            user: 'invite@nesp2p.com',
            pass: 'Gx5RhXvx&6yyr&&FPLq4f2hW#'
        }
    };

    var transporter = nodemailer.createTransport(options);
    /*var options = {
        dir: './preview'
    };
    var transporter = nodemailer.createTransport(browserPreviewTransport(options));*/

    transporter.use('compile', hbs({
        viewPath: 'views',
        extName: '.hbs'
    }));

    var mailOptions = {
        from: 'invite@nesp2p.com',
        to: email,
        subject: "You've been invited to play NES Online.",
        template: 'mail.invitation',
        context: {
            name: name,
            message: message
        }
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    res.status(200).json({status:"ok"});
});

module.exports = router;
