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

    data.password = await bcrypt.hash(data.password, 10);

    // let image = '';
    // image = req.file ? req.file.filename : null;

    const user = await User.create(data);
    
    res.status(201).json({
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
      { userId: user.id, userEmail: user.email, userRole: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "User logged in successfully", 
      token: token
    });    

  } catch (err) {
    return next(Boom.badImplementation());
  }
}

// Get user profile
const getProfile = async (req, res, next) => {
  try {
    const id = req.user;

    const user = await User.findOne({
      where: { id },
      attributes: {
        exclude: ['password', 'role']
      }
    });

    if (!user){
      return next(Boom.unauthorized('User does not logged in, please login'));
    }

    res.status(200).json({ 
      data: user 
    });

  } catch (err) {
    return next(Boom.badImplementation());
  }
}

// Update user profile
const updateProfile = async(req, res, next) => {
  try {
    const id = req.user;
    const data = req.body;

    const user = await User.findOne({ where: { id } });
    if (!user){
      return next(Boom.unauthorized('User does not logged in, please login'));
    }

    // // Update user image
    // let image = user.image ;
    // if(req.file){
    //   image = (image == null) ? req.file.filename : deleteUserImage(user.image);
    // }

    await User.update(data, { 
      where: { id } 
    });

    res.status(200).json({ 
      message: 'User profile updated successfully'
    });

  } catch (err) {
    return next(Boom.badImplementation());
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
    
    const user = await User.findOne({ where : { id } });
    if (!user) {
      return next(Boom.unauthorized('User does not logged in, please login'));
    }

    // Compare the db password to the user input old password
    const result = await bcrypt.compare(oldPass, user.password);
    
    // Set new hash password
    if(!result){
      return next(Boom.unauthorized(message.OLD_PASSWORD_NOT_MATCH));
    }

    if (!(newPass === conPass)){
      return next(Boom.badData(message.NEW_CONF_PASSWORD_NOT_MATCH));
    }

    const hashPassword = await bcrypt.hash(newPass, 10);

    await User.update({
      password: hashPassword, 
    }, { 
      where: { id },
    });

    res.status(200).json({ 
      message: "Password changed successfully",
    });

  } catch (err) {
    return next(Boom.badImplementation());
  }
}

// Delete user
const deleteUserDetails = async(req, res, next) => {
  try {
    let id = req.params;

    const user = await User.findOne({ where: { id } });
    if (!user){
      return next(Boom.notFound(message.RECORD_NOT_FOUND));
    } 

    // deleteUserImage(user.image);

    await User.destroy({ where: { id } });

    res.status(200).json({  
      message: 'User details deleted successfully',
    });

  } catch (err) {
    return next(Boom.badImplementation());
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

    res.status(200).json({
      data: users
    });

  } catch (err) {
    return next(Boom.badImplementation());
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