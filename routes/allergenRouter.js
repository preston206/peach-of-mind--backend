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
router.get('/:pid/:cid', isLoggedIn, (req, res) => {
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
router.get('/:pid/:cid/:aid', isLoggedIn, (req, res) => {
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
router.post('/:pid/:cid', isLoggedIn, (req, res) => {

    const newAllergen = {};

    // building the newAllergen object
    newAllergen.allergen = req.body.allergen;
    newAllergen.reaction = req.body.reaction;
    newAllergen.details = req.body.details;

    Parent
        .findById(req.params.pid)
        .then(parent => {
            if (!parent) return res.status(404).json({ msg: "profile not found" });

            // use special Mongoose ID method to find a specific sub-doc
            // resource: http://mongoosejs.com/docs/subdocs.html
            const child = parent.children.id(req.params.cid);

            // then push the new allergen into the array of allergies
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
router.put('/:pid/:cid/:aid', isLoggedIn, (req, res) => {

    Parent
        .findById(req.params.pid)
        .then(parent => {
            if (!parent) return res.status(404).json({ msg: "profile not found" });

            const child = parent.children.id(req.params.cid);
            const allergen = child.allergies.id(req.params.aid);

            // update an existing allergen with new values
            allergen.set({
                allergen: req.body.allergen,
                reaction: req.body.reaction,
                details: req.body.details
            });
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
router.delete('/:pid/:cid/:aid', isLoggedIn, (req, res) => {
    Parent
        .findById(req.params.pid)
        .then(parent => {
            if (!parent) return res.status(404).json({ msg: "profile not found" });
            const child = parent.children.id(req.params.cid);

            // deleting an allergen and then saving the document
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