const Course = require('../Model/course.js');
const fs = require('fs/promises');
const cloudinary = require('cloudinary');
const path = require('path');
const { json } = require('express');
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({}).select('-lectures');
        res.status(200).json({
            success: true,
            message: 'All courses...!',
            courses
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,

        })
    }
}

exports.getLecturesByCourseId = async (req, res) => {

    try {
        const { id } = req.params;
        const course = await Course.findById(id);


        if (!course) {
            res.status(400).json({
                success: false,
                message: 'Course is not found'

            })
        }
        res.status(200).json({
            success: true,
            message: 'Course lectures fetched successfully...!',
            lectures: course.lectures
        })
    } catch (error) {

    }
}

exports.cretaeCourse = async (req, res, next) => {
    const { title, description, category, createdBy } = req.body;

    if (!title || !description || !category || !createdBy) {
        return res.status(400).json({
            success: false,
            message: 'Every field is must required'
        });

    }
    const course = await Course.create({
        title,
        description,
        category,
        createdBy,
        thumbnail: {
            public_id: 'dummy',
            secure_url: 'dummy'
        }
    });
    if (!course) {
        return res.status(400).json({
            success: false,
            message: 'Course could not be created,please try again..'
        });
    }
    if (req.file) {
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms', // Save files in a folder named lms
            });
            if (result) {
                course.thumbnail.public_id = result.public_id;
                course.thumbnail.secure_url = result.secure_url;

            }
            fs.rm(`uploads/${req.file.filename}`)
        }
        catch (error) {

            for (const file of await fs.readdir('uploads/')) {
                await fs.unlink(path.join('uploads/', file));
            }

            return res.status(400).json({
                success: false,
                message: error || 'File not uploaded, please try again'
            });
        }
    }
    await course.save();
    res.status(200).json({
        success: true,
        message: 'Course created successfully.. !',
        course,
    });
}



exports.updateCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await Course.findByIdAndUpdate(
            id,
            {
                $set: req.body
            }, {
            runValidators: true
        }
        )
        if (!course) {
            return res.status(400).json({
                success: false,
                message: 'Course with given id doesnot exist'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Course updated successfully'
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}
exports.removeCourse = async (req, res) => {
    const { id,lectureid } = req.params;

    // Finding the course via the course ID
    const course = await Course.findById(id);

    // If course not find send the message as stated below
    if (!course) {
        return next(
            res.status(200).json({
                success: true,
                message: 'Course with given id does not exist.',
                course,
            })
        )

    }

    // Remove course
    await Course.findByIdAndDelete(course);

    // Send the message as response
    res.status(200).json({
        success: true,
        message: 'Course deleted successfully',
    });

}

exports.AddLectureToCourseById = async (req, res) => {
    const { title, description } = req.body;
    const { id } = req.params;
    if (!title || description) {
        res.status(400).json({
            success: false,
            message: 'Every field is must required'

        })
    }
    const course = await Course.findById(id);
    if (!course) {
        res.status(400).json({
            success: false,
            message: 'Course is not found'

        })
    }
    const lecturesData = {
        title, description,lecture:{},
    }
    if (req.file) {
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
                chunk_size:5000000000,
                resource_type:'video' // Save files in a folder named lms
            });
            if (result) {
                lecturesData.lecture.public_id = result.public_id;
                lecturesData.lecture.secure_url = result.secure_url;

            }
            fs.rm(`uploads/${req.file.filename}`)
        }
        catch (error) {

           

            return res.status(400).json({
                success: false,
                message: error || 'File not uploaded, please try again'
            });
        }
    }
    course.lectures.push(lecturesData);
    course.numberOfzLectures=course.lectures.length;

    await course.save();
    res.status(200).json({
        success:true,
        message:'Lecture successfully added to the courses..!',
        course,
    })
}
exports.removeLecture=async(req,res)=>{
  const{id,lectureid}=req.params;
  const course= await Course.findById(id);
  if(!course){
    return res.status(400).json({
        success: false,
        message: error || 'File not uploaded, please try again'
    });
  }
  const lectureIndex=course.lectures.findIndex(
    (lecture)=>lecture._id.toString()===lectureid.toString()
  )
  if (lectureIndex === -1) {
    return next(new AppError('Lecture does not exist.', 404));
  }

  // Delete the lecture from cloudinary
  await cloudinary.v2.uploader.destroy(
    course.lectures[lectureIndex].lecture.public_id,
    {
      resource_type: 'video',
    }
  );

  // Remove the lecture from the array
  course.lectures.splice(lectureIndex, 1);

  // update the number of lectures based on lectres array length
  course.numberOfLectures = course.lectures.length;

  // Save the course object
  await course.save();

  // Return response
  res.status(200).json({
    success: true,
    message: 'Course lecture removed successfully',
  });
}
