const express = require('express');
const router = express.Router();
const Todo = require('../models/todoModel');
const protect = require('../middleware/authMiddleware');

// Get all todos
router.get('/', protect, async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user.id });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create todo
router.post('/', protect, async (req, res) => {
    try {
        const { title, description } = req.body;
        const todo = await Todo.create({
            user: req.user.id,
            title,
            description
        });
        res.status(201).json(todo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update todo
router.put('/:id', protect, async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        if (todo.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedTodo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete todo
router.delete('/:id', protect, async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        if (todo.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await todo.deleteOne();
        res.json({ message: 'Todo removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
