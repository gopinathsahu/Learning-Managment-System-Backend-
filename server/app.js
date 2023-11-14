const express=require('express');
const app=express();

const ConnectedToDb=require('./Database/database.js');
ConnectedToDb();
const morgan=require('morgan');

const cors=require('cors');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

const cookieparser=require('cookie-parser');
app.use(cookieparser());

const UserRouter=require('./Router/router.js');
const CourseRouter=require('./Router/course.router.js');
const paymentRoutes=require('./Router/payment.router.js');

app.get('/',UserRouter);
app.use('/api/v1/user',UserRouter);
app.use('/api/v1/courses',CourseRouter);
app.use('/api/v1/payment',paymentRoutes);
module.exports=app;
