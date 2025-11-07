const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/videos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /mp4|mov|avi|mkv|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('video/');

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only video files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: fileFilter
});

// Upload video
router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { assessmentId, testType } = req.body;
    
    if (!assessmentId || !testType) {
      return res.status(400).json({ error: 'Assessment ID and test type are required' });
    }

    const videoData = {
      id: Date.now().toString(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      assessmentId: assessmentId,
      testType: testType,
      userId: req.user.userId,
      uploadedAt: new Date(),
      status: 'uploaded',
      analysisStatus: 'pending'
    };

    // In a real application, you'd save this to a database
    // For now, we'll store it in memory or a simple file
    const videosPath = path.join(__dirname, '../data/videos.json');
    let videos = [];
    
    if (fs.existsSync(videosPath)) {
      videos = JSON.parse(fs.readFileSync(videosPath, 'utf8'));
    }
    
    videos.push(videoData);
    fs.writeFileSync(videosPath, JSON.stringify(videos, null, 2));

    res.json({
      success: true,
      message: 'Video uploaded successfully',
      video: {
        id: videoData.id,
        filename: videoData.filename,
        originalName: videoData.originalName,
        size: videoData.size,
        assessmentId: videoData.assessmentId,
        testType: videoData.testType,
        uploadedAt: videoData.uploadedAt,
        status: videoData.status,
        analysisStatus: videoData.analysisStatus
      }
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

// Get video details
router.get('/:id', async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user.userId;
    
    const videosPath = path.join(__dirname, '../data/videos.json');
    let videos = [];
    
    if (fs.existsSync(videosPath)) {
      videos = JSON.parse(fs.readFileSync(videosPath, 'utf8'));
    }
    
    const video = videos.find(v => v.id === videoId);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    // Check if user owns this video or is admin/official
    if (video.userId !== userId && !['admin', 'official'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      video: {
        id: video.id,
        filename: video.filename,
        originalName: video.originalName,
        size: video.size,
        mimetype: video.mimetype,
        assessmentId: video.assessmentId,
        testType: video.testType,
        uploadedAt: video.uploadedAt,
        status: video.status,
        analysisStatus: video.analysisStatus,
        analysisResults: video.analysisResults || null
      }
    });
  } catch (error) {
    console.error('Video fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch video details' });
  }
});

// Request video analysis
router.post('/:id/analyze', async (req, res) => {
  try {
    const videoId = req.params.id;
    const { testType, parameters } = req.body;
    const userId = req.user.userId;
    
    const videosPath = path.join(__dirname, '../data/videos.json');
    let videos = [];
    
    if (fs.existsSync(videosPath)) {
      videos = JSON.parse(fs.readFileSync(videosPath, 'utf8'));
    }
    
    const video = videos.find(v => v.id === videoId);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    // Check if user owns this video
    if (video.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Mock analysis - in a real app, this would trigger ML processing
    const analysisResults = {
      testType: testType,
      score: Math.floor(Math.random() * 100) + 1,
      unit: 'points',
      confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
      details: {
        technique: 'Good form detected',
        timing: 'Optimal execution',
        recommendations: ['Continue practicing regularly', 'Focus on consistency']
      },
      analyzedAt: new Date()
    };
    
    // Update video with analysis results
    video.analysisStatus = 'completed';
    video.analysisResults = analysisResults;
    video.testType = testType;
    
    fs.writeFileSync(videosPath, JSON.stringify(videos, null, 2));

    res.json({
      success: true,
      message: 'Video analysis completed',
      videoId: videoId,
      analysisResults: analysisResults
    });
  } catch (error) {
    console.error('Video analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze video' });
  }
});

// Get analysis results
router.get('/:id/results', async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user.userId;
    
    const videosPath = path.join(__dirname, '../data/videos.json');
    let videos = [];
    
    if (fs.existsSync(videosPath)) {
      videos = JSON.parse(fs.readFileSync(videosPath, 'utf8'));
    }
    
    const video = videos.find(v => v.id === videoId);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    // Check if user owns this video or is admin/official
    if (video.userId !== userId && !['admin', 'official'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!video.analysisResults) {
      return res.status(404).json({ error: 'Analysis results not found' });
    }

    res.json({
      success: true,
      videoId: videoId,
      analysisResults: video.analysisResults
    });
  } catch (error) {
    console.error('Analysis results fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch analysis results' });
  }
});

module.exports = router;