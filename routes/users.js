const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/users');

const User = require('../models/User');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// I WANT TO USE PROTECT AND AUTHORIZE('ADMIN') FOR ALL OF THESE ROUTES AND INSTEAD OF PUTTING IT INSIDE THE METHODS LIKE '.put(protect,authorize('publisher','admin'),...'  , I CAN ACTUALY PUT IT RIGHT ABOVE THE ROUTER FOR INSTANCE :-

// so whats going to happen is, anything below this will use protect and authorize('admin') middlewares and i dont actually have to stick it in each one of them!
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  // advancedResults ('model', 'populate') but i dont need a populate here,just the model of User would suffice
  .get(advancedResults(User), getUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

// dont forget to bring this into the server.js file also
module.exports = router;
