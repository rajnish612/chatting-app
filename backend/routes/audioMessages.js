import express from "express";
import AudioMessage from "../models/audioMessages.js";

const router = express.Router();

// Mark all audio messages as seen for a conversation
router.patch('/seen/conversation/:sender/:receiver', async (req, res) => {
  try {
    const { sender, receiver } = req.params;

    // Mark audio messages as seen where sender sent to receiver
    await AudioMessage.updateMany(
      { 
        sender: sender, 
        receiver: receiver, 
        isSeen: false 
      },
      { isSeen: true }
    );

    res.json({ message: 'Audio messages marked as seen' });
  } catch (error) {
    console.error('Error marking audio messages as seen:', error);
    res.status(500).json({ error: 'Failed to mark audio messages as seen' });
  }
});

// Get unseen audio message counts for a user
router.get('/unseen-counts/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const unseenCounts = await AudioMessage.aggregate([
      {
        $match: {
          receiver: username,
          isSeen: false
        }
      },
      {
        $group: {
          _id: '$sender',
          count: { $sum: 1 }
        }
      }
    ]);

    const counts = {};
    unseenCounts.forEach(item => {
      counts[item._id] = item.count;
    });

    res.json(counts);
  } catch (error) {
    console.error('Error getting unseen audio message counts:', error);
    res.status(500).json({ error: 'Failed to get unseen audio message counts' });
  }
});

export default router;