const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const User = require('../models/User');
const Task = require('../models/Task')
const methodOverride = require('method-override');

const jwtSecret = process.env.JWT_SECRET;
let loggedInUserEmail = null;
router.use(cookieParser());
router.use(methodOverride('_method'));
router.use(express.urlencoded({ extended: true }));


const authMiddleWare = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "UNAUTHORIZED" })
    }
    try {
        const dcoded = jwt.verify(token, jwtSecret);
        req.userId = dcoded.userId;
        loggedInUserEmail = req.cookies.loggedInUserEmail;
        next();
    } catch (error) {
        return res.status(401).json({ message: "UNAUTHORIZED" })
    }
}


router.post('/register', async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const user = await User.create({ email, password });
        console.log("User created", user);
        res.redirect("/");

    } catch (error) {
        console.log(error);
    }
});

router.post("/admin", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid User' });
        }
        const isPasswordV = password === user.password;
        if (!isPasswordV) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user.email }, jwtSecret);
        res.cookie('token', token, { httpOnly: true });
        res.cookie('loggedInUserEmail', email); 
        res.redirect('dashboard');
    } catch (error) {
        console.log(error);
    }
});

router.get("/dashboard", authMiddleWare, async (req, res) => {
    const local = { title: "Dashboard | TaskUnity" };
    const data = await Task.find();
    const status0Tasksassignee = await Task.find({ status: 0, assignee: loggedInUserEmail }).sort({ updatedAt: -1 });
    const status1Tasksassignee = await Task.find({ status: 1, assignee: loggedInUserEmail }).sort({ updatedAt: -1 });
    const status0Tasksassigner = await Task.find({ status: 0, assigner: loggedInUserEmail }).sort({ updatedAt: -1 });
    const status1Tasksassigner = await Task.find({ status: 1, assigner: loggedInUserEmail }).sort({ updatedAt: -1 });

    res.render('dashboard', { local, loggedInUserEmail, status0Tasksassignee, status1Tasksassignee, status0Tasksassigner, status1Tasksassigner });
});


router.get("/mark-done", authMiddleWare, async (req, res) => {
    const local = { title: "Dashboard | TaskUnity" };
    const taskID = req.query._id;
    const updateResult = await Task.findByIdAndUpdate(
        taskID,
        { $set: { status: 1 } }
    );

    const data = await Task.find();
    const status0Tasksassignee = await Task.find({ status: 0, assignee: loggedInUserEmail }).sort({ updatedAt: -1 });
    const status1Tasksassignee = await Task.find({ status: 1, assignee: loggedInUserEmail }).sort({ updatedAt: -1 });
    const status0Tasksassigner = await Task.find({ status: 0, assigner: loggedInUserEmail }).sort({ updatedAt: -1 });
    const status1Tasksassigner = await Task.find({ status: 1, assigner: loggedInUserEmail }).sort({ updatedAt: -1 });

    res.render('dashboard', { local, loggedInUserEmail, status0Tasksassignee, status1Tasksassignee, status0Tasksassigner, status1Tasksassigner });

});


router.get("/add-task", authMiddleWare, async (req, res) => {
    const local = {
        title: "Add Task | TaskUnity",
    }
    const data = await User.find();
    const emails = data.map(data => data.email).filter((email, index, self) => email !== loggedInUserEmail && self.indexOf(email) === index);
    const x = { loggedInUserEmail };
    res.render('add-task', { local, emails, x });
});



router.post("/add-task", authMiddleWare, async (req, res) => {
    const newTask = {
        title: req.body.title,
        body: req.body.body,
        assigner: req.body.assigner,
        assignee: req.body.assignee,
        status: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    await Task.create(newTask);
    res.redirect('/dashboard');
});

router.get("/edit-task/", authMiddleWare, async (req, res) => {
    const taskID = req.query._id;
    const local = {
        title: "Edit Task | TaskUnity",
    }
    const data = await Task.findOne({ _id: taskID });
    const data2 = await Task.find();
    const emails = data2.map(data2 => data2.assignee).filter(email => email !== loggedInUserEmail);
    const x = { loggedInUserEmail };
    res.render('edit-task', { local, emails, data, x });

});

router.put("/edit-task/:id", async (req, res) => {
    try {
        await Task.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: new Date()
        });
        res.redirect('/dashboard');

    } catch (error) {
        console.log(error);
    }
});

router.get('/delete-task/:id', authMiddleWare, async (req, res) => {
    try {
      await Task.deleteOne( { _id: req.params.id } );
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }
  
  });

router.get("/logout", async (req, res) => {
    res.clearCookie('token');
    res.clearCookie('loggedInUserEmail');
    res.redirect('/')
});



module.exports = router