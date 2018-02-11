const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// import auth check middleware
const { isLoggedIn } = require('../middleware/auth');

// importing model
const { Parent } = require('../models/Parent');

// routes


// TODO: update endpoints to use names instead of IDs


// get all child profiles for a specific user\parent - param = parent ID
router.get('/:pid', (req, res) => {
    Parent
        .findById(req.params.pid)
        .then(parent => {
            if (!parent) return res.status(400).json({ msg: "profile not found" });
            return res.status(200).send(parent.children);
        })
        .catch(error => res.send(error));
});

// get single child profile - param2 = child ID
router.get('/:pid/:cid', (req, res) => {
    Parent
        .findById(req.params.pid)
        .then(parent => {
            if (!parent) return res.status(400).json({ msg: "profile not found" });
            const child = parent.children.id(req.params.cid);
            return res.status(200).send(child);
        })
        .catch(error => res.send(error));
});

// add new child profile
router.post('/', (req, res) => {
    console.log("parent id: ", req.body.pid);

    const newChild = {};
    const name = req.body.child;

    newChild.child = name;

    return Parent
        .findByIdAndUpdate(req.body.pid, { $push: { children: newChild } }, { new: true })
        .exec()
        .then(result => {
            if (!result) res.status(400).json({ msg: "profile not found" });
            return res.status(201).json({
                message: "child profile created",
                data: result.serialize()
            });
        })
        .catch(error => res.status(400).send(error));
});

// edit single child profile
router.put('/:cid', (req, res) => {
    Parent
        .findById(req.body.pid)
        .then(parent => {
            if (!parent) return res.status(400).json({ msg: "profile not found" });
            const child = parent.children.id(req.params.cid);
            console.log("child", child);
            child.set({ child: req.body.name })
            console.log("updated child", child);
            return parent.save();
        })
        .then(result => {
            if (!result) return res.status(400).json({ msg: "child profile not found" });
            return res.status(201).json({
                message: "child profile updated",
                data: result.serialize()
            });
        })
        .catch(error => res.send(error));
});

// delete single child profile
router.delete('/:cid', (req, res) => {
    Parent
        .findById(req.body.pid)
        .then(parent => {
            if (!parent) return res.status(400).json({ msg: "profile not found" });
            console.log("children", parent.children);
            parent.children.id(req.params.cid).remove();
            console.log("updated children", parent.children);
            return parent.save();
        })
        .then(result => {
            if (!result) return res.status(400).json({ msg: "child profile not found" });
            res.status(200).json({
                message: "child profile has been deleted",
                data: result.serialize()
            });
        })
        .catch(error => res.send(error));
});

module.exports = router;