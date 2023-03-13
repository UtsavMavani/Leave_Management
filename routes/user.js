const router = require('express').Router();
const authUser = require('../middleware/auth');
const user = require('../controllers/user');

router.post('/register', user.register);
router.post('/login', user.login);
router.get('/profile', authUser, user.getProfile);
router.put('/updateProfile', authUser, user.updateProfile);
router.post('/changePassword', authUser, user.changePassword);
router.put('/update/:id', authUser, user.updateUserDetails);
router.delete('/delete/:id', authUser, user.deleteUserDetails);
router.get('/usersList', authUser, user.getUsersList);

module.exports = router;