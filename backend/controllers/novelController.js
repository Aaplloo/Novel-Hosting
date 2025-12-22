const Novel = require('../models/Novel');
const path = require('path');
const fs = require('fs');

// @desc    Upload a novel
// @route   POST /api/novels
// @access  Private/Admin
const uploadNovel = async (req, res) => {
  try {
    const { title } = req.body;
    const file = req.files['file'][0];
    const filePath = file.path;
    const fileType = path.extname(file.originalname).substring(1);

    let coverImage = 'https://via.placeholder.com/150x220.png?text=No+Cover';
    if (req.files['coverImage']) {
      coverImage = req.files['coverImage'][0].path.replace(/\\/g, '/');
    }

    const newNovel = new Novel({
      title,
      author: req.user.id,
      filePath,
      fileType,
      coverImage,
    });

    const novel = await newNovel.save();
    res.json(novel);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all novels
// @route   GET /api/novels
// @access  Public
const getNovels = async (req, res) => {
  try {
    const novels = await Novel.find().populate('author', 'name');
    res.json(novels);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get a single novel by ID
// @route   GET /api/novels/:id
// @access  Public
const getNovelById = async (req, res) => {
  try {
    const novel = await Novel.findById(req.params.id).populate('author', 'name');
    if (!novel) {
      return res.status(404).json({ msg: 'Novel not found' });
    }
    res.json(novel);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Novel not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Delete a novel
// @route   DELETE /api/novels/:id
// @access  Private/Admin
const deleteNovel = async (req, res) => {
  try {
    const novel = await Novel.findById(req.params.id);

    if (!novel) {
      return res.status(404).json({ msg: 'Novel not found' });
    }

    // Check user
    if (novel.author.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Delete file from server
    fs.unlink(novel.filePath, (err) => {
      if (err) {
        console.error(err);
      }
    });

    await Novel.deleteOne({ _id: req.params.id });

    res.json({ msg: 'Novel removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Novel not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Update novel cover
// @route   PUT /api/novels/:id/cover
// @access  Private/Admin
const updateNovelCover = async (req, res) => {
  try {
    const novel = await Novel.findById(req.params.id);

    if (!novel) {
      return res.status(404).json({ msg: 'Novel not found' });
    }

    // Check user
    if (novel.author.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload a file' });
    }

    // Delete old cover if it's not the placeholder and exists
    if (novel.coverImage && !novel.coverImage.includes('via.placeholder.com')) {
      const oldCoverPath = path.join(__dirname, '..', novel.coverImage);
      if (fs.existsSync(oldCoverPath)) {
        fs.unlink(oldCoverPath, (err) => {
          if (err) console.error(err);
        });
      }
    }

    novel.coverImage = req.file.path.replace(/\\/g, '/');
    await novel.save();

    res.json(novel);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Novel not found' });
    }
    res.status(500).send('Server Error');
  }
};


module.exports = {
  uploadNovel,
  getNovels,
  getNovelById,
  deleteNovel,
  updateNovelCover,
};
