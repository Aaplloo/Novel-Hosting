const express = require('express');
const router = express.Router();
const { addComment, getComments } = require('../controllers/commentController');
const auth = require('../middleware/auth');

// @route   POST /api/comments
// @desc    Add a comment
// @access  Private
router.post('/', auth, addComment);

// @route   GET /api/comments
// @desc    Get comments for a chapter
// @access  Public (or Private? User asked for auth on post, implied public read or authorized read. I'll make read public for now as is typical, but easy to change)
// Re-reading request: "请确保接口经过身份验证...只有登录用户才能发评" -> Only post needs auth explicitly mentioned. 
// "GET /api/comments: 获取特定章节的所有评论" -> Doesn't explicitly say auth required. I'll make it Public for easier testing, or follow same pattern if user desires privacy. Usually comments are public.
router.get('/', getComments);

module.exports = router;
