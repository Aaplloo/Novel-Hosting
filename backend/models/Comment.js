const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    novelId: {
        type: Schema.Types.ObjectId,
        ref: 'Novel',
        required: true,
    },
    chapterIndex: {
        type: Number,
        required: true,
    },
    paragraphIndex: {
        type: Number,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Comment', CommentSchema);
