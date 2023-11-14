const User = require('../Model/userSchema.js');
const emailvalidator = require('email-validator');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary');
const fs = require('fs/promises');
const sendEmail=require('../utils/sendEmail.js');
const asyncHandler=require('../Middleware/asyncHandler.js');
const crypto=require('crypto');
exports.home = (req, res) => {
    return res.status(200).send('WELCOMe to ## WELCOME  MANAGMENT SYSTEM ##');
}
exports.register = async (req, res) => {
  
    const { name, email, password, confirmpassword } = req.body;
    if (!name || !email || !password || !confirmpassword) {
        res.status(400).json({
            success: false,
            message: 'Every Field Is Must Required'
        })
    }
    if (password !== confirmpassword) {
        res.status(400).json({
            success: false,
            message: "password don't match "
        })
    }
    const emailvalid = emailvalidator.validate(email);
    if (!emailvalid) {
        res.status(400).json({
            success: false,
            message: 'Please Provode Valid Email ID'
        })
    }

    

        const user = User.create({
            name,
            email,
            password,
            confirmpassword, 
            avatar: {
                public_id: email,
                secure_url:
                    'https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg',
            },
        });
        user.password = undefined;
        res.status(200).json({
            success: true,
            message: 'You are Successfully registered......!',
            data: user
        })
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Registartion failed...Please try again'
            })
        
        if (req.file) {
            console.log(req.file);
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'lms',
                    width: 250,
                    height: 250,
                    gravity: 'faces',
                    crop: 'fill'
                });
                if (result) {
                    user.avatar.public_id = result.public_id;
                    user.avatar.secure_url = result.secure_url;
                    // remove from the sderver
                    fs.rm(`uploads/${req.file.filenmae}`)
                }
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message
                })
            }


        }

    } 

        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: 'Emai  ID already registered...!'
            })
        }
        res.status(400).json({
            success: false,
            message: error.message
        })
    

    // todo :file yupload


}
exports.login=async (req,res)=>{
    const{email,password}=req.body;
    if(!email || !password ){
        return res.status(400).json({
            success:false,
            message:'EVery Field IS Must Required'
        })
       
    }
   try {
    const user = await User
    .findOne({
      email
    })
    .select("+password"); 
  if (!user|| !(await bcrypt.compare(password,user.password))) {
    return res.status(400).json({
        success: true,
        message: "invalid credentials"
      });
  }
  const token= user.jwtToken()
  user.password=undefined;
  const cookieOption={
    maxAge:24*60*60*1000,
    httpOnly:true
  }
  res.cookie('token',token,cookieOption);
  res.status(200).json({
    success:true,
    data:user
  })
   } catch (error) {
    return res.status(400).json({
        success:false,
        message:error.message
    })
   }
}

exports.getProfile=async(req,res)=>{

 const userId=req.user.id;
 try {
    const user = await User.findById(userId);
    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

}
exports.logout = (req, res) => {
    try {
        const cookieOption = {
            expires: new Date(),
            httpOnly: true
        }

        // return response with cookie without token
        res.cookie("token", null, cookieOption);
        res.status(200).json({
            success: true,
            message: "Logged Out"
        });
    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        })
    }

}

exports.forgotpassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        res.send(` please provide an Email..!`)
    }
    const user = await User.findOne({ email });
    if (!user) {
        res.status(400).json({
            success: false,
            message: 'Email is not registered',
            user
        })
    }

    const resetToken = await user.generatePasswordResetToken();

    // Saving the forgotPassword* to DB
    await user.save();
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
 console.log(resetPasswordUrl);
    // We here need to send an email to the user with the token
    const subject = 'Reset Password';
    const message = `You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested this, kindly ignore.`;
  
    try {
      await sendEmail(email, subject, message);
  
      // If email sent successfully send the success response
      res.status(200).json({
        success: true,
        message: `Reset password token has been sent to ${email} successfully`,
      });
    } catch (error) {
      // If some error happened we need to clear the forgotPassword* fields in our DB
      user.forgotPasswordToken = undefined;
      user.forgotPasswordExpiry = undefined;
  
      await user.save();
  
      return next(
        res.status(400).json({
            success: false,
            message: error.message,
          })
      );
    }



    });



exports.resetpassword = asyncHandler(async(req, res, next) => {
    const { resetToken } = req.params;

    // Extracting password from req.body object
    const { password } = req.body;
  
    // We are again hashing the resetToken using sha256 since we have stored our resetToken in DB using the same algorithm
    const forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
    // Check if password is not there then send response saying password is required
    if (!password) {
      return next(new AppError('Password is required', 400));
    }
  
    console.log(forgotPasswordToken);
  
    // Checking if token matches in DB and if it is still valid(Not expired)
    const user = await User.findOne({
      forgotPasswordToken, 
      forgotpasswordExpiry: { $gt: Date.now() }, // $gt will help us check for greater than value, with this we can check if token is valid or expired
    });
  
    // If not found or expired send the response
   
  if (!user) {
     return next(
        res.status(400).json({
            success: false,
            message: 'Token is expired or invalid ,plz try again...!'
        })
     )
  }
  
  user.password=password;
  user.forgotPasswordExpiry=undefined;
  user.forgotPasswordToken=undefined;
  res.status(200).json({
    success: true,
    message: 'Password changed  successfully!'
})
});



exports. changePassword = asyncHandler(async (req, res, next) => {
    // Destructuring the necessary data from the req object
    const { oldPassword, newPassword } = req.body;
    const { id } = req.user; // because of the middleware isLoggedIn
  
    // Check if the values are there or not
    if (!oldPassword || !newPassword) {
      return next(
        res.status(400).json({
            success: true,
            message: 'Old password and new password are required'
        })
       
      );
    }
  
    // Finding the user by ID and selecting the password
    const user = await User.findById(id).select('+password');
  
    // If no user then throw an error message
    if (!user) {
      return next( res.status(400).json({
        success: true,
        message: 'Invalid user id or user does not exist'
    })
      )
    }
  
    // Check if the old password is correct
    const isPasswordValid = await user.comparePassword(oldPassword);
  
    // If the old password is not valid then throw an error message
    if (!isPasswordValid) {
      return next(
        res.status(400).json({
            success: true,
            message: 'Invalid old password'
        })
      )
    }
    
  
    // Setting the new password
    user.password = newPassword;
  
    // Save the data in DB
    await user.save();
  
    // Setting the password undefined so that it won't get sent in the response
    user.password = undefined;
  
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  });



  exports. updateUser = asyncHandler(async (req, res, next) => {
    // Destructuring the necessary data from the req object
    const { name } = req.body;
    const { id } = req.params;
  
    const user = await User.findById(id);
  
    if (!user) {
      return next(new AppError('Invalid user id or user does not exist'));
    }
  
    if (name) {
      user.name = name;
    }
  
    // Run only if user sends a file
    if (req.file) {
      // Deletes the old image uploaded by the user
      await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: 'lms', // Save files in a folder named lms
          width: 250,
          height: 250,
          gravity: 'faces', // This option tells cloudinary to center the image around detected faces (if any) after cropping or resizing the original image
          crop: 'fill',
        });
  
        // If success
        if (result) {
          // Set the public_id and secure_url in DB
          user.avatar.public_id = result.public_id;
          user.avatar.secure_url = result.secure_url;
  
          // After successful upload remove the file from local storage
          fs.rm(`uploads/${req.file.filename}`);
        }
      } catch (error) {
        return next(
            res.status(400).json({
                success: true,
                message: error.message,
              })
          
        );
      }
    }
  
    // Save the user object
    await user.save();
  
    res.status(200).json({
      success: true,
      message: 'User details updated successfully',
    });
  });

  