const Comment = require('../models/Comment');

// @desc    Add a comment
// @route   POST /api/comments
// @access  Private
const addComment = async (req, res) => {
    try {
        const { novelId, chapterIndex, paragraphIndex, content } = req.body;

        const newComment = new Comment({
            novelId,
            chapterIndex,
            paragraphIndex,
            content,
            user: req.user.id,
        });

        const comment = await newComment.save();

        // Populate user info (name)
        await comment.populate('user', 'name');

        res.json(comment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get comments for a chapter
// @route   GET /api/comments
// @access  Public
const getComments = async (req, res) => {
    try {
        const { novelId, chapterIndex } = req.query;

        if (!novelId || !chapterIndex) {
            return res.status(400).json({ msg: 'Please provide novelId and chapterIndex' });
        }

        const comments = await Comment.find({ novelId, chapterIndex })
            .populate('user', 'name')
            .sort({ createdAt: -1 }); // Newest first

        res.json(comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    addComment,
    getComments,
};
