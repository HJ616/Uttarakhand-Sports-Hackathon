import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalAthletes: 0,
    totalAssessments: 0,
    verifiedAssessments: 0,
    flaggedAssessments: 0,
  });
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [performanceTrends, setPerformanceTrends] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState({
    verified: 0,
    pending: 0,
    flagged: 0,
  });

  // Mock data generator
  const generateMockData = () => {
    // Generate mock dashboard stats
    const mockStats = {
      totalAthletes: Math.floor(Math.random() * 5000) + 1000,
      totalAssessments: Math.floor(Math.random() * 8000) + 2000,
      verifiedAssessments: Math.floor(Math.random() * 6000) + 1500,
      flaggedAssessments: Math.floor(Math.random() * 200) + 50,
    };

    // Generate mock recent assessments
    const mockAssessments = Array.from({ length: 10 }, (_, index) => ({
      id: `assessment_${index + 1}`,
      athleteName: `Athlete ${index + 1}`,
      testType: ['Speed Test', 'Power Test', 'Strength Test', 'Flexibility Test'][Math.floor(Math.random() * 4)],
      score: Math.floor(Math.random() * 40) + 60, // 60-100%
      status: ['verified', 'pending', 'flagged'][Math.floor(Math.random() * 3)],
      date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      district: ['Dehradun', 'Haridwar', 'Nainital', 'Almora', 'Pithoragarh'][Math.floor(Math.random() * 5)],
      age: Math.floor(Math.random() * 10) + 15, // 15-25 years
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      videoUrl: `https://example.com/video_${index + 1}.mp4`,
      aiAnalysis: {
        poseAccuracy: Math.floor(Math.random() * 30) + 70,
        formQuality: Math.floor(Math.random() * 25) + 75,
        movementConsistency: Math.floor(Math.random() * 20) + 80,
        cheatProbability: Math.floor(Math.random() * 15),
      },
      verificationNotes: Math.random() > 0.7 ? 'Requires manual review' : '',
    }));

    // Generate mock performance trends
    const mockTrends = Array.from({ length: 6 }, (_, index) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index],
      averageScore: Math.floor(Math.random() * 20) + 70,
      verificationRate: Math.floor(Math.random() * 15) + 85,
      totalAssessments: Math.floor(Math.random() * 500) + 200,
    }));

    // Calculate verification status
    const verified = mockAssessments.filter(a => a.status === 'verified').length;
    const pending = mockAssessments.filter(a => a.status === 'pending').length;
    const flagged = mockAssessments.filter(a => a.status === 'flagged').length;

    setDashboardStats(mockStats);
    setRecentAssessments(mockAssessments);
    setPerformanceTrends(mockTrends);
    setVerificationStatus({ verified, pending, flagged });
  };

  // Fetch data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // In a real app, these would be actual API calls
      // const response = await axios.get('/api/dashboard/stats');
      // setDashboardStats(response.data);
      
      // For now, use mock data
      generateMockData();
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to mock data on error
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  // Fetch assessments with filters
  const fetchAssessments = async (filters = {}) => {
    try {
      // Mock API call
      // const response = await axios.get('/api/assessments', { params: filters });
      // return response.data;
      
      // Mock implementation
      return recentAssessments.filter(assessment => {
        if (filters.status && assessment.status !== filters.status) return false;
        if (filters.district && assessment.district !== filters.district) return false;
        if (filters.testType && assessment.testType !== filters.testType) return false;
        if (filters.minScore && assessment.score < filters.minScore) return false;
        return true;
      });
    } catch (error) {
      console.error('Error fetching assessments:', error);
      return [];
    }
  };

  // Update assessment status
  const updateAssessmentStatus = async (assessmentId, status, notes = '') => {
    try {
      // Mock API call
      // await axios.patch(`/api/assessments/${assessmentId}`, { status, notes });
      
      // Update local state
      setRecentAssessments(prev =>
        prev.map(assessment =>
          assessment.id === assessmentId
            ? { ...assessment, status, verificationNotes: notes }
            : assessment
        )
      );
      
      // Update verification counts
      setVerificationStatus(prev => {
        const updated = { ...prev };
        if (status === 'verified') updated.verified++;
        else if (status === 'pending') updated.pending++;
        else if (status === 'flagged') updated.flagged++;
        return updated;
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating assessment status:', error);
      return { success: false, error: error.message };
    }
  };

  // Generate reports
  const generateReport = async (type, filters = {}) => {
    try {
      // Mock API call
      // const response = await axios.post('/api/reports/generate', { type, filters });
      // return response.data;
      
      // Mock implementation
      return {
        type,
        generatedAt: new Date().toISOString(),
        data: recentAssessments.slice(0, 50), // Sample data
        summary: {
          totalAssessments: recentAssessments.length,
          verifiedCount: recentAssessments.filter(a => a.status === 'verified').length,
          flaggedCount: recentAssessments.filter(a => a.status === 'flagged').length,
          averageScore: Math.round(
            recentAssessments.reduce((sum, a) => sum + a.score, 0) / recentAssessments.length
          ),
        },
      };
    } catch (error) {
      console.error('Error generating report:', error);
      return null;
    }
  };

  // Export data
  const exportData = async (format, filters = {}) => {
    try {
      // Mock API call
      // const response = await axios.get('/api/export', {
      //   params: { format, ...filters },
      //   responseType: 'blob'
      // });
      // return response.data;
      
      // Mock implementation
      return new Blob([JSON.stringify(recentAssessments)], { type: 'application/json' });
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const value = {
    loading,
    dashboardStats,
    recentAssessments,
    performanceTrends,
    verificationStatus,
    fetchDashboardData,
    fetchAssessments,
    updateAssessmentStatus,
    generateReport,
    exportData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};