const express = require('express');
const router = express.Router();
const { getLecturesByCourseId, getAllCourses, cretaeCourse, updateCourse ,removeCourse,AddLectureToCourseById,removeLecture} = require('../Controller/course.controller.js');
const middleware = require('../Middleware/middleware.js');
const { upload } = require('../Middleware/multer.middleware.js');

router.route('/').get(getAllCourses)
                  .post(middleware,upload.single('thumbnail'),
                    cretaeCourse)
                    
                    .delete(middleware,removeCourse)
                 
router.route('/:id').get(middleware, getLecturesByCourseId)
                    .post(middleware,upload.single('lecture'),AddLectureToCourseById)
                    .put(middleware,updateCourse)
                    .delete(middleware,removeLecture);
module.exports = router;