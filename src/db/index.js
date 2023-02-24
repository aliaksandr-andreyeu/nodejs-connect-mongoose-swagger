import mongoose from 'mongoose';

const db = {
  connect: async (url, cb) => {
    mongoose.set('debug', process.env.NODE_ENV === 'development');

    const mOption = {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      bufferCommands: false
    };

    const mConnect = mongoose.connection;

    mConnect
      .on('connecting', () => {
        console.log('MongoDB Connecting...');
      })
      .on('connected', () => {
        console.log('MongoDB Connection Established');
      })
      .on('reconnected', () => {
        console.log('MongoDB Connection Reestablished');
      })
      .on('disconnected', () => {
        console.log('MongoDB Connection Disconnected');
      })
      .on('disconnect', () => {
        console.log('MongoDB Connection Error Disconnect');
      })
      .once('open', () => {
        console.log('MongoDB Connection Opened');
        Boolean(cb) && cb();
      })
      .on('close', () => {
        console.log('MongoDB Connection Closed');
      })
      .on('error', (err) => {
        console.log('MongoDB Connection error name: ', err.name);
        console.log('MongoDB Connection error message: ', err.message);
      });

    process.on('SIGINT', () => {
      mConnect.close(() => {
        console.log('MongoDB default connection is closed due to application termination');
        process.exit(0);
      });
    });

    try {
      await mongoose.connect(url, mOption);
    } catch (error) {
      console.log('*******************************');
      console.log('error.name: ', error.name);
      console.log('error.message: ', error.message);
      console.log('*******************************');

      process.exit(1);
    }
  }
};

export default db;
