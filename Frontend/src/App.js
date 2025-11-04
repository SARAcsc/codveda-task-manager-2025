import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [editingId, setEditingId] = useState(null);

  const API_URL = 'http://localhost:5000/api/tasks';

  // Charger les tâches
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setTasks(data);
  };

  // Ajouter / Modifier
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      await fetch(`${API_URL}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, completed: tasks.find(t => t._id === editingId).completed })
      });
      setEditingId(null);
    } else {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
    }
    setTitle('');
    fetchTasks();
  };

  // Supprimer
  const deleteTask = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchTasks();
  };

  // Cocher
  const toggleComplete = async (id, completed) => {
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !completed })
    });
    fetchTasks();
  };

  // Éditer
  const startEdit = (id, title) => {
    setEditingId(id);
    setTitle(title);
  };

  return (
    <div className="app">
      <div className="container">
        <h1>Task Manager</h1>

        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nouvelle tâche..."
          />
          <button type="submit">
            {editingId ? 'Modifier' : 'Ajouter'}
          </button>
        </form>

        <ul className="task-list">
          {tasks.map(task => (
            <li key={task._id} className={task.completed ? 'completed' : ''}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleComplete(task._id, task.completed)}
              />
              <span>{task.title}</span>
              <div className="actions">
                <button onClick={() => startEdit(task._id, task.title)}>Edit</button>
                <button onClick={() => deleteTask(task._id)} className="delete">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;