const mongoose = require('mongoose');
const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required..'],
        maxLength: [60, 'Title length should be less then  60 character'],
        minLength: [3, 'Title length must  be greater  then  3 character']
    },
    description: {
        type: String,
        required: [true, 'Description is required..'],
        maxLength: [120, 'Description  length should be less then  120 character'],
        minLength: [10, 'Description length must  be greater  then  10 character']

    },
    category: {
        type: String,

        required: [true, 'Category is required..'],
    },
    thumbnail: {
        public_id: {
            type: String
        }, secure_url: {
            type: String
        }
        
    },
    lectures: [
        {
            title: String,
            description: String,
            lecture: {
                public_id: {
                    type: String
                }, secure_url: {
                    type: String
                }
            }
        }
    ],
    numberOfzLectures: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: String,

        required: true,
    }
},
    {
        timestamps: true
    }
)
module.exports = mongoose.model('course', courseSchema);