const mongoose = require('mongoose');
const Bootcamp = '../models/Bootcamp';

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add course title'],
        unique: true,
        trim: true,
        maxlength: [200, 'Name can not be more than 200 characters'],
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description can not be more than 500 characters'],
    },
    weeks: {
        type: String,
        required: [true, 'Please add number of weeks']
    },
    tuition: {
        type: Number,
        required: [true, 'Please add a tuition cost for this course']
    },
    minimumSkill: {
        type: String,
        required: [true, 'Please add a minimum skill'],
        enum: ['beginner', 'intermediate', 'advanced']
    },
    scholarshipAvailable: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true
    }
});

// Static method to get avg of course tuitions
CourseSchema.statics.getAverageCost = async function (bootcampId) {
    // console.log('Calculating avg cost...'.blue);

    const arrayWithSingleObject = await this.aggregate([
        {
            $match: {bootcamp: bootcampId}
        },
        {
            // the object that we want to create
            // the calculated object
            // We need to use `_id: $bootcamp`
            // We createdOur field and say we want to average `$avg`
            // And point to field we want to average `$tuition`
            $group: {
                _id: '$bootcamp',
                averageCost: {$avg: '$tuition'}
            }
        }
    ])

    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageCost: Math.ceil(arrayWithSingleObject[0].averageCost / 10) * 10
        })
    } catch (err) {
        console.error(err);
    }
}

// Call getAverageCost after (so we use "post") save
CourseSchema.post('save', function () {
    this.constructor.getAverageCost(this.bootcamp);
})

// Call getAverageCost after (so we use "post") save
CourseSchema.pre('remove', function () {
    this.constructor.getAverageCost(this.bootcamp);
})

module.exports = mongoose.model('Course', CourseSchema);
