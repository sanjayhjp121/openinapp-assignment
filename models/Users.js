const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    phone_number: {
        type: Number,
        required: true,
        unique: true
    },
    priority: {
        type: Number,
    }
});

module.exports = mongoose.model("Users", UserSchema);