import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IAdmin extends Document {
  email: string;
  password: string;
  /** Tokens issued before this moment are rejected (see middleware/auth). */
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    passwordChangedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Unique index on email
AdminSchema.index({ email: 1 }, { unique: true });

// Hash password before saving
AdminSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // Back-dated a second: JWT `iat` is whole seconds, so a login straight
  // after the change must not look older than it.
  this.passwordChangedAt = new Date(Date.now() - 1000);
});

// Method to compare passwords
AdminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;
