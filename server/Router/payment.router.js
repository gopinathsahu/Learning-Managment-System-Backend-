const express= require('express');
const router=  express.Router();
const {getRazorpayApiKey,subscription,verifysubscription,cancelsubscription,allpayments}=require('../Controller/payment.controller.js');
const middleware = require('../Middleware/middleware.js');

router.route('/getRazorpayApiKey').get(middleware,getRazorpayApiKey);
router.route('/verify').post(middleware,verifysubscription)
router.route('/subscribe').post(middleware,subscription);
router.route('/unsubscribe').post(middleware,cancelsubscription);

router.route('/').get(middleware,allpayments);

module.exports=router;