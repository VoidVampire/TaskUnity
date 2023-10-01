const express = require('express');
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const local = {
            title: "TaskUnity",
        };
        res.render('home', { local });
    } catch (error) {
        console.log(error);
    }
});

module.exports = router