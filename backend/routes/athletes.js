const express = require('express');
const Assessment = require('../models/Assessment');
const User = require('../models/User');

const router = express.Router();

// Get athlete profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        district: user.district,
        school: user.school,
        phone: user.phone,
        emergencyContact: user.emergencyContact,
        medicalConditions: user.medicalConditions,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update athlete profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates.password;
    delete updates.role;
    delete updates.isVerified;
    
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
      message: 'Profile updated successfully',
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        district: user.district,
        school: user.school,
        phone: user.phone,
        emergencyContact: user.emergencyContact,
        medicalConditions: user.medicalConditions,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get athlete assessments
router.get('/:id/assessments', async (req, res) => {
  try {
    const athleteId = req.params.id;
    const requestingUserId = req.user.userId;
    
    // Check if user is requesting their own data or is an admin/official
    if (athleteId !== requestingUserId && !['admin', 'official'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const assessments = await Assessment.find({ userId: athleteId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      assessments: assessments.map(assessment => ({
        id: assessment._id,
        testType: assessment.testType,
        score: assessment.score,
        unit: assessment.unit,
        status: assessment.status,
        verifiedBy: assessment.verifiedBy,
        verifiedAt: assessment.verifiedAt,
        videoUrl: assessment.videoUrl,
        createdAt: assessment.createdAt,
        updatedAt: assessment.updatedAt
      }))
    });
  } catch (error) {
    console.error('Assessments fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

// Get leaderboard data
router.get('/leaderboard', async (req, res) => {
  try {
    const { testType, district, school, limit = 10 } = req.query;
    
    let matchStage = { status: 'verified' };
    
    if (testType) {
      matchStage.testType = testType;
    }
    
    if (district) {
      matchStage.district = district;
    }
    
    if (school) {
      matchStage.school = school;
    }

    const leaderboard = await Assessment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$userId',
          totalScore: { $avg: '$score' },
          assessmentCount: { $sum: 1 },
          latestAssessment: { $max: '$createdAt' }
        }
      },
      { $sort: { totalScore: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$user.name',
          district: '$user.district',
          school: '$user.school',
          totalScore: 1,
          assessmentCount: 1,
          latestAssessment: 1
        }
      }
    ]);

    res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get all athletes (for officials/admins)
router.get('/', async (req, res) => {
  try {
    // Check if user has permission
    if (!['admin', 'official', 'coach'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { district, school, verified, search, page = 1, limit = 20 } = req.query;
    
    let query = { role: 'athlete' };
    
    if (district) {
      query.district = district;
    }
    
    if (school) {
      query.school = school;
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
    
    const [athletes, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      athletes: athletes.map(athlete => ({
        id: athlete._id,
        name: athlete.name,
        email: athlete.email,
        dateOfBirth: athlete.dateOfBirth,
        gender: athlete.gender,
        district: athlete.district,
        school: athlete.school,
        phone: athlete.phone,
        isVerified: athlete.isVerified,
        createdAt: athlete.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Athletes fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch athletes' });
  }
});

module.exports = router;