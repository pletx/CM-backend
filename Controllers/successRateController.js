const SuccessRate = require('../models/SuccessRate');

// Contrôleur pour récupérer tous les taux de réussite
exports.getAllSuccessRates = (req, res) => {
  SuccessRate.find()
    .then(successRates => {
      res.json(successRates);
    })
    .catch(err => {
      console.error('Erreur lors de la récupération des taux de réussite :', err);
      res.status(500).json({ message: 'Erreur lors de la récupération des taux de réussite' });
    });
};

// Contrôleur pour ajouter un nouveau taux de réussite
exports.addSuccessRate = (req, res) => {
  const { successRate, date, mentions } = req.body;
  const newSuccessRate = new SuccessRate({
    successRate,
    date,
    mentions
  });

  newSuccessRate.save()
    .then(result => {
      res.status(201).json(result);
    })
    .catch(err => {
      console.error('Erreur lors de l\'ajout du taux de réussite :', err);
      res.status(500).json({ message: 'Erreur lors de l\'ajout du taux de réussite' });
    });
};

// Contrôleur pour supprimer un taux de réussite
exports.deleteSuccessRate = (req, res) => {
  const { id } = req.params;

  SuccessRate.findByIdAndDelete(id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      console.error('Erreur lors de la suppression du taux de réussite :', err);
      res.status(500).json({ message: 'Erreur lors de la suppression du taux de réussite' });
    });
};
