import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      select: true,
      default: ''
    },
    surname: {
      type: String,
      trim: true,
      required: true,
      select: true,
      default: ''
    },
    age: {
      type: Number,
      select: true,
      default: 0
    },
    job: {
      type: String,
      trim: true,
      select: true,
      default: ''
    }
  },
  {
    timestamps: true,
    autoIndex: false,
    toObject: {
      virtuals: true,
      getters: true
    },
    toJSON: {
      virtuals: true,
      getters: true
    }
  }
);

const userModel = model('users', userSchema);

export default userModel;
