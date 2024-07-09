// routes/resultsRoutes.js
const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
const authenticateJWT = require('../middlewares/authenticateJWT');
const Result = require('../models/resultModel');
// Route pour récupérer tous les résultats
router.get('/', async (req, res) => {
  try {
    const results = await Result.find();
    res.json(results);
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ message: 'Error fetching results' });
  }
});

// Route pour ajouter un nouveau résultat
router.post('/', async (req, res) => {
  const { successRate, date, mentions } = req.body;
  const newResult = new Result({
    successRate,
    date,
    mentions
  });
  try {
    const result = await newResult.save();
    res.status(201).json(result);
  } catch (error) {
    console.error("Error adding new result:", error);
    res.status(500).json({ message: 'Error adding new result' });
  }
});

// Route pour supprimer un résultat existant
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Result.deleteOne({ _id: id });
    if (result.deletedCount === 1) {
      res.sendStatus(204);
    } else {
      res.status(404).json({ message: 'Result not found' });
    }
  } catch (error) {
    console.error("Error deleting result:", error);
    res.status(500).json({ message: 'Error deleting result' });
  }
});

module.exports = router;
