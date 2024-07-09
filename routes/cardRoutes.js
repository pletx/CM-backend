// routes/cardRoutes.js

const express = require('express');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const router = express.Router();
const authenticateJWT = require('../middlewares/authenticateJWT');
const Card = require('../models/cardModel');

// Configurer multer pour le stockage des images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Route pour récupérer toutes les cartes
router.get('/', async (req, res) => {
  try {
    const cards = await Card.find();
    res.json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    res.status(500).json({ message: 'Error fetching cards' });
  }
});

// Route pour ajouter une nouvelle carte
router.post('/', authenticateJWT, upload.single('image'), async (req, res) => {
  const { title, description } = req.body;
  const image = req.file ? req.file.path : null;
  const newCard = new Card({
    title,
    description,
    image
  });
  try {
    const card = await newCard.save();
    res.status(201).json(card);
  } catch (error) {
    console.error("Error adding new card:", error);
    res.status(500).json({ message: 'Error adding new card' });
  }
});

// Route pour supprimer une carte existante
router.delete('/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`Attempting to delete card with id: ${id}`);
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid card ID' });
    }

    const result = await Card.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 1) {
      console.log(`Card with id: ${id} deleted successfully.`);
      res.sendStatus(204);
    } else {
      console.log(`Card with id: ${id} not found.`);
      res.status(404).json({ message: 'Card not found' });
    }
  } catch (error) {
    console.error(`Error deleting card with id: ${id}`, error);
    res.status(500).json({ message: 'Error deleting card' });
  }
});
// Route pour mettre à jour une carte existante
router.put('/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { title, description, image } = req.body;

  try {
    const updatedCard = await Card.findByIdAndUpdate(
      id,
      { title, description, image },
      { new: true }
    );

    if (!updatedCard) {
      return res.status(404).json({ message: 'Card not found' });
    }

    res.json(updatedCard);
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ message: 'Error updating card' });
  }
});

module.exports = router;
