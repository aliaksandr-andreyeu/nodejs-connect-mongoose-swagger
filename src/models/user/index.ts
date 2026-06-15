import { Schema, model, Document } from 'mongoose';

const userSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      index: true
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
    refreshToken: {
      type: String,
      trim: true,
      default: ''
    },
    resetPasswordToken: {
      type: String,
      trim: true,
      default: ''
    },
    resetPasswordExpires: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    // Build indexes automatically outside production; in production run
    // `userModel.syncIndexes()` (done on startup) to avoid blocking writes.
    autoIndex: process.env.NODE_ENV !== 'production',
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

userSchema.methods.toJSON = function () {
  return {
    id: this._id,
    username: this.username,
    name: this.name,
    surname: this.surname,
    isActive: this.isActive,
    job: this.job,
    age: this.age
  };
};

export interface User {
  username: string;
  name: string;
  surname: string;
  age: number;
  job: string;
  isActive: boolean;
  password: string;
  refreshToken: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserDocument extends User, Document {}

const userModel = model<UserDocument>('users', userSchema);

export default userModel;
