import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    }
}, {
    timestamps: true
});
const Todo = mongoose.model('Todo', todoSchema);
export default Todo;
