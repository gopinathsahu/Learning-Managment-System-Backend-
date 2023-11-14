const jsontoken = require('jsonwebtoken');
// function for the middleware 
 const middleware = (req, res, next) => {
   // get cookie token(jwt token generated using json.sign()) form the request
    const token = (req.cookies && req.cookies.token) || null;
    if (!token) {
        return res.status(400).json(
            { success: false, 
                message: "NOT authorized"
             });
    }
  //   we write the try and catchb for verify the function 
    try {
        const payload = jsontoken.verify(token, process.env.JWT_KEY);
        req.user = { id: payload.id, email: payload.email };
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
    next();
}
//  const authorizedROles=(...roles)=>async(req,res,next)=>{
//  const currentUserRole=req.user.role;
//  if (!roles.includes(currentUserRole)) {
//      return res.status(400).json(
//          { success: false, 
//              message: "YOu do not have permission to  access this route "
//           });
//  }
//  }
 module.exports = middleware;
 //module.exports=authorizedROles;