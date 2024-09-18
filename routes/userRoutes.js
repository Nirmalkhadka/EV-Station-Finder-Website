const express = require('express');
const router = express.Router();

const userController = require('../controller/userController.js');

router.get('/landingPage', userController.showLandingPage);

router.post('/displayLogin', userController.showLoginPage);

router.post('/showStationForm', userController.showStationOwnerForm);

router.post('/showEVOwnerForm', userController.showEVOwnerForm);

router.post('/gobackToLogin', userController.showLoginPage);

router.post('/backFromStationOwner', userController.showLoginPage);

router.post('/backFromEVOwner', userController.showLoginPage);

router.post('/goToSlotBooking', userController.showSlotBookingPage);

//the below two routes are used to handle the sign up request and email verifaction process for ev owner
router.post('/signUpEVOwnerToDB', userController.signUpEVOwner);

router.get('/verify-email', userController.verifyEmailRoute);
//------------------------------------------------------------------------------------------------------

//the below two routes are used to handle the sing up request and email verification process for station owner
router.post('/signUpStationOwnerToDB', userController.signUpStationOwner);

router.get('/verify-email2', userController.verifyEmailRoute2);
//------------------------------------------------------------------------------------------------------


//route to handle the authentication
router.post('/makeLogIn', userController.validateLogIn);

//route to handle contactUs Page details
router.post('/sendContactUsDetails', userController.sendContactUsDetails);


module.exports = router;