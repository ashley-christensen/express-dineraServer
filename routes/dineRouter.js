//will handle /dines & /dines/:dineId

const express = require('express');
const dineRouter = express.Router();//instance of express.Router()

dineRouter.route('/')
 .all((req, res, next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');//response will be sent in plain text in res body
  next();
 })
 .get((req, res) => {
  //app.all already set response status code and header
  res.end('Will send you dining options to you');
 })
 .post((req, res) => {
  res.end(`Will add the Dine experience req.body.name: ${req.body.name} with description: ${req.body.description} `);
 })
 .put((req, res) => {
  res.statusCode = 403; //403 == Operation not supported 
  res.end('PUT operation not supported on /dines');
 })
 .delete((req, res) => {
  res.end('Deleting all dines experiences');
 });


dineRouter.route('/:dineId')
 .all((req, res, next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');//response will be sent in plain text in res body
  next();
 })
 .get((req, res) => {
  res.end(`Will send details of the dine experience id: ${req.params.dineId} to you`);
 })
 .post((req, res) => {
  res.statusCode = 403;//403 == operation not supported
  res.end(`POST operation is not supported on /dines/${req.params.dineId}`);
 })
 .put((req, res) => {
  res.write(`Updating the dine: ${req.params.dineId}\n`);
  res.end(`Will update the dine ${req.body.name}
     with description ${req.body.description}`); //sent as JSON formatted body;
 })
 .delete((req, res) => {
  res.end(`Deleting dine: ${req.params.dineId}`);
 });

module.exports = dineRouter;