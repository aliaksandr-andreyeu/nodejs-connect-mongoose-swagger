import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      select: true,
      default: ''
    },
    password: {
      type: String,
      trim: true,
      // required: true,
      select: true,
      default: ''
    },
    name: {
      type: String,
      trim: true,
      // required: true,
      select: true,
      default: ''
    },
    surname: {
      type: String,
      trim: true,
      // required: true,
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
    },
    token: {
      type: String,
      trim: true,
      // required: true,
      select: true,
      default: ''
    },
    accessToken: {
      type: String,
      trim: true,
      //required: true,
      default: ''
    },
    refreshToken: {
      type: String,
      trim: true,
      //required: true,
      default: ''
    },
    expiresIn: {
      type: String,
      trim: true,
      //required: true,
      default: ''
    },
    isActive: {
      type: Boolean,
      //required: true,
      default: true
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

userSchema.methods = {
  getPublicFields: function () {
    return {
      id: this._id,
      username: this.username,
      name: this.name,
      surname: this.surname,
      isActive: this.isActive,
      job: this.job,
      age: this.age
      // accessToken: this.accessToken,
      // refreshToken: this.refreshToken,
      // expiresIn: this.expiresIn,
    };
  }
};

const userModel = model('users', userSchema);

export default userModel;
