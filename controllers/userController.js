const User = require("../models/userModel");

class UserController {
  async getUser(req, res) {
    const user = await User.findOne({ slug: req.params.slug })
      .populate("followers following")
      .select("-password");
    if (!user) return res.status(404).json({ success: false, msg: "User not found !" });
    return res.json({ success: true, msg: "Success!", user });
  }

  async searchUser(req, res) {
    const users = await User.find({
      fullname: {
        $regex: req.query.search,
      },
    })
      .select("fullname avatar slug")
      .limit(10)
      .lean();
    return res.status(200).json({ success: true, msg: "Successfully !", users });
  }

  async followUser(req, res) {
    const user = await User.find({
      _id: req.params.id,
      followers: req.userID,
    });
    if (user.length > 0)
      return res.status(400).json({ success: false, msg: "You have following this user !" });

    await User.findByIdAndUpdate(
      req.userID,
      {
        $push: {
          following: req.params.id,
        },
      },
      { new: true }
    );

    const newUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          followers: req.userID,
        },
      },
      { new: true }
    );

    return res
      .status(201)
      .json({ success: true, msg: "Follow successfully !", user: newUser });
  }

  async unFollowUser(req, res) {
    // check arr followers contain req.USERID
    const user = await User.find({ _id: req.params.id, followers: req.userID });
    if (user.length === 0)
      return res.status(400).json({ success: false, msg: "You have not follow this user !" });

    const newUser = await User.findByIdAndUpdate(req.params.id, {
      $pull: {
        followers: req.userID,
      },
    });

    await User.findByIdAndUpdate(req.userID, {
      $pull: {
        following: req.params.id,
      },
    });

    return res
      .status(200)
      .json({ success: true, msg: "Unfollow successfully !", user: newUser });
  }

  async updateUser(req, res) {
    const { fullname, avatar, gender, phone, address, story, website } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userID,
      {
        fullname,
        avatar,
        gender,
        phone,
        address,
        story,
        website,
      },
      { new: true }
    );
    return res.status(200).json({ success: true, msg: "Updated successfully !", user });
  }

  async suggestUser(req, res) {
    const user = await User.findById(req.userID);
    const following = [...user.following, user._id];
    const users = await User.aggregate([
      {
        $match: {
          _id: {
            $nin: following,
          },
        },
      },
      {
        $sample: { size: 10 },
      },
      {
        $lookup: {
          from: "users",
          localField: "followers",
          foreignField: "_id",
          as: "followers",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "following",
          foreignField: "_id",
          as: "following",
        },
      },
    ]).project("-password");
    return res.status(200).json({ success: true, msg: "Success", users });
  }
}

module.exports = new UserController();
