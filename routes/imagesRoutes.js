const express = require('express');
const router = express.Router();
const multer = require('multer');
const Image = require('../models/Image'); // Assurez-vous d'importer votre modèle d'image
const authenticateJWT = require('../middlewares/authenticateJWT');

// Configuration de Multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Endpoint pour l'upload d'une image (authentifié)
router.post('/upload', authenticateJWT, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Utilisation de Buffer pour enregistrer les données de l'image
    const newImage = new Image({
      filename: req.file.originalname,
      data: req.file.buffer, // Stocker le buffer de l'image
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    await newImage.save();
    res.status(201).json(newImage);
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

module.exports = router;