const path = require('path');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

//for the verification of the token
const {v4: uuidv4} = require('uuid');

//importing the .env file
require('dotenv').config();

const pug = require('pug');


exports.showLandingPage = (req, res, next)=>{
    res.status(200).sendFile(path.join(__dirname, '../', 'views', 'index.html'));
}

exports.showLoginPage = (req, res, next)=>{
    //res.status(200).sendFile(path.join(__dirname, '../', 'views', 'login.html'));
    res.status(200).render('login.pug');
}

exports.showStationOwnerForm = (req, res, next)=>{
    //res.status(200).sendFile(path.join(__dirname, '../', 'views', 'evstation.html'));
    res.status(200).render('evstation.pug');
}

exports.showEVOwnerForm = (req, res, next)=>{
    //res.status(200).sendFile(path.join(__dirname, '../', 'views', 'evowner.html'));
    res.status(200).render('evowner.pug');
}


exports.showSlotBookingPage = (req, res, next)=>{
    // res.status(200).sendFile(path.join(__dirname, '../', 'views', 'bookslot.html'));
    res.render('bookslot.pug');
}




//--------------------------------------------------------------------------------------------------------
//creating transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false, //true for port 465 else false for other ports
    auth: {
        user: process.env.SENDER_EMAIL_ID,
        pass: process.env.SENDER_EMAIL_APP_PASS
    }
});
//---------------------------------------------------------------------------------------------------------




//---------------------------------------------------------------------------------------------------------
//importing the model for the ev owber sign up details
const EVOwnerSignUpDetails = require('../model/evOwnerSignUpDetails.js');

//signing up to the database (for EV Owner)
exports.signUpEVOwner = (req, res, next)=>{
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.emailID;
    const phone = req.body.phone;
    const password = req.body.pass;

    //generate a unique verification token
    const verificationToken = uuidv4();

    //set token expiration time (e.g. 1 hour)
    const tokenExpiration = Date.now() + 3600000;

    const evOSD = new EVOwnerSignUpDetails({
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        password: password,
        verificationToken: verificationToken,
        tokenExpiration: tokenExpiration
    });

    evOSD
    .save()
    .then(result=>{
        const verificationLink = `http://localhost:${process.env.PORT}/verify-email?token=${verificationToken}`;

        const mailOptions = {
            from: {
                name: "BookSlot & Charge EV",
                address: process.env.SENDER_EMAIL_ID
            },
            to: email,
            subject: "Email Verification",
            html: `<p>Please Verify you email by clicking the link : <a href="${verificationLink}">Click To Verify</a></p>`
        }

        transporter.sendMail(mailOptions, (error, info)=>{
            if(error){
                console.log(err);
                res.status(404).render('evowner.pug', {message: "Error Sending Verification Link"});
            }else{
                res.redirect('/landingPage');
                //res.render('evowner.pug', {message: "Verification Email Sent ! Please check you inbox."});
            }
        });
    })
    .catch(err=>{
        res.render('evowner.pug', {message: "Oops ! Email Alredy Exists"});
        console.log("SignUp Error Occurred !");
    })
}


//verfiying the email for signing up ev owner
exports.verifyEmailRoute = (req, res, next)=>{
    const token = req.query.token;

    EVOwnerSignUpDetails.findOne({verificationToken: token, tokenExpiration: {$gt: Date.now()}})
        .then(user=>{
            if(!user){
                console.log("Verification link invalid or expired");
                return res.status(404).send('Verification link is invalid or has expired');
            }

            //verify the user and remove the verification token
            user.isVerified = true;
            user.verificationToken = undefined;
            user.tokenExpiration = undefined;

            return user.save();
        })
        .then(()=>{
            console.log("Verification Successful");
            res.status(200).send('Email Verified Successfully! You can now log in to the system');
        })
        .catch(err=>{
            console.error(err);
            res.status(500).send('Internal Server Error');
        })
}
//---------------------------------------------------------------------------------------------------------





//---------------------------------------------------------------------------------------------------------
//importing the model for the station owner sign up details
const StationOwnerSignUpDetails = require('../model/stationOwnerSignUpDetails.js');


//signing up to the database (for Station Owner)
exports.signUpStationOwner = (req, res, next)=>{
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.emailID;
    const phone = req.body.phone;
    const stationName = req.body.stationName;
    const longitude = req.body.longitude;
    const latitude = req.body.latitude;
    const location = req.body.location;
    const password = req.body.pass;

    //generate a unique verification token
    const verificationToken = uuidv4();

    //set token expiration time (e.g. 1 hour)
    const tokenExpiration = Date.now() + 3600000;

    const stationOSD = new StationOwnerSignUpDetails({
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        stationName: stationName,
        longitude: longitude,
        latitude: latitude,
        location:location,
        password: password,
        verificationToken: verificationToken,
        tokenExpiration: tokenExpiration
    });

    stationOSD
    .save()
    .then(result=>{
        const verificationLink = `http://localhost:${process.env.PORT}/verify-email2?token=${verificationToken}`;

        const mailOptions = {
            from: {
                name: "BookSlot & Charge EV",
                address: process.env.SENDER_EMAIL_ID
            },
            to: email,
            subject: "Email Verification",
            html: `<p>Please Verify you email by clicking the link : <a href="${verificationLink}">Click To Verify</a></p>`
        }

        transporter.sendMail(mailOptions, (error, info)=>{
            if(error){
                console.log(err);
                res.status(404).render('evstation.pug', {message: "Error Sending Verification Link"});
            }else{
                res.redirect('/landingPage');
                //res.render('evstation.pug', {message: "Verification Email Sent ! Please check you inbox."});
            }
        });
    })
    .catch(err=>{
        res.render('evstation.pug', {message: "Oops ! Email Alredy Exists"});
        console.log("SignUp Error Occurred !");
    })
}


//verfiying the email for signing up station owner
exports.verifyEmailRoute2 = (req, res, next)=>{
    const token = req.query.token;

    StationOwnerSignUpDetails.findOne({verificationToken: token, tokenExpiration: {$gt: Date.now()}})
        .then(user=>{
            if(!user){
                console.log("Verification link invalid or expired");
                return res.status(404).send('Verification link is invalid or has expired');
            }

            //verify the user and remove the verification token
            user.isVerified = true;
            user.verificationToken = undefined;
            user.tokenExpiration = undefined;

            return user.save();
        })
        .then(()=>{
            console.log("Verification Successful");
            res.status(200).send('Email Verified Successfully! You can now log in to the system');
        })
        .catch(err=>{
            console.error(err);
            res.status(500).send('Internal Server Error');
        })
}
//--------------------------------------------------------------------------------------------------------



//Authentication (i.e., Validating Login Credentials)
exports.validateLogIn = async (req, res, next)=>{
    const enteredEmail = req.body.emailValue;
    const enteredPassword = req.body.passwordValue;

    try{

        //fetch user data from the EVOwnerSignUpDetails collection using email
        let user = await EVOwnerSignUpDetails.findOne({email: enteredEmail});

        //if user is not found in EVOwnerSignUpDetails collection, try StationOwnerSignUpDetails collection
        if(!user){
            user = await StationOwnerSignUpDetails.findOne({email: enteredEmail});
        }

        if(!user){
            return res.status(404).render('login.pug', {message: "Invalid Email Address"});
        }

        if(!user.isVerified){
            return res.status(404).render('login.pug', {message: "Unverified Email Address" });
        }

        //validate the entered password against the hashed password stored in the database
        const isPasswordValid = await bcrypt.compare(enteredPassword, user.password);

        if(!isPasswordValid){
            return res.status(404).render('login.pug', {message: "Invalid Password"});
        }

        //if credentials are valid redirect to the respective dashboard
        return res.status(200).send('<h2>Congratulations you are logged in to your Dashboard</h2>');

    }catch(err){
        console.error(err);
        return res.status(500).send('<h2>Internal Server Error</h2>');
    }
};
//-----------------------------------------------------------------------------------------------------------

//handling the contact us page
const ContactUs = require('../model/contactUsDetails.js');

exports.sendContactUsDetails = (req, res, next)=>{
    const name = req.body.nameValue;
    const email = req.body.emailValue;
    const subject = req.body.subjectValue;
    const content = req.body.textAreaValue;

    const sendContact = new ContactUs({
        name: name,
        email: email, 
        subject: subject, 
        content: content
    });

    sendContact
    .save()
    .then(result=>{
        res.redirect('/landingPage');
    })
}

//----------------------------------------------------------------------------------------------------------

//-------Starting Slot Booking Task---------------------

exports.handleSlotBooking = (req, res, next)=>{
    
}