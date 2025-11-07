const express = require('express');
const User = require('../models/User');
const Assessment = require('../models/Assessment');

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get all users
router.get('/users', isAdmin, async (req, res) => {
  try {
    const { role, verified, search, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (verified !== undefined) {
      query.isVerified = verified === 'true';
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        district: user.district,
        school: user.school,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all assessments (admin view)
router.get('/assessments', isAdmin, async (req, res) => {
  try {
    const { status, testType, verified, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (testType) {
      query.testType = testType;
    }
    
    if (verified !== undefined) {
      if (verified === 'true') {
        query.status = 'verified';
      } else if (verified === 'false') {
        query.status = { $in: ['pending', 'rejected'] };
      }
    }

    const skip = (page - 1) * limit;
    
    const [assessments, total] = await Promise.all([
      Assessment.find(query)
        .populate('userId', 'name email district school')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Assessment.countDocuments(query)
    ]);

    res.json({
      success: true,
      assessments: assessments.map(assessment => ({
        id: assessment._id,
        userId: assessment.userId._id,
        userName: assessment.userId.name,
        userEmail: assessment.userId.email,
        userDistrict: assessment.userId.district,
        userSchool: assessment.userId.school,
        testType: assessment.testType,
        score: assessment.score,
        unit: assessment.unit,
        status: assessment.status,
        verifiedBy: assessment.verifiedBy,
        verifiedAt: assessment.verifiedAt,
        createdAt: assessment.createdAt,
        updatedAt: assessment.updatedAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin assessments fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

// Get admin analytics
router.get('/analytics', isAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalAthletes,
      totalOfficials,
      totalCoaches,
      totalAssessments,
      verifiedAssessments,
      pendingAssessments,
      rejectedAssessments,
      recentUsers,
      recentAssessments
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'athlete' }),
      User.countDocuments({ role: 'official' }),
      User.countDocuments({ role: 'coach' }),
      Assessment.countDocuments(),
      Assessment.countDocuments({ status: 'verified' }),
      Assessment.countDocuments({ status: 'pending' }),
      Assessment.countDocuments({ status: 'rejected' }),
      User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(5),
      Assessment.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    // Get user registration trends
    const userTrends = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    // Get assessment trends
    const assessmentTrends = await Assessment.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    res.json({
      success: true,
      analytics: {
        overview: {
          totalUsers,
          totalAthletes,
          totalOfficials,
          totalCoaches,
          totalAssessments,
          verifiedAssessments,
          pendingAssessments,
          rejectedAssessments
        },
        trends: {
          userRegistrations: userTrends,
          assessmentSubmissions: assessmentTrends
        },
        recentActivity: {
          users: recentUsers.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
          })),
          assessments: recentAssessments.map(assessment => ({
            id: assessment._id,
            userName: assessment.userId.name,
            testType: assessment.testType,
            score: assessment.score,
            status: assessment.status,
            createdAt: assessment.createdAt
          }))
        }
      }
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch admin analytics' });
  }
});

// Update user
router.put('/users/:id', isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates.password;
    delete updates._id;
    delete updates.createdAt;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        district: user.district,
        school: user.school,
        isVerified: user.isVerified,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/users/:id', isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Don't allow deleting yourself
    if (userId === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user's assessments
    await Assessment.deleteMany({ userId: userId });

    res.json({
      success: true,
      message: 'User and associated data deleted successfully'
    });
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;