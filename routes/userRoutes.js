const express = require('express');
const userController = require('./../controllers/userController');

const router = express.Router();

router
  .route('/') //home root
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id') //entire parent root ("/api/v1/users") +  :id
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
