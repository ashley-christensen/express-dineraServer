const express = require('express');
const Dine = require('../models/dine');

const dineRouter = express.Router();//instance of express.Router()

dineRouter.route('/')
    .get((req, res, next) => {
        Dine.find()
            .then(dines => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dines);//auto closes response stream, done need end()
            })
            .catch(err => next(err));//hands off error to overall handler in expres app.js
    })
    .post((req, res, next) => {
        Dine.create(req.body)
            .then(createdDine => {
                console.log('Dine Created', createdDine);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(createdDine);
            })
            .catch(err => next(err));
    })
    .put((req, res) => {
        res.statusCode = 403; //403 == Operation not supported 
        res.end('PUT operation not supported on /dines');
    })
    .delete((req, res, next) => {
        Dine.deleteMany()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });


dineRouter.route('/:dineId')
    .get((req, res, next) => {
        Dine.findById(req.params.dineId)//parses id requested by user/client
            .then(dine => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dine);
            })
            .catch(err => next(err));
    })
    .post((req, res) => {
        res.statusCode = 403;//403 == operation not supported
        res.end(`POST operation is not supported on /dines/${req.params.dineId}`);
    })
    .put((req, res, next) => {
        Dine.findByIdAndUpdate(req.params.dineId, {
            $set: req.body
        },
            { new: true }//returns updated document
        )
            .then(dine => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dine);//sends updated document 
            });
    })
    .delete((req, res, next) => {
        Dine.findByIdAndDelete(req.params.dineId)
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);//sends json data in response stream and closes response stream
            })
            .catch(err => next(err));
    });

dineRouter.route('/:dineId/comments')
    .get((req, res, next) => {
        Dine.findById(req.params.dineId)//API docs ==> this method makes most sense
            .then(dine => {
                if (dine) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dine.comments);
                } else {
                    err = new Error(`Dine experience ${req.params.dineId} not found`);
                    err.status = 404;
                    return next(err);//passes error to express error handler mechanism
                }
            })
            .catch(err => next(err));//hands off error to overall handler in expres app.js
    })
    .post((req, res, next) => {
        Dine.create(req.body)
            .then(createdDine => {
                console.log('Dine Created', createdDine);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(createdDine);
            })
            .catch(err => next(err));
    })
    .put((req, res) => {
        res.statusCode = 403; //403 == Operation not supported 
        res.end('PUT operation not supported on /dines');
    })
    .delete((req, res, next) => {
        Dine.deleteMany()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });


module.exports = dineRouter;