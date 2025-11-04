// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// === CORS : Autorise le frontend sur localhost:3000 ===
app.use(cors({
  origin: 'http://localhost:3000'
}));

app.use(express.json());

// === OPTIONS DE CONNEXION (Mongoose 8+) ===
const mongooseOptions = {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000
};

// === CONNEXION À MONGODB ===
console.log('Connexion à MongoDB Atlas...');

mongoose.connect(process.env.MONGO_URI, mongooseOptions)
  .then(() => {
    console.log('MongoDB CONNECTÉ AVEC SUCCÈS !');

    // === MODÈLE TÂCHE ===
    const taskSchema = new mongoose.Schema({
      title: { type: String, required: true },
      completed: { type: Boolean, default: false }
    });
    const Task = mongoose.model('Task', taskSchema);

    // === ROUTES CRUD ===

    // GET : Toutes les tâches
    app.get('/api/tasks', async (req, res) => {
      try {
        const tasks = await Task.find();
        res.json(tasks);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // POST : Ajouter une tâche
    app.post('/api/tasks', async (req, res) => {
      try {
        const task = new Task(req.body);
        await task.save();
        res.json(task);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // PUT : Mettre à jour (cocher ou éditer)
    app.put('/api/tasks/:id', async (req, res) => {
      try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!task) return res.status(404).json({ error: 'Tâche non trouvée' });
        res.json(task);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // DELETE : Supprimer
    app.delete('/api/tasks/:id', async (req, res) => {
      try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: 'Tâche supprimée' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // === DÉMARRER LE SERVEUR ===
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`SERVEUR DÉMARRÉ → http://localhost:${PORT}`);
      console.log(`TEST API → http://localhost:${PORT}/api/tasks`);
    });
  })
  .catch(err => {
    console.error('ÉCHEC CONNEXION MONGODB :', err.message);
    process.exit(1);
  });