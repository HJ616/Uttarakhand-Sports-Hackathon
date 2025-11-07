// Mock database service for development/testing
class MockDatabase {
  constructor() {
    this.collections = {
      users: new Map(),
      assessments: new Map(),
      videos: new Map()
    };
    this.nextIds = {
      users: 1,
      assessments: 1,
      videos: 1
    };
  }

  // Simulate MongoDB-like operations
  async connect() {
    console.log('Connected to Mock Database (development mode)');
    return Promise.resolve();
  }

  async disconnect() {
    console.log('Disconnected from Mock Database');
    return Promise.resolve();
  }

  // User operations
  async createUser(userData) {
    const id = this.nextIds.users++;
    const user = {
      _id: `user_${id}`,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.collections.users.set(user._id, user);
    return user;
  }

  async findUserById(id) {
    return this.collections.users.get(id) || null;
  }

  async findUserByEmail(email) {
    for (const user of this.collections.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async updateUser(id, updates) {
    const user = this.collections.users.get(id);
    if (!user) return null;
    
    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };
    this.collections.users.set(id, updatedUser);
    return updatedUser;
  }

  // Assessment operations
  async createAssessment(assessmentData) {
    const id = this.nextIds.assessments++;
    const assessment = {
      _id: `assessment_${id}`,
      ...assessmentData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.collections.assessments.set(assessment._id, assessment);
    return assessment;
  }

  async findAssessmentById(id) {
    return this.collections.assessments.get(id) || null;
  }

  async findAssessmentsByUserId(userId) {
    const assessments = [];
    for (const assessment of this.collections.assessments.values()) {
      if (assessment.userId === userId) {
        assessments.push(assessment);
      }
    }
    return assessments;
  }

  async updateAssessment(id, updates) {
    const assessment = this.collections.assessments.get(id);
    if (!assessment) return null;
    
    const updatedAssessment = {
      ...assessment,
      ...updates,
      updatedAt: new Date()
    };
    this.collections.assessments.set(id, updatedAssessment);
    return updatedAssessment;
  }

  // Video operations
  async createVideo(videoData) {
    const id = this.nextIds.videos++;
    const video = {
      _id: `video_${id}`,
      ...videoData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.collections.videos.set(video._id, video);
    return video;
  }

  async findVideoById(id) {
    return this.collections.videos.get(id) || null;
  }

  async findVideosByUserId(userId) {
    const videos = [];
    for (const video of this.collections.videos.values()) {
      if (video.userId === userId) {
        videos.push(video);
      }
    }
    return videos;
  }

  async updateVideo(id, updates) {
    const video = this.collections.videos.get(id);
    if (!video) return null;
    
    const updatedVideo = {
      ...video,
      ...updates,
      updatedAt: new Date()
    };
    this.collections.videos.set(id, updatedVideo);
    return updatedVideo;
  }

  // General query operations
  async find(collection, query = {}) {
    const results = [];
    const collectionData = this.collections[collection] || new Map();
    
    for (const item of collectionData.values()) {
      let matches = true;
      for (const [key, value] of Object.entries(query)) {
        if (item[key] !== value) {
          matches = false;
          break;
        }
      }
      if (matches) {
        results.push(item);
      }
    }
    
    return results;
  }

  // Mock connection state
  readyState = 1; // 1 = connected
}

module.exports = MockDatabase;