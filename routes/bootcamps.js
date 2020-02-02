const express = require('express');
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp
} = require('../controllers/bootcamps');
const router = express.Router();
router
  .route('/')
  .get(getBootcamps)
  .post(createBootcamp);
router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);
// ROUTES
// router.get('/', (req, res) => {
// res.send('<h1>Hello from express</h1>');
// res.sendStatus(400);
// res.status(400).json({ success: false });
// res.status(200).json({ success: true, data: { id: 1, name: 'Nanda Gopal' } });
// });
// router.get('/:id', (req, res) => {

// });
// router.post('/', (req, res) => {

// });
// router.put('/:id', (req, res) => {

// });
// router.delete('/:id', (req, res) => {

// });
module.exports = router;
