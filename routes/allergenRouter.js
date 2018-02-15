const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// import auth check middleware
const { isLoggedIn } = require('../middleware/auth');

// importing model
const { Parent } = require('../models/Parent');


// // routes: // //

// get all allergens for a specific child profile
// param1=parent id; param2=child id
router.get('/:pid/:cid', (req, res) => {
    Parent
        .findById(req.params.pid)
        .then(parent => {
            if (!parent) return res.status(404).json({ msg: "profile not found" });
            const child = parent.children.id(req.params.cid);
            return res.status(200).send(child.allergies);
        })
        .catch(error => res.status(500).send(error));
});

// get single allergen for a specific child
// param3 = allergen ID
router.get('/:pid/:cid/:aid', (req, res) => {
    Parent
        .findById(req.params.pid)
        .then(parent => {
            if (!parent) return res.status(404).json({ msg: "profile not found" });
            const child = parent.children.id(req.params.cid);
            return res.status(200).send(child.allergies.id(req.params.aid));
        })
        .catch(error => res.status(500).send(error));
});

// add new allergen for a specific child
router.post('/:pid/:cid', (req, res) => {

    const newAllergen = {};

    newAllergen.allergen = req.body.allergen;
    newAllergen.reaction = req.body.reaction;
    newAllergen.details = req.body.details;

    Parent
        .findById(req.params.pid)
        .then(parent => {
            if (!parent) return res.status(404).json({ msg: "profile not found" });

            // using the find() array helper to get the requested info:
            // const findChild = parent.children.find(child => {
            //     return child.id === req.body.cid;
            // });
            // findChild.allergies.push(newAllergen);

            // converting strategy to use Mongoose ID method to find a specific sub-doc:
            const child = parent.children.id(req.params.cid);
            child.allergies.push(newAllergen);
            return parent.save();
        })
        .then(result => {
            if (!result) return res.status(404).json({ msg: "child profile not found" });
            return res.status(201).json({
                message: "allergen profile created",
                data: result.serialize()
            });
        })
        .catch(error => res.status(500).send(error));
});

// edit single allergen
router.put('/:pid/:cid/:aid', (req, res) => {

    Parent
        .findById(req.params.pid)
        .then(parent => {
            if (!parent) return res.status(404).json({ msg: "profile not found" });

            // using the find() array helper:
            // const findChild = parent.children.find(child => child.id === req.params.id);
            // const findAllergen = findChild.allergies.find(allergen => allergen.id === req.body.aid);

            // using a special mongoose method find a specific sub-doc:
            // resource: http://mongoosejs.com/docs/subdocs.html
            const child = parent.children.id(req.params.cid);
            const allergen = child.allergies.id(req.params.aid);
            allergen.set({
                allergen: req.body.allergen,
                reaction: req.body.reaction,
                details: req.body.details
            })
            return parent.save();
        })
        .then(result => {
            if (!result) return res.status(404).json({ msg: "allergen not found" });
            return res.status(200).json({
                message: "allergen profile updated",
                data: result.serialize()
            });
        })
        .catch(error => res.status(500).send(error));
});

// delete single allergen
router.delete('/:pid/:cid/:aid', (req, res) => {
    Parent
        .findById(req.params.pid)
        .then(parent => {
            if (!parent) return res.status(404).json({ msg: "profile not found" });
            const child = parent.children.id(req.params.cid);
            const allergen = child.allergies.id(req.params.aid).remove();
            return parent.save();
        })
        .then(result => {
            if (!result) return res.status(404).json({ msg: "allergen not found" });
            return res.status(200).json({
                message: "allergen profile has been deleted",
                data: result.serialize()
            });
        })
        .catch(error => res.status(500).send(error));
});

module.exports = router;