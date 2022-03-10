const Notify = require("../models/Notify");

class NotifyController {
  async create(req, res) {
    const { postID, recipients, content, text, url } = req.body;
    try {
      const newNotify = new Notify({
        postID,
        user: req.userID,
        recipients,
        content,
        text,
        url,
        isRead: recipients,
      });
      await newNotify.save();
      await newNotify.populate("user");
      return res.status(200).json({ success: true, msg: "Successfully", notify: newNotify });
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  }

  async removeNotify(req, res) {
    const { postID, url } = req.body;

    try {
      const notify = await Notify.findOneAndDelete({ postID, url }, { new: true });
      return res.status(200).json({ success: true, msg: "Successfully", notify });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error });
    }
  }

  async getNotify(req, res) {
    try {
      const notifies = await Notify.find({ recipients: req.userID }).populate("user");
      return res.status(200).json({ success: true, notifies, msg: "Successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error });
    }
  }

  async changeIsRead(req, res) {
    try {
      const notify = await Notify.findByIdAndUpdate(
        req.params.id,
        {
          $pull: {
            isRead: req.userID,
          },
        },
        { new: true }
      );
      return res.status(200).json({ success: true, msg: "Successfully", notify });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error });
    }
  }

  async deleteAllNofifies(req, res) {
    try {
      await Notify.updateMany(
        { recipients: req.userID },
        {
          $pull: {
            recipients: req.userID,
          },
        }
      );
      return res.status(200).json({ success: true, msg: "Delete successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error });
    }
  }
}

module.exports = new NotifyController();
