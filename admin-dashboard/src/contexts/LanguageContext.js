import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    athletes: 'Athletes',
    analytics: 'Analytics',
    reports: 'Reports',
    settings: 'Settings',
    logout: 'Logout',
    login: 'Login',
    
    // Dashboard
    welcome: 'Welcome',
    totalAthletes: 'Total Athletes',
    assessments: 'Assessments',
    videos: 'Videos',
    recentActivities: 'Recent Activities',
    
    // Athletes
    athleteManagement: 'Athlete Management',
    addAthlete: 'Add Athlete',
    editAthlete: 'Edit Athlete',
    viewProfile: 'View Profile',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    sport: 'Sport',
    age: 'Age',
    gender: 'Gender',
    district: 'District',
    
    // Analytics
    performanceAnalytics: 'Performance Analytics',
    sportWiseAnalytics: 'Sport-wise Analytics',
    districtWiseAnalytics: 'District-wise Analytics',
    ageWiseAnalytics: 'Age-wise Analytics',
    
    // Reports
    generateReport: 'Generate Report',
    exportPDF: 'Export PDF',
    exportExcel: 'Export Excel',
    
    // Common
    search: 'Search',
    filter: 'Filter',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Languages
    language: 'Language',
    english: 'English',
    hindi: 'हिंदी',
    
    // Sports
    athletics: 'Athletics',
    boxing: 'Boxing',
    wrestling: 'Wrestling',
    judo: 'Judo',
    swimming: 'Swimming',
    weightlifting: 'Weightlifting',
    gymnastics: 'Gymnastics',
    shooting: 'Shooting',
    archery: 'Archery',
    hockey: 'Hockey',
    football: 'Football',
    cricket: 'Cricket',
    volleyball: 'Volleyball',
    basketball: 'Basketball',
    tennis: 'Tennis',
    badminton: 'Badminton',
    tableTennis: 'Table Tennis',
    kabaddi: 'Kabaddi',
    khoKho: 'Kho-Kho',
    
    // Districts
    almora: 'Almora',
    bageshwar: 'Bageshwar',
    chamoli: 'Chamoli',
    champawat: 'Champawat',
    dehradun: 'Dehradun',
    haridwar: 'Haridwar',
    nainital: 'Nainital',
    pauriGarhwal: 'Pauri Garhwal',
    pithoragarh: 'Pithoragarh',
    rudraprayag: 'Rudraprayag',
    tehriGarhwal: 'Tehri Garhwal',
    udhamSinghNagar: 'Udham Singh Nagar',
    uttarkashi: 'Uttarkashi'
  },
  hi: {
    // Navigation
    dashboard: 'डैशबोर्ड',
    athletes: 'खिलाड़ी',
    analytics: 'एनालिटिक्स',
    reports: 'रिपोर्ट्स',
    settings: 'सेटिंग्स',
    logout: 'लॉगआउट',
    login: 'लॉगिन',
    
    // Dashboard
    welcome: 'स्वागत है',
    totalAthletes: 'कुल खिलाड़ी',
    assessments: 'मूल्यांकन',
    videos: 'वीडियो',
    recentActivities: 'हाल की गतिविधियाँ',
    
    // Athletes
    athleteManagement: 'खिलाड़ी प्रबंधन',
    addAthlete: 'खिलाड़ी जोड़ें',
    editAthlete: 'खिलाड़ी संपादित करें',
    viewProfile: 'प्रोफ़ाइल देखें',
    name: 'नाम',
    email: 'ईमेल',
    phone: 'फोन',
    sport: 'खेल',
    age: 'आयु',
    gender: 'लिंग',
    district: 'जिला',
    
    // Analytics
    performanceAnalytics: 'प्रदर्शन विश्लेषण',
    sportWiseAnalytics: 'खेल-वार विश्लेषण',
    districtWiseAnalytics: 'जिला-वार विश्लेषण',
    ageWiseAnalytics: 'आयु-वार विश्लेषण',
    
    // Reports
    generateReport: 'रिपोर्ट जनरेट करें',
    exportPDF: 'PDF एक्सपोर्ट करें',
    exportExcel: 'एक्सेल एक्सपोर्ट करें',
    
    // Common
    search: 'खोजें',
    filter: 'फिल्टर',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    view: 'देखें',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    
    // Languages
    language: 'भाषा',
    english: 'English',
    hindi: 'हिंदी',
    
    // Sports
    athletics: 'एथलेटिक्स',
    boxing: 'बॉक्सिंग',
    wrestling: 'कुश्ती',
    judo: 'जूडो',
    swimming: 'तैराकी',
    weightlifting: 'वेटलिफ्टिंग',
    gymnastics: 'जिम्नास्टिक्स',
    shooting: 'शूटिंग',
    archery: 'आर्चरी',
    hockey: 'हॉकी',
    football: 'फुटबॉल',
    cricket: 'क्रिकेट',
    volleyball: 'वॉलीबॉल',
    basketball: 'बास्केटबॉल',
    tennis: 'टेनिस',
    badminton: 'बैडमिंटन',
    tableTennis: 'टेबल टेनिस',
    kabaddi: 'कबड्डी',
    khoKho: 'खो-खो',
    
    // Districts
    almora: 'अल्मोड़ा',
    bageshwar: 'बागेश्वर',
    chamoli: 'चमोली',
    champawat: 'चंपावत',
    dehradun: 'देहरादून',
    haridwar: 'हरिद्वार',
    nainital: 'नैनीताल',
    pauriGarhwal: 'पौड़ी गढ़वाल',
    pithoragarh: 'पिथौरागढ़',
    rudraprayag: 'रुद्रप्रयाग',
    tehriGarhwal: 'टिहरी गढ़वाल',
    udhamSinghNagar: 'उधम सिंह नगर',
    uttarkashi: 'उत्तरकाशी'
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (language) => {
    if (translations[language]) {
      setCurrentLanguage(language);
      localStorage.setItem('language', language);
    }
  };

  const t = (key) => {
    return translations[currentLanguage][key] || key;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages: Object.keys(translations)
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;