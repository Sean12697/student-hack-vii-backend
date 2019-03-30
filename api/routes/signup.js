const express = require('express');
const mongooseHandler = require('../../mongooseHandler');
const mongooseConnection = new mongooseHandler();
const router = express.Router();

router.post('/', (req, res, next) => {
    mongooseConnection.signin(req.body.email, req.body.password).then(categories => {
        res.status(200).json({
            session_key
        });
    })
});

module.exports = router;