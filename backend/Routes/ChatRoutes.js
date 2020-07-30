const express = require('express');
const router = express.Router();

const Message = require('../Schema/Message');
const Conversation = require('../Schema/Conversation');

const authChecker = require('../Middleware/Auth')


// Get conversations list
router.get('/conversations/:id',authChecker, (req, res) => {
    const user = req.params.id
     Conversation.find({recipients: user })
        .sort({ 'updatedAt': -1 })
        .populate('recipients',{'password':0,'__v':0})
        .exec((err, conversations) => {
            if (err) return res.status(400).json({ message: 'Failure' });
            res.json({ success: true, conversations });
        });
});

// Get messages from conversation
// based on to & from
router.get('/conversations/query/:user1/:user2', authChecker, (req, res) => {
    let user1 = req.params.user1;
    let user2 = req.params.user2;
    Message.find({ $or: [{ to: user1, from: user2 }, { to: user2, from: user1 }] })
        .exec((err, messages) => {
            if (err) return res.status(400).json({ message: 'Failure' });

            res.json({ success: true, messages });
        });
});

// Post private message
router.post('/:user1/:user2', authChecker, (req, res) => {
    let user1 = req.params.user1;
    let user2 = req.params.user2;

    const reciever = req.users.find(user => user.userId == user2)
    const sender = req.users.find(user => user.userId == user1)

    Conversation.findOneAndUpdate(
        { $or : [{recipients:[user1,user2]},{recipients:[user2,user1]}]},
        // {recipients :{ $all: [user1, user2] }},
        {recipients: [user1, user2], lastMessage: req.body.body , msgType : req.body.type},
        { new: true, upsert: true ,setDefaultsOnInsert: true })
        .exec((err, conversation) => {
            if (err) return res.status(400).json({ message: 'Failure' });
            else {
                let message = new Message({
                    to: user2,
                    from: user1,
                    body: req.body.body,
                    msgType : req.body.type
                });

                message.save((err, data) => {
                    if (err) return res.status(400).json({ message: 'Failure' });
                    res.json({ success: true, data });
                    // if (reciever) { req.io.to(reciever.socketId).emit('messages', data, user1); }
                    // req.io.to(sender.socketId).emit('messages', data, user2);
                    req.io.sockets.to(user2).emit('messages', data, user1);
                    req.io.sockets.to(user1).emit('messages', data, user2);
                });
            }
        }
        );
});

module.exports = router;