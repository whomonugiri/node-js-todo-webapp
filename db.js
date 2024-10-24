const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const TaskSchema = new Schema({
  userId: ObjectId,
  title: { type: String, required: true },
  isCompleted: Boolean,
  date: { type: Date, default: Date.now },
});

const UserSchema = new Schema({
  fullName: { type: String, required: true },
  emailId: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);
const Task = mongoose.model("Task", TaskSchema);

module.exports = { Task, User };
