const mongoose = require("mongoose");

const SubtaskSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    task_id: {
        type: Number,
        required: true,
    },
    status: {
        type: Number,
        required: true,
    },
    created_at: {
        type: Date,
        required: true,
        min: '2023-12-31',
        max: '2025-12-31'
    },
    updated_at: {
        type: Date,
        min: '2023-12-31',
        max: '2025-12-31'
    },
    deleted_at: {
        type: Date,
        min: '2023-12-31',
        max: '2025-12-31'
    },
    deleted: {
        type: Boolean
    }
})

module.exports = mongoose.model("Subtasks", SubtaskSchema);