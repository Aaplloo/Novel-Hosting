const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
  listUsers,
  updateUserPermissions,
  listInvitationCodes,
  createInvitationCode,
  deleteInvitationCode,
} = require('../controllers/adminController');

router.get('/users', [auth, admin], listUsers);
router.patch('/users/:id/permissions', [auth, admin], updateUserPermissions);

router.get('/invitation-codes', [auth, admin], listInvitationCodes);
router.post('/invitation-codes', [auth, admin], createInvitationCode);
router.delete('/invitation-codes/:id', [auth, admin], deleteInvitationCode);

module.exports = router;
