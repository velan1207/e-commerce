const express = require('express');
const { processPayment, sendStripeApi, dummyProcessPayment } = require('../controllers/paymentController');
const { isAuthenticatedUser } = require('../middlewares/authenticate');
const router = express.Router();

router.route('/payment/process').post( isAuthenticatedUser, processPayment);
router.route('/payment/dummy').post( isAuthenticatedUser, dummyProcessPayment);
router.route('/stripeapi').get( isAuthenticatedUser, sendStripeApi);


module.exports = router;