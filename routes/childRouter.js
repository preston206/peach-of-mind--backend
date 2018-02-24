const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// import auth check middleware
const { isLoggedIn } = require('../middleware/auth');

// importing model
const { Parent } = require('../models/Parent');


// // routes: // //

// get all child profiles for a specific user\parent
// param = parent ID
router.get('/:pid', isLoggedIn, (req, res) => {
    Parent
        .findById(req.params.pid)
        .then(parent => {
            if (!parent) return res.status(404).json({ msg: "profile not found" });
            return res.status(200).send(parent.children);
        })
        .catch(error => res.status(500).send(error));
});

// get single child profile
// param2 = child ID
router.get('/:pid/:cid', isLoggedIn, (req, res) => {
    Parent
        .findById(req.params.pid)
        .then(parent => {
            if (!parent) return res.status(404).json({ msg: "profile not found" });
            const child = parent.children.id(req.params.cid);
            return res.status(200).send(child);
        })
        .catch(error => res.status(500).send(error));
});

// add new child profile
router.post('/:pid', isLoggedIn, (req, res) => {

    const newChild = {};

    newChild.child = req.body.childName;

    return Parent
        .findByIdAndUpdate(req.params.pid, { $push: { children: newChild } }, { new: true })
        .exec()
        .then(result => {
            if (!result) return res.status(404).json({ msg: "profile not found" });
            return res.status(201).json({
                message: "child profile created",
                data: result.serialize()
            });
        })
        .catch(error => res.status(500).send(error));
});

// edit single child profile
router.put('/:pid/:cid', isLoggedIn, (req, res) => {
    Parent
        .findById(req.params.pid)
        .then(parent => {
            if (!parent) return res.status(404).json({ msg: "profile not found" });
            const child = parent.children.id(req.params.cid);
            child.set({ child: req.body.childName })
            return parent.save();
        })
        .then(result => {
            if (!result) return res.status(404).json({ msg: "child profile not found" });
            return res.status(200).json({
                message: "child profile updated",
                data: result.serialize()
            });
        })
        .catch(error => res.status(500).send(error));
});

// delete single child profile
router.delete('/:pid/:cid', isLoggedIn, (req, res) => {
    Parent
        .findById(req.params.pid)
        .then(parent => {
            if (!parent) return res.status(404).json({ msg: "profile not found" });
            parent.children.id(req.params.cid).remove();
            return parent.save();
        })
        .then(result => {
            if (!result) return res.status(404).json({ msg: "child profile not found" });
            res.status(200).json({
                message: "child profile has been deleted",
                data: result.serialize()
            });
        })
        .catch(error => res.status(500).send(error));
});

module.exports = router;