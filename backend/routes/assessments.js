const express = require('express');
const Assessment = require('../models/Assessment');
const User = require('../models/User');

const router = express.Router();

// Create new assessment
router.post('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { testType, score, unit, videoUrl, notes } = req.body;
    
    if (!testType || !score || !unit) {
      return res.status(400).json({ error: 'Test type, score, and unit are required' });
    }

    const assessment = new Assessment({
      userId,
      testType,
      score,
      unit,
      videoUrl,
      notes,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await assessment.save();

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      assessment: {
        id: assessment._id,
        testType: assessment.testType,
        score: assessment.score,
        unit: assessment.unit,
        status: assessment.status,
        videoUrl: assessment.videoUrl,
        notes: assessment.notes,
        createdAt: assessment.createdAt
      }
    });
  } catch (error) {
    console.error('Assessment creation error:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

// Get user assessments
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, testType, page = 1, limit = 20 } = req.query;
    
    let query = { userId };
    
    if (status) {
      query.status = status;
    }
    
    if (testType) {
      query.testType = testType;
    }

    const skip = (page - 1) * limit;
    
    const [assessments, total] = await Promise.all([
      Assessment.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Assessment.countDocuments(query)
    ]);

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
        notes: assessment.notes,
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
    console.error('Assessments fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

// Get assessment details
router.get('/:id', async (req, res) => {
  try {
    const assessmentId = req.params.id;
    const userId = req.user.userId;
    
    const assessment = await Assessment.findById(assessmentId);
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    // Check if user owns this assessment or is admin/official
    if (assessment.userId.toString() !== userId && !['admin', 'official'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      assessment: {
        id: assessment._id,
        userId: assessment.userId,
        testType: assessment.testType,
        score: assessment.score,
        unit: assessment.unit,
        status: assessment.status,
        verifiedBy: assessment.verifiedBy,
        verifiedAt: assessment.verifiedAt,
        videoUrl: assessment.videoUrl,
        notes: assessment.notes,
        createdAt: assessment.createdAt,
        updatedAt: assessment.updatedAt
      }
    });
  } catch (error) {
    console.error('Assessment fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
});

// Update assessment
router.put('/:id', async (req, res) => {
  try {
    const assessmentId = req.params.id;
    const userId = req.user.userId;
    const updates = req.body;
    
    const assessment = await Assessment.findById(assessmentId);
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    // Check if user owns this assessment or is admin/official
    if (assessment.userId.toString() !== userId && !['admin', 'official'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Only allow certain fields to be updated
    const allowedUpdates = ['score', 'unit', 'videoUrl', 'notes'];
    const updateData = {};
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });
    
    updateData.updatedAt = new Date();
    
    const updatedAssessment = await Assessment.findByIdAndUpdate(
      assessmentId,
      { $set: updateData },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Assessment updated successfully',
      assessment: {
        id: updatedAssessment._id,
        testType: updatedAssessment.testType,
        score: updatedAssessment.score,
        unit: updatedAssessment.unit,
        status: updatedAssessment.status,
        verifiedBy: updatedAssessment.verifiedBy,
        verifiedAt: updatedAssessment.verifiedAt,
        videoUrl: updatedAssessment.videoUrl,
        notes: updatedAssessment.notes,
        createdAt: updatedAssessment.createdAt,
        updatedAt: updatedAssessment.updatedAt
      }
    });
  } catch (error) {
    console.error('Assessment update error:', error);
    res.status(500).json({ error: 'Failed to update assessment' });
  }
});

// Delete assessment
router.delete('/:id', async (req, res) => {
  try {
    const assessmentId = req.params.id;
    const userId = req.user.userId;
    
    const assessment = await Assessment.findById(assessmentId);
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    // Check if user owns this assessment or is admin
    if (assessment.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await Assessment.findByIdAndDelete(assessmentId);

    res.json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    console.error('Assessment deletion error:', error);
    res.status(500).json({ error: 'Failed to delete assessment' });
  }
});

// Verify assessment (for officials/admins)
router.put('/:id/verify', async (req, res) => {
  try {
    const assessmentId = req.params.id;
    const { verified, notes } = req.body;
    
    // Check if user has permission
    if (!['admin', 'official'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const assessment = await Assessment.findById(assessmentId);
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    const updatedAssessment = await Assessment.findByIdAndUpdate(
      assessmentId,
      {
        status: verified ? 'verified' : 'rejected',
        verifiedBy: verified ? req.user.userId : null,
        verifiedAt: verified ? new Date() : null,
        verificationNotes: notes || '',
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      message: `Assessment ${verified ? 'verified' : 'rejected'} successfully`,
      assessment: {
        id: updatedAssessment._id,
        status: updatedAssessment.status,
        verifiedBy: updatedAssessment.verifiedBy,
        verifiedAt: updatedAssessment.verifiedAt,
        verificationNotes: updatedAssessment.verificationNotes
      }
    });
  } catch (error) {
    console.error('Assessment verification error:', error);
    res.status(500).json({ error: 'Failed to verify assessment' });
  }
});

module.exports = router;