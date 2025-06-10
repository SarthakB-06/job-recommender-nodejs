import bcrypt from 'bcrypt';
import {User} from '../models/user.model.js'; 
import AsyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import savedJobModel from '../models/savedJob.model.js';
// import { getSavedJobs } from './job.controller.js';



export const userRegister = AsyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
   
    const existedUser = await User.findOne({ email });
    if (existedUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    
    const hashedPassword = bcrypt.hashSync(password, 10);

   
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: token, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export const userLogin = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const user = await User.findOne({email})
  
  if (!user ||!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  return res.status(200).json({ message: 'Login successful', token ,
    user:{
      id:user._id,
      name:user.name,
      email:user.email,
      resumeUploaded:user.resumeUploaded || false,
      resumeUrl:user.resumeUrl || '',
      parsedResumeData: user.parsedResumeData || null

    },
  });
})

export const userLogout = AsyncHandler(async (req,res)=>{
  res.clearCookie('token');
  return res.status(200).json({message:'Logout successful'})
})

export const getUserProfile = AsyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  
  // Return consistent format with success key and proper structure
  res.status(200).json({
    success: true,
    parsedResumeData: user.parsedResumeData || null,
    resumeUrl: user.resumeUrl || '',
    resumeUploaded: user.resumeUploaded || false,
    name: user.name,
    email: user.email,
    _id: user._id
  });
});

export const markResumeUploaded = AsyncHandler(async (req, res) => {
  const userId = req.user.id; 

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.resumeUploaded = true;
  await user.save();

  res.status(200).json({ 
    success:true,
    user:{
      _id: user._id,
      name: user.name,
      email: user.email,
      resumeUploaded: user.resumeUploaded || false,
      resumeUrl: user.resumeUrl || null,
      parsedResumeData: user.parsedResumeData || null
    }

   });
});

export const updateUserProfile = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email } = req.body;
    
    // Validation
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use by another account'
        });
      }
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

export const updateUserPassword = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update password'
    });
  }
});

export const updateUserPreferences = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { defaultLocation, salary, jobTypes, notifications, manualSkills } = req.body;
    
    // Create preferences object with provided data
    const preferences = {};
    if (defaultLocation !== undefined) preferences.defaultLocation = defaultLocation;
    if (salary !== undefined) preferences.salary = salary;
    if (jobTypes !== undefined) preferences.jobTypes = jobTypes;
    if (notifications !== undefined) preferences.notifications = notifications;
    
    // Update user document
    const updateData = { preferences };
    if (manualSkills !== undefined) {
      updateData.manualSkills = manualSkills;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
});

export const deleteUserAccount = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Delete user's saved jobs
    await savedJobModel.deleteMany({ user: userId });
    
    // Delete the user account
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
});
