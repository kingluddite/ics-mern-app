// populate and depopulate Database
// This is a "self-contained app for dealing with our Database"
const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({path: './config/config.env'});

// Load models
const Bootcamp = require('./models/Bootcamp');

// Connect to Database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

// Read JSON files
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));

// Import into Database
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);

    // Let developer know all is good
    console.log('Data Imported...'.green.inverse);
    // We are finished
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Delete all data
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();

    // Let developer know we deleted all the data
    console.log('Data destroyed...'.red.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
}

// Let's use argv to determine if we are IMPORTING or DELETING data
if (process.argv[2] === '-i') {
  importData();
} else {
  deleteData();
}
