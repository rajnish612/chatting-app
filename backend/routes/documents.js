import express from "express";
import multer from "multer";
import path from "path";
import Document from "../models/documents.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/documents/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow common document types
    const allowedTypes = /pdf|doc|docx|txt|rtf|odt|xls|xlsx|ppt|pptx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only document files are allowed'));
    }
  }
});

// Upload document
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { sender, receiver, description } = req.body;

    if (!sender || !receiver) {
      return res.status(400).json({ error: 'Sender and receiver are required' });
    }

    const document = new Document({
      sender,
      receiver,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      fileType: path.extname(req.file.originalname),
      filePath: req.file.path,
      fileUrl: `/uploads/documents/${req.file.filename}`,
      description: description || '',
    });

    await document.save();

    res.status(201).json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Get documents between two users
router.get('/conversation/:user1/:user2', async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    const documents = await Document.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ timestamp: 1 });

    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Download document
router.get('/download/:documentId', async (req, res) => {
  try {
    const document = await Document.findById(req.params.documentId);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const filePath = path.join(__dirname, '../uploads/documents/', document.fileName);
    res.download(filePath, document.originalName);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

// Mark document as seen
router.patch('/seen/:documentId', async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.documentId,
      { isSeen: true },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Error marking document as seen:', error);
    res.status(500).json({ error: 'Failed to mark document as seen' });
  }
});

// Mark all documents as seen for a conversation
router.patch('/seen/conversation/:sender/:receiver', async (req, res) => {
  try {
    const { sender, receiver } = req.params;

    await Document.updateMany(
      { 
        sender: receiver, 
        receiver: sender, 
        isSeen: false 
      },
      { isSeen: true }
    );

    res.json({ message: 'Documents marked as seen' });
  } catch (error) {
    console.error('Error marking documents as seen:', error);
    res.status(500).json({ error: 'Failed to mark documents as seen' });
  }
});

// Get unseen document counts for a user
router.get('/unseen-counts/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const unseenCounts = await Document.aggregate([
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
    console.error('Error getting unseen document counts:', error);
    res.status(500).json({ error: 'Failed to get unseen document counts' });
  }
});

export default router;