const UserService = require('../services/UserService');
const express = require('express');
const UserController = express.Router();
const verifyToken = require('../config/middleware');

UserController.get(`/`,verifyToken, async (req, res) => {
    try {
        const Users = await UserService.getAllUsers();
        res.status(200).json(Users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
UserController.get(`/:id`,verifyToken, async (req, res) => {
    try {
        const user = await UserService.getUserById(req.params.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
UserController.post(`/`, async (req, res) => {
    try {
        const user = await UserService.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
UserController.put(`/:id`, verifyToken, async (req, res) => {
    try {
        const user = await UserService.updateUser(req.params.id, req.body);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
UserController.delete(`/:id`,verifyToken, async (req, res) => {
    try {
        const user = await UserService.deleteUser(req.params.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);
UserController.post(`/auth/login`, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserService.loginUser(email, password);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);

UserController.post(`/auth/verify`, async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await UserService.verifyEmail(email, code);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);


module.exports = UserController;