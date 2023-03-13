const router = require('express').Router();
const userRouter = require('./user');
const leaveRouter = require('./leave');

router.use('/user', userRouter);
router.use('/leave', leaveRouter);

module.exports = router;