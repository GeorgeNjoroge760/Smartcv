let _lang = 'en';
let _translations = {};

const translations = {
  en: {
    dashboard: 'Dashboard', cvBuilder: 'CV Builder', coverLetter: 'Cover Letter',
    settings: 'Settings', jobMatch: 'Job Match', share: 'Share',
    fullName: 'Full Name', email: 'Email', phone: 'Phone', location: 'Location',
    linkedin: 'LinkedIn', portfolio: 'Portfolio', professionalTitle: 'Professional Title',
    careerSummary: 'Career Summary', personalInfo: 'Personal Information',
    professionalInfo: 'Professional Information', education: 'Education',
    experience: 'Work Experience', skills: 'Skills', additional: 'Additional',
    certifications: 'Certifications', languages: 'Languages', publications: 'Publications',
    volunteerWork: 'Volunteer Work', referees: 'Referees',
    add: 'Add', remove: 'Remove', save: 'Save', cancel: 'Cancel',
    downloadPdf: 'PDF', downloadDocx: 'DOCX', print: 'Print',
    template: 'Template', style: 'Style', theme: 'Theme',
    light: 'Light', dark: 'Dark', accentColor: 'Accent Color',
    exportData: 'Export Data', importData: 'Import Data',
    clearAllData: 'Clear All Data', profiles: 'Profiles',
    createProfile: 'Create', switchProfile: 'Switch', deleteProfile: 'Delete',
    jobDescription: 'Job Description', analyzeMatch: 'Analyze Match',
    shareLink: 'Share Link', copy: 'Copy', embedBadge: 'Embed Badge',
   CVCompletion: 'CV Completion', skillsAdded: 'Skills Added',
    experiences: 'Experiences', educationCount: 'Education',
    welcome: 'Welcome to SmartCV AI',
    welcomeDesc: 'Fill in your details in the CV Builder to generate professional documents. Your data is saved automatically.',
    buildCv: 'Build Your CV', generateCoverLetter: 'Generate Cover Letter',
    downloadCvPdf: 'Download CV (PDF)', downloadCvDocx: 'Download CV (DOCX)',
    coverLetterPdf: 'Cover Letter (PDF)', coverLetterDocx: 'Cover Letter (DOCX)',
    printCv: 'Print CV', printCoverLetter: 'Print Cover Letter',
    availableUponRequest: 'Available upon request',
    noEducation: 'No education entries yet.', noExperience: 'No experience entries yet.',
    noCertifications: 'No certifications yet.', noLanguages: 'No languages yet.',
    noPublications: 'No publications yet.', noVolunteerWork: 'No volunteer work yet.',
    noReferees: 'No referees added yet.', noVersions: 'No saved versions yet.',
    versionHistory: 'Version History', saveVersion: 'Save Version',
    versionNamePlaceholder: 'e.g. Google Application v2',
    appearance: 'Appearance', dataManagement: 'Data Management',
    jobMatchKeywords: 'Job Match Keywords',
    jobMatchDesc: 'Add custom skill keywords for the Job Match analysis. Each entry maps a skill name to comma-separated keywords found in job descriptions.',
    versionHistoryDesc: 'Save snapshots of your CV to compare different versions or revert to a previous state.',
    company: 'Company Name', hiringManager: 'Hiring Manager Name',
    jobPosition: 'Job Position', companyAddress: 'Company Address (optional)',
    additionalNotes: 'Additional Notes (optional)',
    generateCoverLetterBtn: 'Generate Cover Letter',
    cvWillAppear: 'Your CV will appear here',
    fillDetails: 'Fill in your details in the form to see a live preview',
    clWillAppear: 'Your Cover Letter will appear here',
    enterCompanyDetails: 'Enter the company details and click Generate',
    noAnalysis: 'No analysis yet', pasteJobDesc: 'Paste a job description and click "Analyze Match" to see your score',
    professionalSummary: 'Professional Summary', professionalExperience: 'Professional Experience',
    refereesAvailable: 'Referees',
    cropPhoto: 'Crop Photo', free: 'Free', apply: 'Apply',
    zoom: 'Zoom',
  },
};

export function t(key) {
  return (_translations[key] || translations.en[key] || key);
}

export function setLanguage(lang) {
  _lang = lang;
  _translations = translations[lang] || translations.en;
}

export function getLanguage() { return _lang; }
export function getAvailableLanguages() { return [{ code: 'en', name: 'English' }]; }
