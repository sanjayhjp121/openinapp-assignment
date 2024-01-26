const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Users = require("./models/Users");
const Tasks = require("./models/Tasks");
const Subtasks = require("./models/Subtasks");
const cron = require('node-cron');
const twilio = require('twilio');

app.use(express.json());
app.use(cors());
dotenv.config();

const secret = process.env.ACCESS_SECRET

const connect = async () => {
    try {
        await mongoose.connect(process.env.URI);
        console.log("Connected to mongoDb")
    } catch (err) {
        console.error(err);
    }
}

const verify = (req, res, next) => {
    const authHeader = req.headers.authtoken;
    if (authHeader) {
        console.log(authHeader)
        jwt.verify(authHeader, secret, (err, user) => {
            if (err) {
                res.send({ message: "Access Forbidden!", error: err});
            } else {
                req.user = user;
                next();
            }
        })
    } else {
        res.send({ message: "Authentication Failed!" });
    }
}

const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, secret, {
        expiresIn: "15m"
    })
}


app.post('/create-user', async (req, res) => {
    const newUser = new Users(req.body);
    try {
        const savedUser = await newUser.save();
        res.send({ status: 200, message: "success", user: savedUser });
    } catch (err) {
        res.send({ status: 500, message: "Failed", error: err.message });
    }

})

app.post('/login', async (req, res) => {
    const { userData } = req.body;
    const user = await Users.findOne({ id: userData?.id })
    if (!user) {
        res.send({ message: "User does not exist!" });
    } else if (userData?.phone_number != user.phone_number) {
        res.send({ message: "Auth failed" });
    } else {
        const accessToken = generateAccessToken(user);
        res.send({ id: user?.id, accessToken });
    }
});


app.post('/create-task', verify, async (req, res) => {
    const newTask = new Tasks(req.body);
    try {
        const savedTask = await newTask.save();
        res.status(200).json({ message: 'Task created successfully', task: savedTask });
    } catch (e) {
        res.status(500).json({ message: 'Failed to create task', error: e.message });
        console.error(e);
    }
});

app.post('/create-subtask', verify, async (req, res) => {
    const newSubtask = new Subtasks(req.body);
    try {
        const savedSubtask = await newSubtask.save();
        res.status(200).json({ message: 'Subtask created successfully', subtask: savedSubtask });
    } catch (e) {
        res.status(500).json({ message: 'Failed to create subtask', error: e.message });
        console.error(e);
    }
});

app.post('/get-all-tasks', verify, async (req, res) => {
    try {
        const tasks = await Tasks.find({ userId: req.user.id });
        res.status(200).json({ tasks });
    } catch (e) {
        res.status(500).json({ message: 'Failed to get tasks', error: e.message });
        console.error(e);
    }
});

app.post('/get-all-subtasks', verify, async (req, res) => {
    const { task_id } = req.body;
    try {
        const subtasks = await Subtasks.find({ task_id, userId: req.user.id });
        res.status(200).json({ subtasks });
    } catch (e) {
        res.status(500).json({ message: 'Failed to get subtasks', error: e.message });
        console.error(e);
    }
});

app.post('/update-task', verify, async (req, res) => {
    const { task_id, due_date, status } = req.body;
    try {
        const updatedTask = await Tasks.findByIdAndUpdate(
            task_id,
            { due_date, status },
            { new: true }
        );
        res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
    } catch (e) {
        res.status(500).json({ message: 'Failed to update task', error: e.message });
        console.error(e);
    }
});

app.post('/update-subtask', verify, async (req, res) => {
    const { subtask_id, status } = req.body;
    try {
        const updatedSubtask = await Subtasks.findByIdAndUpdate(
            subtask_id,
            { status },
            { new: true }
        );
        res.status(200).json({ message: 'Subtask updated successfully', subtask: updatedSubtask });
    } catch (e) {
        res.status(500).json({ message: 'Failed to update subtask', error: e.message });
        console.error(e);
    }
});

app.post('/delete-task', verify, async (req, res) => {
    const { task_id } = req.body;
    const getDate = new Date();
    try {
        const deletedSubtasks = await Subtasks.findOneAndUpdate(
            task_id,
            { deleted: true, deleted_at: getDate },
            { new: true }
        )
        const deletedTasks = await Tasks.findOneAndUpdate(
            task_id,
            { deleted: true, deleted_at: getDate },
            { new: true }
        );
        res.send({ status: 200, message: "Success", deletedTask: deletedTasks });
    } catch (err) {
        res.send({ status: 500, message: "Failed", error: err.message })
    }
});


app.post('/delete-subtask', verify, async (req, res) => {
    const { subtask_id } = req.body;
    const getDate = new Date();
    try {
        const deletedSubtask = await Subtasks.findByIdAndUpdate(
            subtask_id,
            { deleted: true, deleted_at: getDate },
            { new: true }
        );
        res.send({ status: 200, message: "success", deletedSubtask: deletedSubtask })
    } catch (err) {
        res.send({ status: 500, message: "Failed", error: err.message });
    }
})

//cron jobs
const updatePriorities = async () => {

} 

const callUsers = async () => {

}

cron.schedule('* * */1 * *', async () => {
    const result = await updatePriorities();
    if(result = true){
        await callUsers()
    }
});

app.listen(4000, () => {
    console.log("Listening at 4000")
    connect();
});