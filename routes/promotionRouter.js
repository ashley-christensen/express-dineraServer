

const express = require('express');
const promotionRouter = express.Router();//instance of express.Router()

promotionRouter.route('/')
 .all((req, res, next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');//response will be sent in plain text in res body
  next();
 })
 .get((req, res) => {
  //app.all already set response status code and header
  res.end('Will send you promotion options to you');
 })
 .post((req, res) => {
  res.end(`Will add the promotion experience req.body.name: ${req.body.name} with description: ${req.body.description} `);
 })
 .put((req, res) => {
  res.statusCode = 403; //403 == Operation not supported 
  res.end('PUT operation not supported on /promotions');
 })
 .delete((req, res) => {
  res.end('Deleting all promotions experiences');
 });


promotionRouter.route('/:promotionId')
 .all((req, res, next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');//response will be sent in plain text in res body
  next();
 })
 .get((req, res) => {
  res.end(`Will send details of the promotion experience id: ${req.params.promotionId} to you`);
 })
 .post((req, res) => {
  res.statusCode = 403;//403 == operation not supported
  res.end(`POST operation is not supported on /promotions/${req.params.promotionId}`);
 })
 .put((req, res) => {
  res.write(`Updating the promotion: ${req.params.promotionId}\n`);
  res.end(`Will update the promotion ${req.body.name}
     with description ${req.body.description}`); //sent as JSON formatted body;
 })
 .delete((req, res) => {
  res.end(`Deleting promotion: ${req.params.promotionId}`);
 });

module.exports = promotionRouter;