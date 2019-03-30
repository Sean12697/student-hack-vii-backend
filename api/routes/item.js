const express = require('express');
const mongooseHandler = require('../../mongooseHandler');
const mongooseConnection = new mongooseHandler();
const router = express.Router();

router.post('/get', (req, res, next) => {
    mongooseConnection.getItems(req.body.email, req.body.session_key).then(items => {
        res.status(200).json({
            items
        });
    })
});

router.post('/post', (req, res, next) => {
    mongooseConnection.addItem(req.body.item, req.body.email, req.body.session_key).then(response => {
        res.status(200).json({
            response
        });
    })
});

module.exports = router;