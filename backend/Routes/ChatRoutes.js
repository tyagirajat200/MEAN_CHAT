const express = require('express');
const router = express.Router();

const Message = require('../Schema/Message');
const Conversation = require('../Schema/Conversation');



const authChecker = (req, res, next) => {
    const sessUser = req.session.user;
    if (sessUser) {
        next()
    }
    else {
        console.log("No User Found")
        return res.status(400).json({ error: "No User Found", auth: false });
    }
}
// Get conversations list
router.get('/conversations', authChecker, (req, res) => {
    let from = req.session.user._id;
    Conversation.find({ recipients: { $all: [{ $elemMatch: { $eq: from } }] } })
        .sort({ 'updatedAt': -1 })
        .populate('recipients')
        .exec((err, conversations) => {
            if (err) return res.status(400).json({ message: 'Failure' });
            res.json({ success: true, conversations });
        });
});

// Get messages from conversation
// based on to & from
router.get('/conversations/query/:id', authChecker, (req, res) => {
    let user1 = req.session.user._id;
    let user2 = req.params.id
    Message.find({ $or: [{ to: user1, from: user2 }, { to: user2, from: user1 }] })
        .exec((err, messages) => {
            if (err) return res.status(400).json({ message: 'Failure' });

            res.json({ success: true, messages });
        });
});

// Post private message
router.post('/', authChecker, (req, res) => {
    let user1 = req.session.user._id;
    let user2 = req.body.to;

    const reciever = req.users.find(user => user.userId == user2)
    const sender = req.users.find(user => user.userId == user1)


    Conversation.replaceOne(
        { recipients: { $all: [user1, user2] } },
        { recipients: [user1, user2], lastMessage: req.body.body },
        { new: true, upsert: true })
        .exec((err, conversation) => {
            if (err) return res.status(400).json({ message: 'Failure' });
            else {
                let message = new Message({
                    to: req.body.to,
                    from: user1,
                    body: req.body.body,
                });

                message.save((err, data) => {
                    if (err) return res.status(400).json({ message: 'Failure' });

                    Conversation.find({ recipients: { $all: [{ $elemMatch: { $eq: user1 } }] } })
                        .sort({ 'updatedAt': -1 })
                        .populate('recipients')
                        .exec((err, conversations) => {
                            if (err) return res.status(400).json({ message: 'Failure' });

                            res.json({ success: true, data });
                            if (reciever) { req.io.to(reciever.socketId).emit('messages', data, user1,conversations); }
                            req.io.to(sender.socketId).emit('messages', data, user2,conversations);
                        });
                });
            }
        }
        );
});

module.exports = router;