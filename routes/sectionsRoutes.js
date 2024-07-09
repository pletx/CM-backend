const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middlewares/authenticateJWT');
const Section = require('../models/Section');

// Route pour récupérer toutes les sections
router.get('/', async (req, res) => {
  try {
    const sections = await Section.find();
    res.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ message: 'Error fetching sections' });
  }
});

// Route pour mettre à jour une section existante
router.put('/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const updatedSection = await Section.findByIdAndUpdate(id, { content }, { new: true });
    if (updatedSection) {
      res.json(updatedSection);
    } else {
      res.status(404).json({ message: 'Section not found' });
    }
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ message: 'Error updating section' });
  }
});

module.exports = router;
