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
    language: 'Language',
    exportData: 'Export Data', importData: 'Import Data',
    clearAllData: 'Clear All Data', profiles: 'Profiles',
    createProfile: 'Create', switchProfile: 'Switch', deleteProfile: 'Delete',
    jobDescription: 'Job Description', analyzeMatch: 'Analyze Match',
    shareLink: 'Share Link', copy: 'Copy', embedBadge: 'Embed Badge',
    cvCompletion: 'CV Completion', skillsAdded: 'Skills Added',
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
    darkMode: 'Dark Mode', lightMode: 'Light Mode',
    title: 'Title / Position', organization: 'Organization',
    description: 'Description', role: 'Role',
    institution: 'Institution', degree: 'Course / Degree', graduationYear: 'Graduation Year',
    companyName: 'Company', jobTitle: 'Job Title', startDate: 'Start Date', endDate: 'End Date',
    responsibilities: 'Responsibilities', skillName: 'Skill Name',
    uploadPhoto: 'Upload Photo', photo: 'Profile Photo',
    shareSmartCV: 'Share SmartCV AI', shareDesc: 'Help others discover the easiest way to build professional CVs and cover letters.',
    directLink: 'Share Link', directLinkDesc: 'Copy the direct link to share anywhere.',
    shareOnSocial: 'Share on Social', shareOnSocialDesc: 'Spread the word with one click.',
    embedCode: 'Embed Badge', embedDesc: 'Add a SmartCV AI badge to your portfolio or website.',
    linkCopied: 'Link copied to clipboard!', embedCopied: 'Embed code copied!',
    shareVia: 'Share via...', builtWith: 'Built with SmartCV AI',
    linkedinShare: 'LinkedIn', whatsappShare: 'WhatsApp', emailShare: 'Email',
    twitterShare: 'Twitter / X',
    certificationName: 'Certification Name', issuingOrg: 'Issuing Organization', date: 'Date',
    languageName: 'Language', proficiencyLevel: 'Proficiency Level',
    pubTitle: 'Title', publisher: 'Publisher / Journal', url: 'URL (optional)',
    matchSummary: 'Match Summary', matchedSkills: 'Matched Skills',
    missingSkills: 'Missing Skills', strongMatch: 'Strong Match',
    moderateMatch: 'Moderate Match', weakMatch: 'Weak Match',
    tip: 'Tip: Add missing skills to your CV if you have experience with them. Tailor your CV for each application to improve your match score.',
    noMatchingSkills: 'No matching skills found', noMissingSkills: 'Great — no missing skills detected!',
    keywordMapping: 'Add Keyword Mapping',
    profilesDesc: 'Create separate CV profiles for different job applications. Each profile stores its own data.',
    profilePlaceholder: 'e.g. Google Application',
    keywords: 'Keywords (comma-separated)', keywordsPlaceholder: 'e.g. docker, container, docker compose',
    jobMatchDesc2: 'Paste the job description below to see how well your CV matches.',
    jobDescriptionLabel: 'Job Description', jobDescriptionPlaceholder: 'Paste the full job description here...',
  },
  sw: {
    dashboard: 'Dashibodi', cvBuilder: 'Mtayarishaji CV', coverLetter: 'Barua ya Kazi',
    settings: 'Mipangilio', jobMatch: 'Mafanikio ya Kazi', share: 'Shiriki',
    fullName: 'Jina Kamili', email: 'Barua pepe', phone: 'Simu', location: 'Eneo',
    linkedin: 'LinkedIn', portfolio: 'Portfolio', professionalTitle: 'Cheo cha Kitaalamu',
    careerSummary: 'Muhtasari wa Kazi', personalInfo: 'Taarifa Binafsi',
    professionalInfo: 'Taarifa za Kitaalamu', education: 'Elimu',
    experience: 'Uzoefu wa Kazi', skills: 'Ujuzi', additional: 'Nyongeza',
    certifications: 'Vyeti', languages: 'Lugha', publications: 'Uchapishaji',
    volunteerWork: 'Kazi ya Hiari', referees: 'Washauri',
    add: 'Ongeza', remove: 'Ondoa', save: 'Hifadhi', cancel: 'Ghairi',
    downloadPdf: 'PDF', downloadDocx: 'DOCX', print: 'Chapisha',
    template: 'Kiwango', style: 'Mtindo', theme: 'Mandhari',
    light: 'Nuru', dark: 'Giza', accentColor: 'Rangi ya Msisimuo',
    language: 'Lugha',
    exportData: 'Hamisha Data', importData: 'Ingiza Data',
    clearAllData: 'Futa Data Yote', profiles: 'Wasifu',
    createProfile: 'Unda', switchProfile: 'Badilisha', deleteProfile: 'Futa',
    jobDescription: 'Maelezo ya Kazi', analyzeMatch: 'Chambua Mafanikio',
    shareLink: 'Shiriki Kiungo', copy: 'Nakili', embedBadge: 'Bandika Nishani',
    cvCompletion: 'Kamilisha CV', skillsAdded: 'Ujuzi Ulioongezwa',
    experiences: 'Uzoefu', educationCount: 'Elimu',
    welcome: 'Karibu SmartCV AI',
    welcomeDesc: 'Jaza taarifa zako kwenye Mtayarishaji CV ili kuunda nyaraka za kitaalamu. Data yako inahifadhiwa kiotomatiki.',
    buildCv: 'Tengeneza CV Yako', generateCoverLetter: 'Tengeneza Barua ya Kazi',
    downloadCvPdf: 'Pakua CV (PDF)', downloadCvDocx: 'Pakua CV (DOCX)',
    coverLetterPdf: 'Barua ya Kazi (PDF)', coverLetterDocx: 'Barua ya Kazi (DOCX)',
    printCv: 'Chapisha CV', printCoverLetter: 'Chapisha Barua ya Kazi',
    availableUponRequest: 'Inapatikana kwa ombi',
    noEducation: 'Hakuna elimu bado.', noExperience: 'Hakuna uzoefu bado.',
    noCertifications: 'Hakuna vyeti bado.', noLanguages: 'Hakuna lugha bado.',
    noPublications: 'Hakuna uchapishaji bado.', noVolunteerWork: 'Hakuna kazi ya hiari bado.',
    noReferees: 'Hakuna washauri bado.', noVersions: 'Hakuna toleo lililohifadhiwa bado.',
    versionHistory: 'Historia ya Matoleo', saveVersion: 'Hifadhi Toleo',
    versionNamePlaceholder: 'mf. Maombi Google toleo la 2',
    appearance: 'Mwonekano', dataManagement: 'Usimamizi wa Data',
    jobMatchKeywords: 'Maneno muhimu ya Kazi',
    jobMatchDesc: 'Ongeza maneno maalum ya ujuzi kwa uchambuzi wa Mafanikio ya Kazi. Kila orodha inaunganisha jina la ujuzi na maneno yaliyotenganishwa kwa koma yanayopatikana kwenye maelezo ya kazi.',
    versionHistoryDesc: 'Hifadhi picha za CV yako ili kulinganisha toleo tofauti au rudi kwenye hali ya awali.',
    company: 'Jina la Kampuni', hiringManager: 'Jina la Meneja wa Ajira',
    jobPosition: 'Cheo cha Kazi', companyAddress: 'Anwani ya Kampuni (si lazima)',
    additionalNotes: 'Maelezo ya Ziada (si lazima)',
    generateCoverLetterBtn: 'Tengeneza Barua ya Kazi',
    cvWillAppear: 'CV yako itaonekana hapa',
    fillDetails: 'Jaza taarifa zako kwenye fomu kuona onyesho la moja kwa moja',
    clWillAppear: 'Barua yako ya kazi itaonekana hapa',
    enterCompanyDetails: 'Weka maelezo ya kampuni na bonyeza Tengeneza',
    noAnalysis: 'Hakuna uchambuzi bado', pasteJobDesc: 'Bandika maelezo ya kazi na bonyeza "Chambua Mafanikio" kuona alama yako',
    professionalSummary: 'Muhtasari wa Kitaalamu', professionalExperience: 'Uzoefu wa Kitaalamu',
    refereesAvailable: 'Washauri',
    cropPhoto: 'Kata Picha', free: 'Bila Kikomo', apply: 'Tumia',
    zoom: 'Kuza',
    darkMode: 'Hali ya Giza', lightMode: 'Hali ya Nuru',
    title: 'Cheo / Nafasi', organization: 'Shirika',
    description: 'Maelezo', role: 'Jukumu',
    institution: 'Taasisi', degree: 'Somo / Shahada', graduationYear: 'Mwaka wa Kuhitimu',
    companyName: 'Kampuni', jobTitle: 'Cheo cha Kazi', startDate: 'Tarehe ya Kuanza', endDate: 'Tarehe ya Kuisha',
    responsibilities: 'Majukumu', skillName: 'Jina la Ujuzi',
    uploadPhoto: 'Pakia Picha', photo: 'Picha ya Wasifu',
    shareSmartCV: 'Shiriki SmartCV AI', shareDesc: 'Wasaidie wengine kugua njia rahisi ya kutengeneza CV na barua za kazi za kitaalamu.',
    directLink: 'Shiriki Kiungo', directLinkDesc: 'Nakili kiungo cha moja kwa moja kushiriki popote.',
    shareOnSocial: 'Shiriki kwenye Mitandao', shareOnSocialDesc: 'Sambaza habari kwa bofya moja.',
    embedCode: 'Bandika Nishani', embedDesc: 'Ongeza nishani ya SmartCV AI kwenye tovuti yako.',
    linkCopied: 'Kiungo kimenakiliwa!', embedCopied: 'Msimbo wa embedumenakiliwa!',
    shareVia: 'Shiriki kupitia...', builtWith: 'Imetengenezwa na SmartCV AI',
    linkedinShare: 'LinkedIn', whatsappShare: 'WhatsApp', emailShare: 'Barua pepe',
    twitterShare: 'Twitter / X',
    certificationName: 'Jina la Cheti', issuingOrg: 'Shirika Linalotoa', date: 'Tarehe',
    languageName: 'Lugha', proficiencyLevel: 'Kiwango cha Ujuzi',
    pubTitle: 'Kichwa', publisher: 'Mdau / Jarida', url: 'URL (si lazima)',
    matchSummary: 'Muhtasari wa Mafanikio', matchedSkills: 'Ujuzi Ulionao',
    missingSkills: 'Ujuzi Unaokosekana', strongMatch: 'Mafanikio Makuu',
    moderateMatch: 'Mafanikio ya Wastani', weakMatch: 'Mafanikio Dhaifu',
    tip: 'Dokezo: Ongeza ujuzi unaokosekana kwenye CV yako ukiwa na uzoefu nao. Binafsisha CV yako kwa kila maombi ili kuboresha alama yako.',
    noMatchingSkills: 'Hakuna ujuzi unaofanana', noMissingSkills: 'Nzuri — hakuna ujuzi unaokosekana!',
    keywordMapping: 'Ongeza Uunganishaji wa Maneno',
    profilesDesc: 'Unda wasifu tofauti wa CV kwa maombi ya kazi tofauti. Kila wasifu huhifadhi data yake.',
    profilePlaceholder: 'mf. Maombi Google',
    keywords: 'Maneno Muhimu (yaliyotenganishwa kwa koma)', keywordsPlaceholder: 'mf. docker, container, docker compose',
    jobMatchDesc2: 'Bandika maelezo ya kazi hapa chini ili kuona jinsi CV yako inavyolingana.',
    jobDescriptionLabel: 'Maelezo ya Kazi', jobDescriptionPlaceholder: 'Bandika maelezo kamili ya kazi hapa...',
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
export function getAvailableLanguages() { return [{ code: 'en', name: 'English' }, { code: 'sw', name: 'Kiswahili' }]; }

export function translatePage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translated = t(key);
    if (!translated) return;
    for (let i = el.childNodes.length - 1; i >= 0; i--) {
      if (el.childNodes[i].nodeType === Node.TEXT_NODE && el.childNodes[i].textContent.trim()) {
        el.childNodes[i].textContent = ' ' + translated;
        return;
      }
    }
    if (el.children.length === 0) {
      el.textContent = translated;
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const translated = t(key);
    if (translated) el.placeholder = translated;
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const translated = t(key);
    if (translated) el.title = translated;
  });
}
