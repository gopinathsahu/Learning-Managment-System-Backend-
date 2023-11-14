const express=require('express');

const {home,register,login,logout,getProfile,forgotpassword,resetpassword, changePassword}=require('../Controller/controller.js');

const middleware = require('../Middleware/middleware.js');
const {  upload } = require('../Middleware/multer.middleware.js');
const router=express.Router();
router.get('/',home);
router.post('/register',upload.single('avatar'),register);
router.post('/login',login);
router.get('/logout',logout);
router.route('/profile').get(middleware,getProfile);
router.post('/reset',forgotpassword); 
router.post('/reset/:resetToken',resetpassword);
router.post('/changepassword',changePassword);
module.exports=router;