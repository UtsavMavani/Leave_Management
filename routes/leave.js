const router = require('express').Router();
const authUser = require('../middleware/auth');
const leave = require('../controllers/leave');

router.post('/leaveRequest', authUser, leave.leaveRequest);
router.get('/leaveStatus', authUser, leave.viewLeaveStatus);
router.get('/leaveBalance', authUser, leave.viewLeaveBalance);

router.put('/updateLeaveStatus/:id', authUser, leave.updateLeaveStatus);

module.exports = router;