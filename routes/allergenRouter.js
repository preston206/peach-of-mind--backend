const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// import auth check middleware
const { isLoggedIn } = require('../middleware/auth');

// importing model
const { Parent } = require('../models/Parent');

// routes


// TODO: update endpoints to use names instead of IDs


// get all aergens for a specific child profile
router.get('/', (req, res) => {
    res.status(200).send("get all allergens");
});

// get single allergen - param = allergen ID
router.get('/:aid', isLoggedIn, (req, res) => {
    res.status(200).send("get one allergen");
});

// add new allergen object to the array
router.post('/', (req, res) => {

    const newAllergen = {};

    newAllergen.allergen = req.body.allergen;
    newAllergen.reaction = req.body.reaction;
    newAllergen.details = req.body.details;

    Parent
        .findById(req.body.pid)
        .then(parent => {
            if (!parent) res.status(400).json({ msg: "profile not found" });
            const findChild = parent.children.find(child => {
                // console.log("child: ", child);
                return child.id === req.body.cid;
            });
            // console.log("found child: ", findChild);
            findChild.allergies.push(newAllergen);
            return parent.save();
        })
        .then(result => {
            if (!result) return res.status(400).json({ msg: "child profile not found" });
            // console.log("result: ", result);
            return res.status(201).json({
                message: "allergen profile created",
                data: result.serialize()
            });
        })
        .catch(error => res.status(400).send(error));
});

// edit single allergen
router.put('/:aid', (req, res) => {

    Parent
        .findById(req.body.pid)
        .then(parent => {
            if (!parent) return res.status(400).json({ msg: "profile not found" });

            // using the find() array helper:
            // const findChild = parent.children.find(child => child.id === req.params.id);
            // const findAllergen = findChild.allergies.find(allergen => allergen.id === req.body.aid);

            // using a special mongoose method for targeting sub-docs:
            // resource: http://mongoosejs.com/docs/subdocs.html
            const child = parent.children.id(req.body.cid);
            const allergen = child.allergies.id(req.params.aid);
            console.log("allergen: ", allergen);
            allergen.set({
                allergen: req.body.allergen,
                reaction: req.body.reaction,
                details: req.body.details
            })
            console.log("updated allergen: ", allergen);
            return parent.save();
        })
        .then(result => {
            if (!result) return res.status(400).json({ msg: "allergen not found" });
            return res.status(201).json({
                message: "allergen profile updated",
                data: result.serialize()
            });
        })
        .catch(error => res.send(error));
});

// delete single allergen
router.delete('/:aid', (req, res) => {
    Parent
        .findById(req.body.pid)
        .then(parent => {
            if (!parent) return res.status(400).json({ msg: "profile not found" });
            const child = parent.children.id(req.body.cid);
            // console.log("child allergies: ", child.allergies);
            const allergen = child.allergies.id(req.params.aid).remove();
            // console.log("updated child allergies: ", child.allergies);
            return parent.save();
        })
        .then(result => {
            if (!result) return res.status(400).json({ msg: "allergen not found" });
            return res.status(200).json({
                message: "allergen profile has been deleted",
                data: result.serialize()
            });
        })
        .catch(error => res.send(error));
});

module.exports = router;