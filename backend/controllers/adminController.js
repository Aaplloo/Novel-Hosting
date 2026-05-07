const crypto = require('crypto');
const User = require('../models/User');
const InvitationCode = require('../models/InvitationCode');

const normalizeCode = (code) => code.trim().toUpperCase();

const listUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ date: -1 });

    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const updateUserPermissions = async (req, res) => {
  try {
    const { canUpload } = req.body;
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.canUpload = Boolean(canUpload);
    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const listInvitationCodes = async (req, res) => {
  try {
    const codes = await InvitationCode.find().sort({ date: -1 });
    res.json(codes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const createInvitationCode = async (req, res) => {
  try {
    const code = normalizeCode(req.body.code || crypto.randomBytes(4).toString('hex'));
    const existingCode = await InvitationCode.findOne({ code });

    if (existingCode) {
      return res.status(400).json({ msg: 'Invitation code already exists' });
    }

    const invitationCode = new InvitationCode({ code });
    await invitationCode.save();

    res.status(201).json(invitationCode);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const deleteInvitationCode = async (req, res) => {
  try {
    const code = await InvitationCode.findById(req.params.id);

    if (!code) {
      return res.status(404).json({ msg: 'Invitation code not found' });
    }

    await InvitationCode.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Invitation code removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  listUsers,
  updateUserPermissions,
  listInvitationCodes,
  createInvitationCode,
  deleteInvitationCode,
};
