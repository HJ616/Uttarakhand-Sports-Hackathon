const express = require('express');
const Assessment = require('../models/Assessment');
const User = require('../models/User');

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    let query = {};
    
    // If not admin/official, only show user's own data
    if (!['admin', 'official'].includes(userRole)) {
      query.userId = userId;
    }

    const [
      totalAssessments,
      verifiedAssessments,
      pendingAssessments,
      rejectedAssessments,
      totalAthletes,
      recentAssessments
    ] = await Promise.all([
      Assessment.countDocuments(query),
      Assessment.countDocuments({ ...query, status: 'verified' }),
      Assessment.countDocuments({ ...query, status: 'pending' }),
      Assessment.countDocuments({ ...query, status: 'rejected' }),
      userRole === 'admin' || userRole === 'official' ? User.countDocuments({ role: 'athlete' }) : 0,
      Assessment.find(query)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'name email')
    ]);

    // Get test type distribution
    const testTypeDistribution = await Assessment.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$testType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        totalAssessments,
        verifiedAssessments,
        pendingAssessments,
        rejectedAssessments,
        totalAthletes: userRole === 'admin' || userRole === 'official' ? totalAthletes : undefined,
        verificationRate: totalAssessments > 0 ? Math.round((verifiedAssessments / totalAssessments) * 100) : 0,
        testTypeDistribution: testTypeDistribution.map(item => ({
          testType: item._id,
          count: item.count
        })),
        recentAssessments: recentAssessments.map(assessment => ({
          id: assessment._id,
          testType: assessment.testType,
          score: assessment.score,
          unit: assessment.unit,
          status: assessment.status,
          userName: assessment.userId.name,
          createdAt: assessment.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
  }
});

// Get performance trends
router.get('/trends', async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { testType, timeRange = '30d' } = req.query;
    
    let query = {};
    
    // If not admin/official, only show user's own data
    if (!['admin', 'official'].includes(userRole)) {
      query.userId = userId;
    }
    
    if (testType) {
      query.testType = testType;
    }

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    query.createdAt = { $gte: startDate };

    // Get daily trends
    const dailyTrends = await Assessment.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            testType: '$testType'
          },
          avgScore: { $avg: '$score' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Get overall performance by test type
    const performanceByTestType = await Assessment.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$testType',
          avgScore: { $avg: '$score' },
          maxScore: { $max: '$score' },
          minScore: { $min: '$score' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      trends: {
        daily: dailyTrends.map(item => ({
          date: item._id.date,
          testType: item._id.testType,
          avgScore: Math.round(item.avgScore * 100) / 100,
          count: item.count
        })),
        byTestType: performanceByTestType.map(item => ({
          testType: item._id,
          avgScore: Math.round(item.avgScore * 100) / 100,
          maxScore: item.maxScore,
          minScore: item.minScore,
          count: item.count
        }))
      }
    });
  } catch (error) {
    console.error('Performance trends error:', error);
    res.status(500).json({ error: 'Failed to fetch performance trends' });
  }
});

// Get performance comparisons
router.get('/comparisons', async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { testType, compareBy = 'district' } = req.query;
    
    let query = { status: 'verified' };
    
    if (testType) {
      query.testType = testType;
    }

    let groupByField;
    switch (compareBy) {
      case 'district':
        groupByField = '$district';
        break;
      case 'school':
        groupByField = '$school';
        break;
      case 'gender':
        groupByField = '$gender';
        break;
      case 'age':
        groupByField = { $floor: { $divide: [{ $subtract: [new Date(), '$dateOfBirth'] }, 31536000000] } };
        break;
      default:
        groupByField = '$district';
    }

    const comparisons = await Assessment.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: groupByField,
          avgScore: { $avg: '$score' },
          maxScore: { $max: '$score' },
          minScore: { $min: '$score' },
          count: { $sum: 1 }
        }
      },
      { $sort: { avgScore: -1 } }
    ]);

    res.json({
      success: true,
      comparisons: comparisons.map(item => ({
        category: item._id,
        avgScore: Math.round(item.avgScore * 100) / 100,
        maxScore: item.maxScore,
        minScore: item.minScore,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('Performance comparisons error:', error);
    res.status(500).json({ error: 'Failed to fetch performance comparisons' });
  }
});

// Export analytics data
router.get('/export', async (req, res) => {
  try {
    const userRole = req.user.role;
    
    // Check if user has permission
    if (!['admin', 'official'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { format = 'json', dateFrom, dateTo } = req.query;
    
    let query = {};
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo);
      }
    }

    const assessments = await Assessment.find(query)
      .populate('userId', 'name email district school')
      .sort({ createdAt: -1 });

    const exportData = assessments.map(assessment => ({
      id: assessment._id,
      athleteName: assessment.userId.name,
      athleteEmail: assessment.userId.email,
      district: assessment.userId.district,
      school: assessment.userId.school,
      testType: assessment.testType,
      score: assessment.score,
      unit: assessment.unit,
      status: assessment.status,
      verifiedBy: assessment.verifiedBy,
      verifiedAt: assessment.verifiedAt,
      createdAt: assessment.createdAt,
      updatedAt: assessment.updatedAt
    }));

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = Object.keys(exportData[0] || {}).join(',');
      const csvRows = exportData.map(row => Object.values(row).join(','));
      const csvContent = [csvHeaders, ...csvRows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics-export.csv');
      res.send(csvContent);
    } else {
      res.json({
        success: true,
        data: exportData,
        total: exportData.length
      });
    }
  } catch (error) {
    console.error('Analytics export error:', error);
    res.status(500).json({ error: 'Failed to export analytics data' });
  }
});

module.exports = router;