// routes/messages.js
const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const router = express.Router();

// Send message
router.post('/', auth, async (req, res) => {
  const { receiverId, message, tuitionId } = req.body;
  const msg = new Message({
    sender: req.user.id,
    receiver: receiverId,
    message,
    tuition: tuitionId || null
  });
  await msg.save();
  await msg.populate('sender receiver', 'name photoUrl');
  res.json(msg);
});

// Get chat between two users
router.get('/chat/:userId', auth, async (req, res) => {
  const messages = await Message.find({
    $or: [
      { sender: req.user.id, receiver: req.params.userId },
      { sender: req.params.userId, receiver: req.user.id }
    ]
  })
  .populate('sender receiver', 'name photoUrl')
  .sort('createdAt');
  res.json(messages);
});

module.exports = router;