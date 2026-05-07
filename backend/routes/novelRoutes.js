const express = require('express');
const router = express.Router();
const {
  uploadNovel,
  getNovels,
  getNovelById,
  deleteNovel,
} = require('../controllers/novelController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const uploadPermission = require('../middleware/uploadPermission');
const upload = require('../middleware/upload');

// @route   POST /api/novels
// @desc    Upload a novel
// @access  Private/Admin
router.post('/', [auth, uploadPermission, upload.fields([{ name: 'file', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }])], uploadNovel);

// @route   GET /api/novels
// @desc    Get all novels
// @access  Public
router.get('/', getNovels);

// @route   GET /api/novels/:id
// @desc    Get a single novel by ID
// @access  Private
router.get('/:id', auth, getNovelById);

// @route   DELETE /api/novels/:id
// @desc    Delete a novel
// @access  Private/Admin
// @route   PUT /api/novels/:id/cover
// @desc    Update novel cover
// @access  Private/Admin
router.put('/:id/cover', [auth, admin, upload.single('coverImage')], require('../controllers/novelController').updateNovelCover);

// @route   DELETE /api/novels/:id
// @desc    Delete a novel
// @access  Private/Admin
router.delete('/:id', [auth, admin], deleteNovel);

module.exports = router;
