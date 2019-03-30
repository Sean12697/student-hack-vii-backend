const express = require('express');
const mongooseHandler = require('../../mongooseHandler');
const mongooseConnection = new mongooseHandler();
const router = express.Router();

router.get('/', (req, res, next) => {
    mongooseConnection.signin(req.body.email, req.body.password).then(session_key => {
        res.status(200).json({
            session_key
        });
    })
});

module.exports = router;