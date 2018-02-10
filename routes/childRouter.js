const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// import auth check middleware
const isLoggedIn = require('../middleware/auth');

// importing model
const { Parent } = require('../models/Parent');

// routes
router.get('/', (req, res) => {
    res.status(200).send("get all children profiles");
});

router.get('/:id', (req, res) => {
    res.status(200).send("get one child profile");
});

router.post('/', (req, res) => {
    res.status(200).send("add one child profile");

    // const newParent = {
    //     email: req.body.email,
    //     username: req.body.username,
    //     password: req.body.password,
    //     children: [{
    //         name: req.body.child,
    //         allergies: [{
    //             name: req.body.allergen,
    //             reaction: req.body.reaction,
    //             details: req.body.details
    //         }]
    //     }]
    // };

    // return Parent
    //     .create(newParent)
    //     .then(profile => {
    //         console.log("creating: ", profile);
    //         res.status(201).json(profile)
    //     })
    //     .catch(error => console.log(error));
});

router.put('/:id', (req, res) => {
    res.status(200).send("edit child profile name");

    // let updateTheseFields = {
    //     email: req.body.email,
    //     username: req.body.username,
    //     password: req.body.password,
    //     children: [{
    //         name: req.body.child,
    //         allergies: [{
    //             name: req.body.allergen,
    //             reaction: req.body.reaction,
    //             details: req.body.details
    //         }]
    //     }]
    // };

    // return Parent
    //     .findByIdAndUpdate(req.params.id, { $set: updateTheseFields }, { new: true })
    //     .then(parent => {
    //         return res.status(200).json({
    //             message: "data has been updated",
    //             data: parent
    //         });
    //     })
    //     .catch(error => {
    //         return res.status(500).json({
    //             message: "server error"
    //         });
    //     });
});

router.delete('/:id', (req, res) => {

    res.status(200).send("delete one child profile");

        // console.log("deleting id: ", req.params.id);
    // return Parent
    //     .findOneAndRemove(req.params.id)
    //     .exec()
    //     .then(res.status(204).end())
    //     .catch(error => res.status(500).json({
    //         message: "server error"
    //     }));
});

module.exports = router;