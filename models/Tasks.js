const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    priority: {
        type: Number
    },
    status: {
        type: String,
        required: true
    },
    due_date: {
        type: Date,
        required: true,
        min: '2023-12-31',
        max: '2025-12-31'
    },
    deleted:{
        type: Boolean
    },
    deleted_at: {
        type: Date,
        min: '2023-12-31',
        max: '2025-12-21'
    }
});

module.exports = mongoose.model("Tasks", TaskSchema);