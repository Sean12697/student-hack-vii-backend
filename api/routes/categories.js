const express = require('express');
const mongooseHandler = require('../../mongooseHandler');
const mongooseConnection = new mongooseHandler();
const router = express.Router();

router.get('/', (req, res, next) => {
    mongooseConnection.getCategories(req.body.email, req.body.session_key).then(categories => {
        res.status(200).json({
            categories
        });
    })
});

module.exports = router;