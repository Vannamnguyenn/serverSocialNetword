const Message = require("../models/message.js");
const Conversation = require("../models/conversation.js");

class apiFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  pagination() {
    const limit = this.queryString._limit || 1000;
    const page = this.queryString._page || 1;
    const skip = (Number(page) - 1) * limit;
    this.query.skip(skip).limit(limit);
    return this;
  }
}

class messageController {
  async createConversation(req, res) {
    const { recipients, text, media, call } = req.body;
    if (recipients.length < 0 || recipients.includes(req.userID))
      return res.status(403).json({ msg: "You cannot chat with you !", success: false });
    const checkConversation = await Conversation.findOne({
      $or: [
        { recipients: [...recipients, req.userID] },
        { recipients: [req.userID, ...recipients] },
      ],
    });
    if (checkConversation)
      return res.status(403).json({ msg: "Conversation already exists !", success: false });
    try {
      const newConsevation = new Conversation({
        recipients: [...recipients, req.userID],
        text,
        media,
        call,
      });
      await newConsevation.save();
      await newConsevation.populate("recipients");
      return res
        .status(201)
        .json({ success: true, message: "Successfully !", conversation: newConsevation });
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  }

  async deleteConversation(req, res) {
    try {
      const conversation = await Conversation.findOneAndDelete(
        {
          recipients: req.userID,
          _id: req.params.id,
        },
        { new: true }
      );
      await Message.deleteMany({ conversation: conversation._id });
      return res.status(201).json({ success: true, message: "Successfully !" });
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  }

  async getConversations(req, res) {
    try {
      const apiQuery = new apiFeature(
        Conversation.find({ recipients: req.userID }).populate("recipients"),
        req.query
      ).pagination();
      const conversations = await apiQuery.query.sort("-createdAt");
      return res.status(200).json({ conversations, success: true, msg: "Successfully !" });
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  }

  async createMessage(req, res) {
    const { text, media, conversation, recipients, call } = req.body;
    if (!text && !media && !recipients)
      return res.status(500).json({ success: false, msg: "Message empty !" });
    try {
      const checkConversation = await Conversation.findOne({
        _id: conversation,
        recipients: req.userID,
      });
      if (!checkConversation)
        return res.status(403).json({ success: false, msg: "Convesation invalid !" });

      const message = new Message({
        text,
        media,
        conversation,
        recipients,
        sender: req.userID,
        call,
      });
      await message.save();
      await checkConversation.updateOne({ text, media, call });
      return res.status(201).json({ success: true, message: "Successfully !", message });
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  }

  async deleteMessage(req, res) {
    try {
      await Message.findOneAndDelete({
        sender: req.userID,
        _id: req.params.id,
      });
      return res.status(200).json({ success: true, message: "Deleted successfully !" });
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  }

  async getMessages(req, res) {
    try {
      const conversation = await Conversation.findOne({
        _id: req.params.id,
        recipients: req.userID,
      });
      if (!conversation)
        return res.status(403).json({ success: false, msg: "No conversation found !" });
      const api = new apiFeature(
        Message.find({
          conversation: conversation._id,
        }),
        req.query
      ).pagination();
      const messages = await api.query.sort("createdAt");
      return res.status(200).json({ success: true, msg: "Success!", messages });
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  }
}

module.exports = new messageController();
