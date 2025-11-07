import { Platform, Dimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';

class PerformanceOptimizer {
  constructor() {
    this.deviceSpecs = null;
    this.optimizationLevel = 'medium';
    this.cacheSize = 50;
    this.frameRate = 30;
    this.resolution = 'medium';
    this.compressionQuality = 0.8;
    this.isLowEndDevice = false;
    this.networkQuality = 'good';
    this.batteryLevel = 1.0;
    this.memoryPressure = false;
    
    this.initialize();
  }

  async initialize() {
    try {
      await this.analyzeDeviceCapabilities();
      this.setupOptimizationStrategy();
      this.setupMemoryMonitoring();
      this.setupBatteryMonitoring();
      
      console.log('Performance optimizer initialized:', {
        optimizationLevel: this.optimizationLevel,
        isLowEndDevice: this.isLowEndDevice,
        networkQuality: this.networkQuality,
      });
    } catch (error) {
      console.error('Performance optimizer initialization error:', error);
    }
  }

  async analyzeDeviceCapabilities() {
    try {
      const specs = {
        platform: Platform.OS,
        version: Platform.Version,
        deviceType: await DeviceInfo.getDeviceType(),
        manufacturer: await DeviceInfo.getManufacturer(),
        model: await DeviceInfo.getModel(),
        totalMemory: await DeviceInfo.getTotalMemory(),
        freeMemory: await DeviceInfo.getFreeDiskStorage(),
        batteryLevel: await DeviceInfo.getBatteryLevel(),
        isEmulator: await DeviceInfo.isEmulator(),
        screenSize: Dimensions.get('window'),
      };

      this.deviceSpecs = specs;
      
      // Determine if device is low-end
      this.isLowEndDevice = this.isDeviceLowEnd(specs);
      
      // Set optimization level based on device specs
      this.optimizationLevel = this.determineOptimizationLevel(specs);
      
      console.log('Device capabilities analyzed:', specs);
    } catch (error) {
      console.error('Device analysis error:', error);
      this.isLowEndDevice = true; // Conservative assumption
      this.optimizationLevel = 'high';
    }
  }

  isDeviceLowEnd(specs) {
    // Determine if device is low-end based on specs
    const lowMemoryThreshold = 2 * 1024 * 1024 * 1024; // 2GB in bytes
    const isLowMemory = specs.totalMemory < lowMemoryThreshold;
    const isOldAndroid = specs.platform === 'android' && specs.version < 28;
    const isSmallScreen = specs.screenSize.width < 360 || specs.screenSize.height < 640;
    
    return isLowMemory || isOldAndroid || isSmallScreen;
  }

  determineOptimizationLevel(specs) {
    if (this.isLowEndDevice) return 'high';
    if (specs.totalMemory > 4 * 1024 * 1024 * 1024) return 'low'; // 4GB+
    return 'medium';
  }

  setupOptimizationStrategy() {
    switch (this.optimizationLevel) {
      case 'high':
        this.applyHighOptimizations();
        break;
      case 'medium':
        this.applyMediumOptimizations();
        break;
      case 'low':
        this.applyLowOptimizations();
        break;
    }
  }

  applyHighOptimizations() {
    // Aggressive optimizations for low-end devices
    this.cacheSize = 20;
    this.frameRate = 15;
    this.resolution = 'low';
    this.compressionQuality = 0.6;
    this.disableAdvancedFeatures();
  }

  applyMediumOptimizations() {
    // Balanced optimizations for mid-range devices
    this.cacheSize = 50;
    this.frameRate = 24;
    this.resolution = 'medium';
    this.compressionQuality = 0.8;
    this.limitAdvancedFeatures();
  }

  applyLowOptimizations() {
    // Minimal optimizations for high-end devices
    this.cacheSize = 100;
    this.frameRate = 30;
    this.resolution = 'high';
    this.compressionQuality = 0.9;
    this.enableAllFeatures();
  }

  disableAdvancedFeatures() {
    // Disable resource-intensive features on low-end devices
    this.features = {
      realTimePoseDetection: false,
      highQualityVideo: false,
      advancedAIAnalysis: false,
      realTimeFeedback: false,
      detailedVisualization: false,
      backgroundProcessing: false,
      cloudSync: false,
      analytics: false,
    };
  }

  limitAdvancedFeatures() {
    // Limit features on medium-end devices
    this.features = {
      realTimePoseDetection: true,
      highQualityVideo: false,
      advancedAIAnalysis: true,
      realTimeFeedback: true,
      detailedVisualization: true,
      backgroundProcessing: true,
      cloudSync: true,
      analytics: true,
    };
  }

  enableAllFeatures() {
    // Enable all features on high-end devices
    this.features = {
      realTimePoseDetection: true,
      highQualityVideo: true,
      advancedAIAnalysis: true,
      realTimeFeedback: true,
      detailedVisualization: true,
      backgroundProcessing: true,
      cloudSync: true,
      analytics: true,
    };
  }

  setupMemoryMonitoring() {
    // Set up memory pressure monitoring
    this.memoryCheckInterval = setInterval(() => {
      this.checkMemoryPressure();
    }, 30000); // Check every 30 seconds
  }

  setupBatteryMonitoring() {
    // Set up battery level monitoring
    this.batteryCheckInterval = setInterval(() => {
      this.checkBatteryLevel();
    }, 60000); // Check every minute
  }

  checkMemoryPressure() {
    // Check for memory pressure and adjust accordingly
    if (this.isLowEndDevice) {
      this.memoryPressure = true;
      this.reduceMemoryUsage();
    }
  }

  checkBatteryLevel() {
    // Check battery level and optimize accordingly
    DeviceInfo.getBatteryLevel().then(level => {
      this.batteryLevel = level;
      
      if (level < 0.2) {
        this.applyBatteryOptimizations();
      } else if (level < 0.5) {
        this.applyModerateBatteryOptimizations();
      }
    });
  }

  reduceMemoryUsage() {
    // Reduce memory usage when under pressure
    this.cacheSize = Math.max(10, this.cacheSize - 10);
    this.compressionQuality = Math.max(0.5, this.compressionQuality - 0.1);
    
    // Clear non-essential caches
    this.clearNonEssentialCaches();
  }

  applyBatteryOptimizations() {
    // Aggressive battery optimizations
    this.frameRate = Math.max(10, this.frameRate - 5);
    this.disableBackgroundProcessing();
    this.reduceProcessingFrequency();
  }

  applyModerateBatteryOptimizations() {
    // Moderate battery optimizations
    this.frameRate = Math.max(15, this.frameRate - 3);
    this.limitBackgroundProcessing();
  }

  disableBackgroundProcessing() {
    this.features.backgroundProcessing = false;
  }

  limitBackgroundProcessing() {
    // Reduce background processing frequency
    this.backgroundProcessingInterval = 30000; // 30 seconds
  }

  reduceProcessingFrequency() {
    // Reduce frequency of resource-intensive operations
    this.processingInterval = 10000; // 10 seconds
  }

  clearNonEssentialCaches() {
    // Clear caches that can be rebuilt
    if (global.videoCache) {
      global.videoCache.clearNonEssential();
    }
    
    if (global.analysisCache) {
      global.analysisCache.clearOldEntries();
    }
  }

  // Video optimization methods
  getOptimalVideoSettings() {
    return {
      frameRate: this.frameRate,
      resolution: this.getResolution(),
      compressionQuality: this.compressionQuality,
      videoBitrate: this.getVideoBitrate(),
      audioBitrate: this.getAudioBitrate(),
      codec: this.getOptimalCodec(),
    };
  }

  getResolution() {
    const resolutions = {
      low: { width: 320, height: 240 },
      medium: { width: 640, height: 480 },
      high: { width: 1280, height: 720 },
    };
    
    return resolutions[this.resolution];
  }

  getVideoBitrate() {
    const bitrates = {
      low: 500000, // 500 kbps
      medium: 1000000, // 1 Mbps
      high: 2000000, // 2 Mbps
    };
    
    return bitrates[this.resolution];
  }

  getAudioBitrate() {
    return 64000; // 64 kbps for all levels
  }

  getOptimalCodec() {
    return this.isLowEndDevice ? 'baseline' : 'main';
  }

  // AI/ML optimization methods
  getOptimalAIModelSettings() {
    return {
      modelSize: this.getModelSize(),
      inferenceFrequency: this.getInferenceFrequency(),
      batchSize: this.getBatchSize(),
      precision: this.getModelPrecision(),
      useQuantization: this.shouldUseQuantization(),
    };
  }

  getModelSize() {
    return this.isLowEndDevice ? 'small' : 'medium';
  }

  getInferenceFrequency() {
    const frequencies = {
      high: 1000, // 1 second
      medium: 500, // 0.5 seconds
      low: 200, // 0.2 seconds
    };
    
    return frequencies[this.optimizationLevel];
  }

  getBatchSize() {
    return this.isLowEndDevice ? 1 : 4;
  }

  getModelPrecision() {
    return this.isLowEndDevice ? 'float16' : 'float32';
  }

  shouldUseQuantization() {
    return this.isLowEndDevice;
  }

  // Network optimization methods
  async checkNetworkQuality() {
    try {
      // Simple network quality check
      const startTime = Date.now();
      const response = await fetch('https://www.google.com/generate_204');
      const endTime = Date.now();
      
      const latency = endTime - startTime;
      
      if (latency < 100) {
        this.networkQuality = 'excellent';
      } else if (latency < 300) {
        this.networkQuality = 'good';
      } else if (latency < 1000) {
        this.networkQuality = 'poor';
      } else {
        this.networkQuality = 'very-poor';
      }
      
      return this.networkQuality;
    } catch (error) {
      this.networkQuality = 'offline';
      return this.networkQuality;
    }
  }

  getNetworkOptimizationSettings() {
    return {
      maxUploadSize: this.getMaxUploadSize(),
      compressionLevel: this.getCompressionLevel(),
      chunkSize: this.getChunkSize(),
      retryAttempts: this.getRetryAttempts(),
      timeout: this.getNetworkTimeout(),
      useCompression: this.shouldUseCompression(),
    };
  }

  getMaxUploadSize() {
    const sizes = {
      excellent: 50 * 1024 * 1024, // 50MB
      good: 20 * 1024 * 1024, // 20MB
      poor: 5 * 1024 * 1024, // 5MB
      'very-poor': 1 * 1024 * 1024, // 1MB
      offline: 0,
    };
    
    return sizes[this.networkQuality] || sizes['poor'];
  }

  getCompressionLevel() {
    const levels = {
      excellent: 0,
      good: 1,
      poor: 2,
      'very-poor': 3,
      offline: 0,
    };
    
    return levels[this.networkQuality] || levels['poor'];
  }

  getChunkSize() {
    const sizes = {
      excellent: 1024 * 1024, // 1MB
      good: 512 * 1024, // 512KB
      poor: 256 * 1024, // 256KB
      'very-poor': 128 * 1024, // 128KB
      offline: 0,
    };
    
    return sizes[this.networkQuality] || sizes['poor'];
  }

  getRetryAttempts() {
    return this.networkQuality === 'offline' ? 0 : 3;
  }

  getNetworkTimeout() {
    const timeouts = {
      excellent: 30000, // 30 seconds
      good: 30000,
      poor: 60000, // 1 minute
      'very-poor': 120000, // 2 minutes
      offline: 0,
    };
    
    return timeouts[this.networkQuality] || timeouts['poor'];
  }

  shouldUseCompression() {
    return this.networkQuality !== 'excellent' && this.networkQuality !== 'offline';
  }

  // Cache optimization methods
  getCacheSettings() {
    return {
      maxSize: this.cacheSize,
      expirationTime: this.getCacheExpirationTime(),
      compressionEnabled: this.isCacheCompressionEnabled(),
      cleanupInterval: this.getCleanupInterval(),
    };
  }

  getCacheExpirationTime() {
    const times = {
      high: 5 * 60 * 1000, // 5 minutes
      medium: 15 * 60 * 1000, // 15 minutes
      low: 60 * 60 * 1000, // 1 hour
    };
    
    return times[this.optimizationLevel];
  }

  isCacheCompressionEnabled() {
    return this.isLowEndDevice;
  }

  getCleanupInterval() {
    const intervals = {
      high: 60 * 1000, // 1 minute
      medium: 5 * 60 * 1000, // 5 minutes
      low: 15 * 60 * 1000, // 15 minutes
    };
    
    return intervals[this.optimizationLevel];
  }

  // UI optimization methods
  getUIOptimizationSettings() {
    return {
      animationDuration: this.getAnimationDuration(),
      enableTransitions: this.shouldEnableTransitions(),
      maxListItems: this.getMaxListItems(),
      imageQuality: this.getImageQuality(),
      lazyLoading: this.shouldUseLazyLoading(),
      virtualScrolling: this.shouldUseVirtualScrolling(),
    };
  }

  getAnimationDuration() {
    const durations = {
      high: 0, // No animations
      medium: 200, // 200ms
      low: 300, // 300ms
    };
    
    return durations[this.optimizationLevel];
  }

  shouldEnableTransitions() {
    return !this.isLowEndDevice;
  }

  getMaxListItems() {
    const limits = {
      high: 10,
      medium: 50,
      low: 100,
    };
    
    return limits[this.optimizationLevel];
  }

  getImageQuality() {
    return this.isLowEndDevice ? 0.6 : 0.8;
  }

  shouldUseLazyLoading() {
    return true;
  }

  shouldUseVirtualScrolling() {
    return this.isLowEndDevice;
  }

  // Processing optimization methods
  getProcessingOptimizationSettings() {
    return {
      batchSize: this.getProcessingBatchSize(),
      parallelProcessing: this.shouldUseParallelProcessing(),
      priority: this.getProcessingPriority(),
      maxConcurrency: this.getMaxConcurrency(),
      queueSize: this.getQueueSize(),
    };
  }

  getProcessingBatchSize() {
    return this.isLowEndDevice ? 1 : 5;
  }

  shouldUseParallelProcessing() {
    return !this.isLowEndDevice;
  }

  getProcessingPriority() {
    return this.isLowEndDevice ? 'low' : 'normal';
  }

  getMaxConcurrency() {
    return this.isLowEndDevice ? 1 : 3;
  }

  getQueueSize() {
    return this.isLowEndDevice ? 5 : 20;
  }

  // Storage optimization methods
  getStorageOptimizationSettings() {
    return {
      maxLocalStorage: this.getMaxLocalStorage(),
      compressionRatio: this.getStorageCompressionRatio(),
      cleanupThreshold: this.getCleanupThreshold(),
      backupEnabled: this.isBackupEnabled(),
    };
  }

  getMaxLocalStorage() {
    const sizes = {
      high: 100 * 1024 * 1024, // 100MB
      medium: 500 * 1024 * 1024, // 500MB
      low: 1024 * 1024 * 1024, // 1GB
    };
    
    return sizes[this.optimizationLevel];
  }

  getStorageCompressionRatio() {
    return this.isLowEndDevice ? 0.7 : 0.9;
  }

  getCleanupThreshold() {
    return 0.8; // Clean up when 80% full
  }

  isBackupEnabled() {
    return !this.isLowEndDevice;
  }

  // Cleanup methods
  cleanup() {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
    }
    
    if (this.batteryCheckInterval) {
      clearInterval(this.batteryCheckInterval);
    }
    
    this.clearNonEssentialCaches();
  }

  // Get all optimization settings
  getAllOptimizationSettings() {
    return {
      deviceSpecs: this.deviceSpecs,
      optimizationLevel: this.optimizationLevel,
      isLowEndDevice: this.isLowEndDevice,
      video: this.getOptimalVideoSettings(),
      ai: this.getOptimalAIModelSettings(),
      network: this.getNetworkOptimizationSettings(),
      cache: this.getCacheSettings(),
      ui: this.getUIOptimizationSettings(),
      processing: this.getProcessingOptimizationSettings(),
      storage: this.getStorageOptimizationSettings(),
      features: this.features,
    };
  }
}

// Create singleton instance
const performanceOptimizer = new PerformanceOptimizer();

// Export functions
export const getOptimizationSettings = () => performanceOptimizer.getAllOptimizationSettings();
export const checkNetworkQuality = () => performanceOptimizer.checkNetworkQuality();
export const getOptimalVideoSettings = () => performanceOptimizer.getOptimalVideoSettings();
export const getOptimalAIModelSettings = () => performanceOptimizer.getOptimalAIModelSettings();

export default performanceOptimizer;