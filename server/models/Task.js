const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  assigner: { type: String, require: true },
  assignee: { type: String, require: true },
  status: { type: Number, default: 0},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Task', TaskSchema);
