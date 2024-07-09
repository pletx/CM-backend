const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');
const Image = require('./models/Image'); // Modèle d'image
const authenticateJWT = require('./middlewares/authenticateJWT'); // Middleware d'authentification
const User = require('./models/User'); // Assurez-vous d'avoir ce modèle
const Result = require('./models/resultModel');
const Section = require('./models/Section'); // Assurez-vous que le chemin est correct
const Card = require('./models/cardModel'); // Assurez-vous que le modèle est correctement importé



dotenv.config();

const app = express();
const port = process.env.PORT || 443;
const secretKey = process.env.SECRET_KEY || 'your-secret-key';

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Servir les fichiers statiques

// Configuration de multer pour gérer les téléchargements de fichiers

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Dossier où stocker les images sur le serveur
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // Nom du fichier d'origine
  }
});

const upload = multer({
  dest: './public/uploads/' // Définir un dossier temporaire pour le stockage des fichiers téléchargés
});
// Enregistrement de l'utilisateur
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Connexion de l'utilisateur
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});




// Endpoint pour récupérer toutes les images
app.get('/api/images', async (req, res) => {
  try {
    const images = await Image.find();
    res.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Endpoint pour l'upload d'une image (authentifié)
app.post('/api/images/upload', upload.single('image'), async (req, res) => {
  try {
    const { filename, mimetype, size } = req.file;

    // Déplacer le fichier téléchargé vers le dossier uploads
    await fs.rename(req.file.path, path.join('./public/uploads', filename));

    res.status(201).send({ message: 'Image uploaded successfully' });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).send({ error: 'Upload failed' });
  }
});

// Endpoint pour supprimer une image (authentifié)
app.delete('/api/images/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid image ID' });
    }

    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    await Image.findByIdAndDelete(id);
    res.sendStatus(204);
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: 'Error deleting image' });
  }
});



app.get('/api/sections', async (req, res) => {
  try {
    const sections = await Section.find();
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/sections', async (req, res) => {
  const { title, content } = req.body;

  const newSection = new Section({
    title,
    content
  });

  try {
    const savedSection = await newSection.save();
    res.json(savedSection);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/sections/:id', async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    section.content = req.body.content;
    const updatedSection = await section.save();
    res.json(updatedSection);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/sections/:id', async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    await section.remove();
    res.json({ message: 'Section deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});




app.get('/api/results', async (req, res) => {
  try {
    const results = await Result.find();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/results', async (req, res) => {
  const { successRate, date, mentions } = req.body;

  const newResult = new Result({
    successRate,
    date,
    mentions
  });

  try {
    const savedResult = await newResult.save();
    res.json(savedResult);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/results/:id', authenticateJWT, async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result) {
      console.error(`Result with ID ${req.params.id} not found.`);
      return res.status(404).json({ error: 'Result not found' });
    }

    await Result.deleteOne({ _id: req.params.id });
    console.log(`Result with ID ${req.params.id} deleted.`);
    res.json({ message: 'Result deleted' });
  } catch (error) {
    console.error('Error deleting result:', error);
    res.status(500).json({ error: 'Server error' });
  }
});





app.get('/api/cards', async (req, res) => {
  try {
    const cards = await Card.find();
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des cartes.' });
  }
});

app.post('/api/cards', authenticateJWT, upload.single('image'), async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.file ? req.file.path : null;

    const newCard = new Card({
      title,
      description,
      image,
    });

    const savedCard = await newCard.save();
    res.status(201).json(savedCard);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout de la carte.' });
  }
});

app.put('/api/cards/:id', authenticateJWT, upload.single('image'), async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.file ? req.file.path : req.body.image;

    const updatedCard = await Card.findByIdAndUpdate(
      req.params.id,
      { title, description, image },
      { new: true }
    );

    res.json(updatedCard);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la carte.' });
  }
});

app.delete('/api/cards/:id', authenticateJWT, async (req, res) => {
  try {
    await Card.findByIdAndDelete(req.params.id);
    res.json({ message: 'Carte supprimée avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la carte.' });
  }
});





// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'An unexpected error occurred!' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
