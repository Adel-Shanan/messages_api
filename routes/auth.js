const express = require('express');

const authController = require('../controllers/auth.js');

const authValidator= require('../validators/auth.js');


const isAuth = require('../middleware/is-auth.js')


const router = express.Router();


router.put('/signup', authValidator.signupValidator, authController.signup);

router.post('/login', authController.login );


// we added the status routes to here becuase it is related to the user

// GET /auth/status
router.get('/status', isAuth, authController.getUserStatus);
// PUT /auth/status
router.put('/status', isAuth, authValidator.statusValidator,  authController.updateUserStatus);

module.exports = router;

