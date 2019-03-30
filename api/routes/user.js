const express = require('express');
const mongooseHandler = require('../../mongooseHandler');
const mongooseConnection = new mongooseHandler();
const router = express.Router();

router.post('/details', (req, res, next) => {
    mongooseConnection.getUser(req.body.email, req.body.session_key).then(user => {
        res.status(200).json({
            user
        });
    })
});

router.post('/', (req, res, next) => {
    mongooseConnection.updateUser(req.body.newUser, req.body.email, req.body.session_key).then(response => {
        res.status(200).json({
            response
        });
    })
});

module.exports = router;