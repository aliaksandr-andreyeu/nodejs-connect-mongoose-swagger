import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      default: ''
    },
    name: {
      type: String,
      trim: true,
      default: ''
    },
    surname: {
      type: String,
      trim: true,
      default: ''
    },
    age: {
      type: Number,
      default: 0
    },
    job: {
      type: String,
      trim: true,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    },
    password: {
      type: String,
      trim: true,
      default: ''
    },
    token: {
      type: String,
      trim: true,
      default: ''
    },
    accessToken: {
      type: String,
      trim: true,
      default: ''
    },
    refreshToken: {
      type: String,
      trim: true,
      default: ''
    },
    expiresIn: {
      type: String,
      trim: true,
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

userSchema.methods = {
  toJSON: function () {
    return {
      id: this._id,
      username: this.username,
      name: this.name,
      surname: this.surname,
      isActive: this.isActive,
      job: this.job,
      age: this.age
    };
  }
};

const userModel = model('users', userSchema);

export default userModel;
