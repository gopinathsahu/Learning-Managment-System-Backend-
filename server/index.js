require('dotenv').config();
const  app=require('./app.js');
const PORT=process.env.PORT|| 5555;

const ConnectedToDb=require('./Database/database.js');
const cloudinary=require('cloudinary');
const Razorpay=require('razorpay');



cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})
  const razorpay=new Razorpay({
    key_id:process.env.RAZORRPAY_KEY_ID,
    key_secret:process.env.RAZORRPAY_SECRET
})
app.listen(PORT,()=>{
    console.log(`the server connected at the port ${PORT}`);
});
module.exports=razorpay;