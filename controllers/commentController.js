const Comment = require("../models/commentModel");
const Post = require("../models/postModel");
class CommentController {
  async createComment(req, res) {
    const { content, tag, reply, postID, postUserID } = req.body;
    const post = await Post.findById(postID);
    if (!post) return res.status(400).json({ success: false, msg: "Post is not found !" });
    if (reply) {
      try {
        const comment = await Comment.findById(reply);
        if (!comment)
          return res.status(400).json({ success: false, msg: "Comment is not found !" });
      } catch (error) {
        return res.status(400).json({ success: false, msg: "Comment is not found !" });
      }
    }
    const newComment = new Comment({
      content,
      user: req.userID,
      tag,
      reply,
      postID,
      postUserID,
    });
    await newComment.save();
    await newComment.populate("user likes");
    await Post.findByIdAndUpdate(postID, {
      $push: {
        comments: newComment._id,
      },
    });
    res
      .status(200)
      .json({ success: true, msg: "Comment created successfully !", comment: newComment });
  }

  async updateComment(req, res) {
    const condition = { user: req.userID, _id: req.params.id };
    const comment = await Comment.findOneAndUpdate(
      condition,
      {
        content: req.body.content,
      },
      { new: true }
    ).populate("user likes");
    return res
      .status(200)
      .json({ sucess: true, msg: "Comment updated successfully !", comment });
  }

  async deleteComment(req, res) {
    try {
      const comment = await Comment.findOneAndDelete(
        {
          _id: req.params.id,
          $or: [{ user: req.userID }, { postUserID: req.userID }],
        },
        { new: true }
      );
      await Post.findByIdAndUpdate(comment.postID, {
        $pull: {
          comments: comment._id,
        },
      });
      await Comment.deleteMany({
        reply: comment._id,
      });
      return res
        .status(200)
        .json({ sucess: true, msg: "Comment delete successfully !", comment });
    } catch (error) {
      console.log(error);
    }
  }

  async toggleLikeComment(req, res) {
    const comment = await Comment.findById(req.params.id);
    if (comment.likes.includes(req.userID)) {
      const newComment = await Comment.findByIdAndUpdate(
        req.params.id,
        {
          $pull: {
            likes: req.userID,
          },
        },
        { new: true }
      ).populate("user likes");
      return res
        .status(200)
        .json({ sucess: true, msg: "Unlike comment successfully !", comment: newComment });
    }
    const newComment = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          likes: req.userID,
        },
      },
      { new: true }
    ).populate("user likes");
    return res
      .status(200)
      .json({ sucess: true, msg: "Like comment successfully !", comment: newComment });
  }
}

module.exports = new CommentController();
