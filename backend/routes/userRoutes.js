import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import authMiddleware from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -verificationToken');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Verify email
router.get('/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find and update user
        const user = await User.findOne({
            email: decoded.email,
            verificationToken: token
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid verification token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired verification token' });
    }
});

// Register user
router.post('/register', async (req, res) => {
    try {
        const { name, email, username, password } = req.body;
        
        // Check if email exists
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Check if username exists
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const user = await User.create({
            name,
            email,
            username,
            password,
            isVerified: false // Set as unverified by default
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );
        
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            isVerified: false,
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        
        // Find user by email or username
        const user = await User.findOne({
            $or: [
                { email: identifier },
                { username: identifier }
            ]
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (await user.matchPassword(password)) {
            // Generate JWT token
            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                isVerified: user.isVerified,
                token
            });
        }   
        
        return res.status(401).json({ message: 'Invalid credentials' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})
export default router
