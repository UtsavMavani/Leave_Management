const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const Boom = require('@hapi/boom');
const { message } = require('../utils/message');
const db = require('../database/config');
const User = db.users;

// Register user
const register = async (req, res, next) => {
  try {
    const data = req.body;

    const userExist = await User.findOne({ where: { email: data.email } });
    if(userExist){
      return next(Boom.badRequest(message.RECORD_ALREADY_EXIST));
    }

    if (data.password){
      data.password = await bcrypt.hash(data.password, 10);
    }

    // let image = '';
    // image = req.file ? req.file.filename : null;

    const user = await User.create(data);
    
    res.status(201).json({
      statusCode: 201,
      message: 'User created successfully',
      data: user
    });

  } catch (err) {
    return next(Boom.badData(err));
  }
}

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      return next(Boom.badRequest(message.EMAIL_PASSWORD_REQUIRED));
    }

    const user = await User.findOne({ where: { email } });

    if (!(user && (await bcrypt.compare(password, user.password)))) {
      return next(Boom.unauthorized(message.INVALID_CREDENTIALS));
    }

    // Create jwt token
    const token = jwt.sign(
      { userId: user.id, userEmail: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      statusCode: 200,
      message: "User logged in successfully", 
      token: token
    });    

  } catch (err) {
    return next(Boom.badData(err));
  }
}

// Get user profile
const getProfile = async (req, res, next) => {
  try {
    const id = req.user;

    const userProfile = await User.findOne({
      where: { id },
      attributes: {
        exclude: ['password', 'role']
      }
    });

    if(!userProfile){
      return next(Boom.notFound('User profile not found'));
    }

    res.status(200).json({ 
      statusCode: 200,
      data: userProfile 
    });

  } catch (err) {
    return next(Boom.badData(err));
  }
}

// Update user profile
const updateProfile = async(req, res, next) => {
  try {
    const id = req.user;
    const data = req.body;

    const userExist = await User.findOne({ where: { id } });
    if(!userExist){
      return next(Boom.notFound(message.RECORD_NOT_FOUND));
    }

    // // Update user image
    // let image = user.image ;
    // if(req.file){
    //   image = (image == null) ? req.file.filename : deleteUserImage(user.image);
    // }

    await User.update(data, { 
      where: { id } 
    });

    res.status(200).send({ 
      statusCode: 200, 
      message: 'User profile updated successfully'
    });

  } catch (err) {
    return next(Boom.badData(err));
  }
}

// Change user password
const changePassword = async (req, res, next) => {
  try {
    const { oldPass, newPass, conPass} = req.body;
    const id = req.user;

    if (!(oldPass && newPass && conPass)) {
      return next(Boom.badRequest(message.OLD_NEW_CONF_PASSWORD_REQUIRED));
    }
    
    const userExist = await User.findOne({ where : { id } });
    if(!userExist) {
      return next(Boom.unauthorized('User does not logged in, please login'));
    }

    // Compare the db password to the user input old password
    const result = await bcrypt.compare(oldPass, user.password);
    
    // Set new hash password
    if(result){
      if(!(newPass === conPass)){
        return next(Boom.badData(message.NEW_CONF_PASSWORD_NOT_MATCH));
      }

      const hashPassword = await bcrypt.hash(newPass, 10);

      await User.update({
        password: hashPassword, 
      }, { 
        where: { id },
      });

      res.status(200).send({ 
        statusCode: 200,
        message: "Password changed successfully",
      });

    } else {
      return next(Boom.unauthorized(message.OLD_PASSWORD_NOT_MATCH));
    }

  } catch (err) {
    return next(Boom.badData(err));
  }
}

// Delete user
const deleteUserDetails = async(req, res, next) => {
  try {
    let id = req.params;

    const userExist = await User.findOne({ where: { id } });
    if(!userExist){
      return next(Boom.notFound(message.RECORD_NOT_FOUND));
    } 

    // deleteUserImage(user.image);

    await User.destroy({ where: { id } });

    res.status(200).send({ 
      statusCode: 200, 
      message: 'User details deleted successfully',
    });

  } catch (err) {
    return next(Boom.badData(err));
  }
}

// Get all users
const getUsersList = async(req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ['password']
      }
    });
    
    if(!users.length){
      return next(Boom.notFound(message.RECORD_NOT_FOUND));
    }

    res.status(200).json({
      statusCode: 200,
      data: users
    });

  } catch (err) {
    return next(Boom.badData(err));
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deleteUserDetails,
  getUsersList
};