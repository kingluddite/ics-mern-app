const mongoose = require('mongoose');
const User = '../models/User';

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title for the word review'],
    trim: true,
    maxlength: [100, 'Name can not be more than 200 characters'],
  },
  text: {
    type: String,
    required: [true, 'Please add some content'],
    maxlength: [500, 'Description can not be more than 500 characters'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add a rating between 1 and 10']
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
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
      // And point to field we want to average `$rating`
      $group: {
        _id: '$bootcamp',
        averageRating: {$avg: '$rating'}
      }
    }
  ])

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageRating: arrayWithSingleObject[0].averageRating
    })
  } catch (err) {
    console.error(err);
  }
}

// Call getAverageRating after (so we use "post") save
ReviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.bootcamp);
})

// Call getAverageRating after (so we use "post") save
ReviewSchema.post('remove', function () {
  this.constructor.getAverageRating(this.bootcamp);
})

// Prevent user from submitting more than one review per bootcamp
ReviewSchema.index({bootcamp: 1, user: 1}, {unique: true});

module.exports = mongoose.model('Review', ReviewSchema);
