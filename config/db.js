const mongoose = require('mongoose');

const connectDb = async () => {
  try {
    // We get rid of all Mongoose warnings with the object we pass as a second argument
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });

    // show developer we are connected to DB
    console.log(`DB Connected: ${conn.connection.host}`.cyan.underline.bold);
  } catch (err) {
    console.log(err.message);
    // We want to exit from the process with failure
    process.exit(1);
  }
};

module.exports = connectDb;
