const User = require('../models/User');

module.exports = async function (req, res, next) {
  try {
    const user = await User.findById(req.user.id);

    if (!user || (!user.isAdmin && !user.canUpload)) {
      return res.status(403).json({ msg: 'Upload permission required.' });
    }

    req.user.isAdmin = user.isAdmin;
    req.user.canUpload = user.canUpload;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
