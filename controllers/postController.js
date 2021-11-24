const Post = require("../models/postModel");
const User = require("../models/userModel");
require("../models/commentModel");

const serverError = { success: false, msg: "Internal error !" };

class featureAPI {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  pagination() {
    const limit = parseInt(this.queryString.limit) || 10;
    const currPage = parseInt(this.queryString.page) || 1;
    const skip = (currPage - 1) * limit;
    this.query.skip(skip).limit(limit);
    return this;
  }
}

class PostController {
  async createPost(req, res) {
    try {
      const { content, images } = req.body;
      const newPost = new Post({
        content,
        user: req.userID,
        images: images || [],
      });
      await newPost.save();
      return res
        .status(201)
        .json({ success: true, msg: "Post created successfully !", post: newPost });
    } catch (error) {
      return res.status(500).json(serverError);
    }
  }
  async updatePost(req, res) {
    const condition = {
      user: req.userID,
      _id: req.params.id,
    };
    const { content, images } = req.body;
    try {
      const post = await Post.findOneAndUpdate(condition, {
        content,
        images,
      })
        .populate("user likes", "fullname slug avatar")
        .populate({
          path: "comments",
          populate: {
            path: "user likes",
            select: "-password",
          },
        });
      return res.status(201).json({
        success: true,
        msg: "Post updated successfully",
        post: { ...post._doc, content, images },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json(serverError);
    }
  }
  async deletePost(req, res) {
    const condition = {
      user: req.userID,
      _id: req.params.id,
    };
    try {
      const post = await Post.findOne(condition);
      await post.deleteOne();
      await User.updateMany(
        {
          saved: post._id,
        },
        {
          $pull: {
            saved: post._id,
          },
        }
      );
      return res.status(200).json({ success: true, msg: "Post deleted successfully !", post });
    } catch (error) {
      return res.status(500).json(serverError);
    }
  }
  async getPosts(req, res) {
    try {
      const user = await User.findById(req.userID);
      const getData = new featureAPI(
        Post.find({
          user: {
            $in: [...user.following, user._id],
          },
        }),
        req.query
      ).pagination();
      const posts = await getData.query
        .sort("-createdAt")
        .populate("user likes")
        .populate({
          path: "comments",
          populate: {
            path: "user likes",
            select: "-password",
          },
        })
        .lean();
      return res.status(200).json({ success: true, posts, results: posts.length });
    } catch (error) {
      return res.status(500).json(serverError);
    }
  }

  async getPost(req, res) {
    try {
      const post = await Post.findById(req.params.id)
        .populate("user likes")
        .populate({
          path: "comments",
          populate: {
            path: "user likes",
            select: "-password",
          },
        });
      if (!post) return res.status(500).json({ success: false, msg: "Couldn't get post !" });
      return res.status(200).json({ success: true, msg: "Successfully !", post });
    } catch (error) {
      return res.status(500).json(serverError);
    }
  }

  async getUserPosts(req, res) {
    try {
      const user = await User.findOne({ slug: req.params.slug });
      const posts = await Post.find({ user: user._id });
      return res.status(200).json({ success: true, msg: "Successfully !", posts });
    } catch (error) {
      return res.status(500).json(serverError);
    }
  }

  async toggleLikePost(req, res) {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(400).json({ success: false, msg: "No post found !" });
    if (post.likes.includes(req.userID)) {
      const newPost = await Post.findByIdAndUpdate(
        req.params.id,
        {
          $pull: {
            likes: req.userID,
          },
        },
        { new: true }
      )
        .populate("user likes")
        .populate({
          path: "comments",
          populate: {
            path: "user likes",
            select: "-password",
          },
        });
      return res
        .status(200)
        .json({ success: true, msg: "Unliked this post !", post: newPost });
    }
    const newPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          likes: req.userID,
        },
      },
      { new: true }
    )
      .populate("user likes")
      .populate({
        path: "comments",
        populate: {
          path: "user likes",
          select: "-password",
        },
      });
    return res.status(200).json({ success: true, msg: "Liked this post !", post: newPost });
  }

  async getDiscoverPosts(req, res) {
    const user = await User.findById(req.userID);
    const num = parseInt(req.query.num) || 10;
    const posts = await Post.aggregate([
      { $match: { user: { $nin: [...user.following, user._id] } } },
      { $sample: { size: num } },
    ]);
    return res.status(200).json({ success: true, posts, results: posts.length });
  }

  async toggleSavePost(req, res) {
    try {
      const user = await User.findById(req.userID);
      if (user.saved.includes(req.params.id)) {
        const newUser = await User.findByIdAndUpdate(
          req.userID,
          {
            $pull: {
              saved: req.params.id,
            },
          },
          { new: true }
        );
        return res
          .status(200)
          .json({ success: true, msg: "You have unsaved post successfully !", user: newUser });
      }
      const newUser = await User.findByIdAndUpdate(
        req.userID,
        {
          $push: {
            saved: req.params.id,
          },
        },
        {
          new: true,
        }
      );
      return res
        .status(200)
        .json({ success: true, msg: "You have saved post successfully !", user: newUser });
    } catch (error) {
      console.log(error);
      return res.status(500).json(serverError);
    }
  }

  async getSavedPosts(req, res) {
    try {
      const user = await User.findById(req.userID);
      const getData = new featureAPI(
        Post.find({
          _id: {
            $in: [...user.saved],
          },
        }),
        req.query
      ).pagination();
      const posts = await getData.query.sort("-createdAt");
      return res.status(200).json({ success: true, msg: "Successfully !", posts });
    } catch (error) {
      console.log(error);
      return res.status(500).json(serverError);
    }
  }
}

module.exports = new PostController();
