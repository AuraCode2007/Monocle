import { createContext, createElement, useContext, useEffect, useMemo, useState } from 'react';

export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
];

const ENGLISH = {
  brandSubtitle: 'Ministry of Railways - Pan-India Automatic Block Planning',
  compliant: 'CRIS-Compliant',
  language: 'Language',
  corridor: 'Corridor',
  role: 'Role',
  askAi: 'Ask Assistant',
  optimizer: 'Run Optimization',
  solving: 'Processing...',
  reset: 'Reset',
  demoTour: 'Start Demo Tour',
  closeTour: 'Close Tour',
  demoTourLabel: 'Demo tour',
  close: 'Close',
  groups: { operations: 'Operations', intelligence: 'Intelligence', compliance: 'Compliance' },
  nav: {
    COMMAND_CENTER: 'Operations Center',
    GIS_MAP: 'Geospatial GIS Map',
    ML_SCORER: 'ML Derailment Risk Scorer',
    GANTT: '24-Hr Gantt Timeline',
    STRING_CHART: 'Time-Distance String Chart',
    NATIONAL: 'Pan-India Zonal Grid',
    SIMULATION: 'What-If Simulator',
    PTW: 'Conflict & PTW (PDF)',
    CALENDAR: '26-Week Horizon',
  },
  tour: {
    COMMAND_CENTER: 'See the complete operating picture and the AI impact at a glance.',
    GIS_MAP: 'Track stations, trains, blocks, and traction assets geographically.',
    ML_SCORER: 'Prioritize maintenance using predictive track defect risk.',
    GANTT: 'Coordinate maintenance possessions against the 24-hour traffic plan.',
    STRING_CHART: 'Spot train trajectories and block intersections over distance and time.',
    NATIONAL: 'Compare operating status across the national railway zones.',
    SIMULATION: 'Stress-test the corridor with an emergency before it happens.',
    PTW: 'Resolve conflicts and issue a controlled permit to work.',
    CALENDAR: 'Plan recurring maintenance windows across the 26-week horizon.',
  },
  dashboard: {
    operationsCenter: 'Operations control centre', onePicture: 'Integrated operating picture for train movement, maintenance possession, and corridor status across',
    crisisMode: 'Crisis mode active', corridorOperational: 'Corridor available', liveFeed: 'Live data connected', simulationData: 'Simulation data',
    manualVsAi: 'Manual plan versus optimized plan', sameCorridor: 'Same corridor measured against the active operating window.', decisionView: 'Decision view',
    manualScheduling: 'Manual scheduling', aiScheduling: 'Optimized scheduling', baseline: 'Baseline', recommended: 'Recommended', siloedRequests: 'Siloed requests · daylight clashes', synchronized: 'CP-SAT synchronized · night possession',
    activeConflicts: 'Active conflicts', passengerDelay: 'Passenger delay exposure', jointPossessions: 'Joint possessions', assetAvailability: 'Asset availability', clashes: 'clashes', minutes: 'min', blocks: 'blocks',
    liveMovement: 'Live movement status', priorityServices: 'Priority services scheduled on this corridor', openMap: 'Open map', upDirection: 'UP direction', downDirection: 'DN direction',
    maintenanceWatchlist: 'Maintenance watchlist', highestPriority: 'Highest-priority work requiring coordination', timeline: 'Timeline', start: 'start',
    scanRisk: 'Asset risk review', reviewPredictive: 'Review defect scores before work authorization.', openRisk: 'Open risk review', testDisruption: 'Test disruption scenario', seeIncident: 'Assess the operational impact of an incident before it occurs.', openSimulator: 'Open simulator', authorizeWork: 'Authorize safe work', resolveClashes: 'Resolve conflicts and issue permits within the working window.', reviewConflicts: 'Review conflicts', exploreNetwork: 'Explore corridor network',
    metrics: { activeConflicts: 'Active Train Conflicts', zeroConflicts: '0 Conflicts', clashing: 'Clashing', collisionFree: '100% conflict-free schedule', trainClashes: 'Rajdhani/Vande Bharat conflicts', delaysAvoided: 'Train delays avoided', mins: 'Mins', baseline: 'Mins (Baseline)', passengerSaved: '7.5 hours saved in network passenger time', daylightThrottling: 'Passenger throttling during daylight window', jointBlocks: 'Joint synchronized blocks', coLocated: 'Co-located', siloed: 'Siloed requests', bundled: 'Track + OHE + signal bundled closures', uncoordinated: 'Uncoordinated closures requested', availability: 'Asset availability uplift', baselineLabel: 'Baseline', throughput: 'Corridor throughput uplift', utilization: 'Long-term maintenance utilization' },
  },
  ui: {
    cancel: 'Cancel', close: 'Close', dismiss: 'Dismiss', submit: 'Submit', response: 'Response', newQuery: 'New query',
    searchPlaceholder: 'Search operations data or speak a query...', operationsSearch: 'Operations search and decision support',
    suggestedQueries: 'Suggested operational queries', pressToOpen: 'Press Ctrl K to open commands',
    track: 'Track (ENG)', traction: 'Traction (TRD)', signal: 'Signal (S&T)', jointSynced: 'Joint Synced',
    scheduledWindow: 'Scheduled Window', collisionWarning: 'Collision Warning', nightLull: 'Night Lull Window', lateNight: 'Late Night Lull',
    activeIsolation: 'Active isolation', affectedTrains: 'Affected trains', passengerImpact: 'Passenger impact', authorityState: 'Authority state',
    explainableDecisions: 'Explainable train decisions', runDynamicResolve: 'Run Dynamic Re-solve', runningCpsat: 'Running CP-SAT...', responseGenerated: 'Response Generated',
    approveResponse: 'Approve emergency response', approvalRequired: 'Approval required', exportIncident: 'Export signed incident report', exportPtw: 'Export Form T/348M',
    issueEmergencyPtw: 'Issue emergency PTW', awaitingSolve: 'Awaiting solve', planStabilized: 'Plan stabilized', rectifierStatus: 'Rectifier status',
    requested: 'Requested', selected: 'Selected', protectedAgainst: 'Protected against', delayAvoided: 'Delay avoided', conflictsReviewed: 'Conflicts reviewed', trainsProtected: 'Trains protected',
    optimizationEvidence: 'Optimization decision evidence', explainableOptimization: 'Explainable optimization decisions', solverEvidence: 'Solver evidence', simulationEvidence: 'Simulation evidence',
    runOptimizerEvidence: 'Run the optimizer to see the constraint evidence, affected trains, and operational reason behind every scheduled work window.',
    gisTitle: 'Geospatial GIS Railway Corridor Map', gisSubtitle: 'Real-Time GPS Track Topography, Traction Feeders, Active Possession Blocks & Moving Trains',
    darkGis: 'Dark GIS', satellite: 'Satellite', street: 'OpenStreet', trains: 'Trains', blocks: 'Blocks', substations: '25kV TSS', on: 'ON', off: 'OFF',
    trackClearance: 'Track Clearance', activeTrackWork: 'Active Track Work', jointPossession: 'Joint Possession Blocks', operational: 'Operational',
    ganttTitle: '24-Hour Master Gantt Timeline', ganttSubtitle: 'Maintenance possessions coordinated against scheduled train movement',
    stringTitle: 'Time-Distance String Chart', stringSubtitle: 'Train trajectories versus track maintenance closures',
    healthTitle: 'Track Defect Risk Monitor', healthSubtitle: 'Track inspection telemetry and defect risk indicators',
    rollingTitle: '26-Week Rolling Block Programme', rollingSubtitle: 'Multi-department maintenance capacity planning horizon',
    blocksLabel: 'Blocks', utilization: 'Utilization',
    ptwTitle: 'Conflict Resolution & Digital Permit-to-Work', ptwSubtitle: 'Automated conflict rectification and controlled permit export',
    issuePtw: 'Issue Digital PTW', approvePtw: 'Approve PTW', approvalRestricted: 'Approval restricted', awaitingApproval: 'PTW awaiting approval', exportPdf: 'Export PDF',
    emergencyTitle: 'Interactive What-If Simulation & Emergency Stress-Testing Engine', emergencySubtitle: 'Simulate failures and test how the AI protects train throughput',
    fractureScenario: 'Scenario A: Ultrasonic Rail Fracture', oheScenario: 'Scenario B: 25kV OHE Failure', injectFracture: 'Inject Rail Fracture Defect', injectOhe: 'Inject OHE Failure', clearEmergency: 'Clear Emergency',
    crisisActive: 'CRISIS MODE ACTIVE', corridorNormal: 'CORRIDOR NORMAL', signedBy: 'Signed by',
    nationalTitle: 'Pan-India Zonal Command & Network Evidence View', nationalSubtitle: 'Network structure is source-backed; performance figures are calculated from the active CP-SAT scenario.',
    measuredDelay: 'Measured delay avoided / cycle', measuredJoint: 'Measured joint possessions / cycle', measuredAvailability: 'Measured availability gain', runSolver: 'Run solver',
    networkProjection: 'Illustrative network projection', showMethod: 'Show method', hideMethod: 'Hide method', openSource: 'Open source', directory: 'Directory',
    login: 'Login to dashboard', email: 'Email', password: 'Password', secureSignIn: 'Secure Sign In', demoCredentials: 'Demo credentials', authenticating: 'Authenticating...',
  },
  demo: {
    start: 'Run Guided Demo', stop: 'Stop Demo', active: 'LIVE PROTOTYPE DEMO', simulated: 'Simulated operational scenario', phase: 'Phase', of: 'of', baseline: 'Baseline conditions', timeline: 'Coordinating maintenance windows', optimizing: 'AI optimizer resolving conflicts', permits: 'Safety permits ready for review', national: 'Showing national impact', next: 'Next phase starts automatically', completed: 'Demo complete', resetHint: 'Run again to replay the scenario',
  },
  footer: 'Monocle Engine © Smart India Hackathon 2026',
  ministry: 'Dedicated to Ministry of Railways (Government of India)',
};

const TRANSLATIONS = {
  en: ENGLISH,
  hi: {
    ...ENGLISH,
    brandSubtitle: 'रेल मंत्रालय - अखिल भारतीय स्वचालित ब्लॉक योजना', compliant: 'CRIS-अनुपालक', language: 'भाषा', corridor: 'कॉरिडोर', role: 'भूमिका', askAi: 'एआई से पूछें', optimizer: 'एआई ऑप्टिमाइज़र चलाएं', solving: 'समाधान हो रहा है...', reset: 'रीसेट', demoTour: 'डेमो टूर शुरू करें', closeTour: 'टूर बंद करें', demoTourLabel: 'डेमो टूर', close: 'बंद करें', footer: 'मोनोकल इंजन © स्मार्ट इंडिया हैकाथॉन 2026', ministry: 'रेल मंत्रालय (भारत सरकार) को समर्पित',
    groups: { operations: 'संचालन', intelligence: 'इंटेलिजेंस', compliance: 'अनुपालन' },
    nav: { COMMAND_CENTER: 'संचालन केंद्र', GIS_MAP: 'भौगोलिक जीआईएस मानचित्र', ML_SCORER: 'पटरी जोखिम स्कोरर', GANTT: '24 घंटे की समयरेखा', STRING_CHART: 'समय-दूरी चार्ट', NATIONAL: 'अखिल भारतीय क्षेत्रीय ग्रिड', SIMULATION: 'क्या-अगर सिम्युलेटर', PTW: 'संघर्ष और पीटीडब्ल्यू (पीडीएफ)', CALENDAR: '26-सप्ताह योजना' },
    tour: { COMMAND_CENTER: 'संचालन की पूरी तस्वीर और एआई प्रभाव एक नजर में देखें।', GIS_MAP: 'स्टेशन, ट्रेन और ट्रैक परिसंपत्तियों को मानचित्र पर देखें।', ML_SCORER: 'पूर्वानुमानित जोखिम से रखरखाव को प्राथमिकता दें।', GANTT: '24 घंटे की यातायात योजना के साथ रखरखाव समन्वित करें।', STRING_CHART: 'दूरी और समय में ट्रेन मार्ग और ब्लॉक टकराव देखें।', NATIONAL: 'राष्ट्रीय रेलवे क्षेत्रों की स्थिति की तुलना करें।', SIMULATION: 'आपातकाल से पहले कॉरिडोर का परीक्षण करें।', PTW: 'संघर्ष हल करें और नियंत्रित कार्य अनुमति जारी करें।', CALENDAR: '26 सप्ताह में नियमित रखरखाव विंडो की योजना बनाएं।' },
    dashboard: { ...ENGLISH.dashboard, operationsCenter: 'संचालन कमांड सेंटर', onePicture: 'ट्रेन संचालन, रखरखाव विंडो और एआई निर्णयों की पूरी तस्वीर', crisisMode: 'संकट मोड सक्रिय', corridorOperational: 'कॉरिडोर चालू है', liveFeed: 'लाइव फीड जुड़ी है', simulationData: 'सिम्युलेशन डेटा', manualVsAi: 'मैनुअल योजना बनाम एआई योजना', decisionView: 'निर्णय दृश्य', manualScheduling: 'मैनुअल शेड्यूलिंग', aiScheduling: 'एआई अनुकूलित शेड्यूलिंग', baseline: 'बेसलाइन', recommended: 'अनुशंसित', activeConflicts: 'सक्रिय ट्रेन संघर्ष', passengerDelay: 'यात्री देरी जोखिम', jointPossessions: 'संयुक्त ब्लॉक', liveMovement: 'लाइव ट्रेन स्थिति', priorityServices: 'इस कॉरिडोर पर निर्धारित प्राथमिकता सेवाएं', openMap: 'मानचित्र खोलें', maintenanceWatchlist: 'रखरखाव वॉचलिस्ट', highestPriority: 'समन्वित विंडो की आवश्यकता वाला महत्वपूर्ण कार्य', timeline: 'समयरेखा', scanRisk: 'परिसंपत्ति जोखिम जांचें', openRisk: 'जोखिम स्कोरर खोलें', testDisruption: 'व्यवधान का परीक्षण करें', openSimulator: 'सिम्युलेटर खोलें', authorizeWork: 'सुरक्षित कार्य अधिकृत करें', reviewConflicts: 'संघर्ष देखें', exploreNetwork: 'कॉरिडोर नेटवर्क देखें', metrics: { ...ENGLISH.dashboard.metrics, activeConflicts: 'सक्रिय ट्रेन संघर्ष', zeroConflicts: '0 संघर्ष', clashing: 'टकराव', collisionFree: '100% टकराव-मुक्त शेड्यूल', delaysAvoided: 'ट्रेन देरी से बचाव', jointBlocks: 'संयुक्त सिंक्रनाइज़ ब्लॉक', availability: 'परिसंपत्ति उपलब्धता बढ़त' } },
    ui: { ...ENGLISH.ui, cancel: 'रद्द करें', close: 'बंद करें', dismiss: 'हटाएं', response: 'प्रतिक्रिया', newQuery: 'नई क्वेरी', suggestedQueries: 'सुझाई गई संचालन क्वेरी', track: 'ट्रैक', traction: 'ट्रैक्शन', signal: 'सिग्नल', jointSynced: 'संयुक्त सिंक्रनाइज़', activeIsolation: 'सक्रिय अलगाव', affectedTrains: 'प्रभावित ट्रेनें', passengerImpact: 'यात्री प्रभाव', authorityState: 'प्राधिकरण स्थिति', explainableDecisions: 'समझने योग्य ट्रेन निर्णय', runDynamicResolve: 'डायनेमिक री-सॉल्व चलाएं', runningCpsat: 'CP-SAT चल रहा है...', responseGenerated: 'प्रतिक्रिया तैयार', approveResponse: 'आपात प्रतिक्रिया स्वीकृत करें', approvalRequired: 'स्वीकृति आवश्यक', exportIncident: 'हस्ताक्षरित रिपोर्ट निर्यात करें', exportPtw: 'Form T/348M निर्यात करें', issueEmergencyPtw: 'आपात PTW जारी करें', requested: 'अनुरोधित', selected: 'चयनित', protectedAgainst: 'इनसे सुरक्षित', delayAvoided: 'बचाई गई देरी', conflictsReviewed: 'समीक्षित संघर्ष', trainsProtected: 'सुरक्षित ट्रेनें', optimizationEvidence: 'अनुकूलन निर्णय प्रमाण', explainableOptimization: 'समझने योग्य अनुकूलन निर्णय', gisTitle: 'भौगोलिक रेलवे कॉरिडोर मानचित्र', ganttTitle: '24 घंटे की मास्टर गैंट समयरेखा', stringTitle: 'समय-दूरी स्ट्रिंग चार्ट', healthTitle: 'ट्रैक दोष जोखिम मॉनिटर', rollingTitle: '26-सप्ताह रोलिंग ब्लॉक कार्यक्रम', ptwTitle: 'संघर्ष समाधान और डिजिटल PTW', emergencyTitle: 'इंटरैक्टिव आपातकालीन सिम्युलेटर', fractureScenario: 'परिदृश्य A: रेल फ्रैक्चर', oheScenario: 'परिदृश्य B: 25kV OHE विफलता', injectFracture: 'रेल फ्रैक्चर डालें', injectOhe: 'OHE विफलता डालें', clearEmergency: 'आपात स्थिति हटाएं', crisisActive: 'संकट मोड सक्रिय', signedBy: 'हस्ताक्षरकर्ता', nationalTitle: 'अखिल भारतीय नेटवर्क प्रमाण दृश्य', measuredDelay: 'प्रति चक्र मापी गई बचत', measuredJoint: 'प्रति चक्र संयुक्त कब्जे', measuredAvailability: 'मापी गई उपलब्धता बढ़त', runSolver: 'सॉल्वर चलाएं', networkProjection: 'उदाहरण नेटवर्क प्रक्षेपण', showMethod: 'विधि दिखाएं', hideMethod: 'विधि छिपाएं', openSource: 'स्रोत खोलें', directory: 'निर्देशिका', login: 'डैशबोर्ड में लॉगिन', email: 'ईमेल', password: 'पासवर्ड', secureSignIn: 'सुरक्षित साइन इन', demoCredentials: 'डेमो क्रेडेंशियल', authenticating: 'प्रमाणीकरण हो रहा है...' },
    demo: { ...ENGLISH.demo, start: 'निर्देशित डेमो चलाएं', stop: 'डेमो रोकें', active: 'लाइव प्रोटोटाइप डेमो', simulated: 'सिम्युलेटेड संचालन परिदृश्य', phase: 'चरण', of: 'में से', baseline: 'बेसलाइन स्थिति', timeline: 'रखरखाव विंडो समन्वय', optimizing: 'एआई संघर्ष हल कर रहा है', permits: 'सुरक्षा परमिट समीक्षा के लिए तैयार', national: 'राष्ट्रीय प्रभाव दिखाया जा रहा है', next: 'अगला चरण अपने आप शुरू होगा', completed: 'डेमो पूरा', resetHint: 'परिदृश्य फिर से चलाएं' },
  },
  bn: {
    ...ENGLISH,
    brandSubtitle: 'রেল মন্ত্রক - সর্বভারতীয় স্বয়ংক্রিয় ব্লক পরিকল্পনা', compliant: 'CRIS-অনুগত', language: 'ভাষা', corridor: 'করিডর', role: 'ভূমিকা', askAi: 'এআই-কে জিজ্ঞাসা করুন', optimizer: 'এআই অপ্টিমাইজার চালান', solving: 'সমাধান হচ্ছে...', reset: 'রিসেট', demoTour: 'ডেমো ট্যুর শুরু করুন', closeTour: 'ট্যুর বন্ধ করুন', demoTourLabel: 'ডেমো ট্যুর', close: 'বন্ধ করুন', footer: 'মনোকল ইঞ্জিন © স্মার্ট ইন্ডিয়া হ্যাকাথন ২০২৬', ministry: 'রেল মন্ত্রক (ভারত সরকার)-কে উৎসর্গীকৃত',
    groups: { operations: 'অপারেশন', intelligence: 'ইন্টেলিজেন্স', compliance: 'সম্মতি' },
    nav: { COMMAND_CENTER: 'অপারেশন কেন্দ্র', GIS_MAP: 'ভৌগোলিক জিআইএস মানচিত্র', ML_SCORER: 'লাইনচ্যুতি ঝুঁকি স্কোরার', GANTT: '২৪ ঘণ্টার গ্যান্ট টাইমলাইন', STRING_CHART: 'সময়-দূরত্ব চার্ট', NATIONAL: 'সর্বভারতীয় জোনাল গ্রিড', SIMULATION: 'কী-হলে সিমুলেটর', PTW: 'সংঘর্ষ ও পিটিডব্লিউ (পিডিএফ)', CALENDAR: '২৬-সপ্তাহের দিগন্ত' },
    tour: { COMMAND_CENTER: 'সম্পূর্ণ অপারেশন চিত্র এবং এআই প্রভাব এক নজরে দেখুন।', GIS_MAP: 'স্টেশন, ট্রেন, ব্লক এবং ট্র্যাক সম্পদ মানচিত্রে দেখুন।', ML_SCORER: 'পূর্বাভাসিত ঝুঁকি ব্যবহার করে রক্ষণাবেক্ষণকে অগ্রাধিকার দিন।', GANTT: '২৪ ঘণ্টার ট্রাফিক পরিকল্পনার সঙ্গে রক্ষণাবেক্ষণ সমন্বয় করুন।', STRING_CHART: 'সময় ও দূরত্বে ট্রেনের গতিপথ এবং ব্লক সংঘর্ষ দেখুন।', NATIONAL: 'জাতীয় রেলওয়ে জোনগুলির অপারেশন অবস্থা তুলনা করুন।', SIMULATION: 'জরুরি পরিস্থিতির আগে করিডর পরীক্ষা করুন।', PTW: 'সংঘর্ষ সমাধান করে নিয়ন্ত্রিত কাজের অনুমতি দিন।', CALENDAR: '২৬ সপ্তাহের নিয়মিত রক্ষণাবেক্ষণ পরিকল্পনা করুন।' },
    dashboard: { ...ENGLISH.dashboard, operationsCenter: 'অপারেশন কমান্ড সেন্টার', crisisMode: 'সংকট মোড সক্রিয়', corridorOperational: 'করিডর সচল', manualVsAi: 'ম্যানুয়াল বনাম AI পরিকল্পনা', decisionView: 'সিদ্ধান্ত দৃশ্য', manualScheduling: 'ম্যানুয়াল সময়সূচি', aiScheduling: 'AI-অপ্টিমাইজড সময়সূচি', baseline: 'বেসলাইন', recommended: 'প্রস্তাবিত', activeConflicts: 'সক্রিয় ট্রেন সংঘর্ষ', passengerDelay: 'যাত্রী বিলম্বের ঝুঁকি', jointPossessions: 'যৌথ ব্লক', liveMovement: 'লাইভ ট্রেন চলাচল', openMap: 'মানচিত্র খুলুন', maintenanceWatchlist: 'রক্ষণাবেক্ষণ তালিকা', timeline: 'সময়রেখা', scanRisk: 'সম্পদ ঝুঁকি পরীক্ষা', openRisk: 'ঝুঁকি স্কোরার খুলুন', testDisruption: 'বিঘ্ন পরীক্ষা করুন', openSimulator: 'সিমুলেটর খুলুন', authorizeWork: 'নিরাপদ কাজ অনুমোদন করুন', reviewConflicts: 'সংঘর্ষ পর্যালোচনা করুন', exploreNetwork: 'করিডর নেটওয়ার্ক দেখুন', metrics: { ...ENGLISH.dashboard.metrics, activeConflicts: 'সক্রিয় ট্রেন সংঘর্ষ', delaysAvoided: 'এড়ানো ট্রেন বিলম্ব', jointBlocks: 'যৌথ সিঙ্ক্রোনাইজড ব্লক', availability: 'সম্পদের প্রাপ্যতা বৃদ্ধি' } },
    ui: { ...ENGLISH.ui, close: 'বন্ধ করুন', response: 'উত্তর', newQuery: 'নতুন প্রশ্ন', suggestedQueries: 'প্রস্তাবিত অপারেশন প্রশ্ন', affectedTrains: 'প্রভাবিত ট্রেন', passengerImpact: 'যাত্রী প্রভাব', authorityState: 'কর্তৃপক্ষের অবস্থা', runDynamicResolve: 'ডায়নামিক পুনঃসমাধান চালান', runningCpsat: 'CP-SAT চলছে...', responseGenerated: 'উত্তর তৈরি', approveResponse: 'জরুরি উত্তর অনুমোদন করুন', approvalRequired: 'অনুমোদন প্রয়োজন', exportIncident: 'স্বাক্ষরিত রিপোর্ট রপ্তানি করুন', issueEmergencyPtw: 'জরুরি PTW জারি করুন', requested: 'অনুরোধকৃত', selected: 'নির্বাচিত', delayAvoided: 'এড়ানো বিলম্ব', trainsProtected: 'সুরক্ষিত ট্রেন', nationalTitle: 'সর্বভারতীয় নেটওয়ার্ক প্রমাণ দৃশ্য', measuredDelay: 'প্রতি চক্রে মাপা বিলম্ব সাশ্রয়', measuredJoint: 'প্রতি চক্রে যৌথ দখল', runSolver: 'সলভার চালান', showMethod: 'পদ্ধতি দেখুন', hideMethod: 'পদ্ধতি লুকান', openSource: 'উৎস খুলুন', directory: 'ডিরেক্টরি', login: 'ড্যাশবোর্ডে লগইন', email: 'ইমেল', password: 'পাসওয়ার্ড', secureSignIn: 'নিরাপদ সাইন ইন', demoCredentials: 'ডেমো পরিচয়পত্র', authenticating: 'প্রমাণীকরণ হচ্ছে...' },
  },
  ta: {
    ...ENGLISH,
    brandSubtitle: 'ரயில்வே அமைச்சகம் - இந்திய அளவிலான தானியங்கி பிளாக் திட்டமிடல்', compliant: 'CRIS இணக்கம்', language: 'மொழி', corridor: 'வழித்தடம்', role: 'பங்கு', askAi: 'AI-யிடம் கேளுங்கள்', optimizer: 'AI மேம்படுத்தியை இயக்கவும்', solving: 'தீர்வு காணப்படுகிறது...', reset: 'மீட்டமை', demoTour: 'டெமோ சுற்றுப்பயணத்தைத் தொடங்கு', closeTour: 'சுற்றுப்பயணத்தை மூடு', demoTourLabel: 'டெமோ சுற்றுப்பயணம்', close: 'மூடு', footer: 'மோனோகிள் இன்ஜின் © ஸ்மார்ட் இந்தியா ஹேக்கத்தான் 2026', ministry: 'ரயில்வே அமைச்சகத்திற்கு அர்ப்பணிப்பு',
    groups: { operations: 'செயல்பாடுகள்', intelligence: 'நுண்ணறிவு', compliance: 'இணக்கம்' },
    nav: { COMMAND_CENTER: 'செயல்பாட்டு மையம்', GIS_MAP: 'புவியியல் GIS வரைபடம்', ML_SCORER: 'தடம் தடம்புரளல் ஆபத்து மதிப்பீடு', GANTT: '24 மணி நேர காலவரிசை', STRING_CHART: 'நேர-தூர விளக்கப்படம்', NATIONAL: 'இந்திய மண்டல கட்டம்', SIMULATION: 'என்ன ஆகும் சிமுலேட்டர்', PTW: 'மோதல் மற்றும் PTW (PDF)', CALENDAR: '26 வார காலவரம்பு' },
    tour: { COMMAND_CENTER: 'முழு செயல்பாட்டு நிலை மற்றும் AI தாக்கத்தை ஒரே பார்வையில் காணுங்கள்.', GIS_MAP: 'நிலையங்கள், ரயில்கள் மற்றும் தடப் பொருட்களை வரைபடத்தில் காணுங்கள்.', ML_SCORER: 'முன்கணிப்பு தட ஆபத்தைப் பயன்படுத்தி பராமரிப்புக்கு முன்னுரிமை அளிக்கவும்.', GANTT: '24 மணி நேர போக்குவரத்து திட்டத்துடன் பராமரிப்பை ஒருங்கிணைக்கவும்.', STRING_CHART: 'நேரம் மற்றும் தூரத்தில் ரயில் பாதைகள் மற்றும் பிளாக் மோதல்களைக் காணுங்கள்.', NATIONAL: 'தேசிய ரயில்வே மண்டலங்களின் நிலையை ஒப்பிடுங்கள்.', SIMULATION: 'அவசரநிலைக்கு முன் வழித்தடத்தை சோதிக்கவும்.', PTW: 'மோதல்களைத் தீர்த்து கட்டுப்படுத்தப்பட்ட பணியனுமதி வழங்கவும்.', CALENDAR: '26 வார பராமரிப்பு சாளரங்களைத் திட்டமிடுங்கள்.' },
    dashboard: { ...ENGLISH.dashboard, operationsCenter: 'செயல்பாட்டு கட்டளை மையம்', crisisMode: 'நெருக்கடி முறை செயலில்', corridorOperational: 'வழித்தடம் செயல்பாட்டில்', manualVsAi: 'கையேடு மற்றும் AI திட்டம்', decisionView: 'முடிவு காட்சி', manualScheduling: 'கையேடு திட்டமிடல்', aiScheduling: 'AI மேம்படுத்திய திட்டமிடல்', baseline: 'அடிப்படை', recommended: 'பரிந்துரைக்கப்பட்டது', activeConflicts: 'செயலில் உள்ள ரயில் மோதல்கள்', passengerDelay: 'பயணி தாமத ஆபத்து', jointPossessions: 'கூட்டு பிளாக்குகள்', liveMovement: 'நேரடி ரயில் நிலை', openMap: 'வரைபடத்தைத் திற', maintenanceWatchlist: 'பராமரிப்பு பட்டியல்', timeline: 'காலவரிசை', scanRisk: 'சொத்து ஆபத்தைச் சரிபார்', openRisk: 'ஆபத்து மதிப்பீட்டைத் திற', testDisruption: 'இடையூறு சோதனை', openSimulator: 'சிமுலேட்டரைத் திற', authorizeWork: 'பாதுகாப்பான பணியை அங்கீகரி', reviewConflicts: 'மோதல்களைப் பார்வையிடு', exploreNetwork: 'வழித்தட வலையமைப்பைப் பார்', metrics: { ...ENGLISH.dashboard.metrics, activeConflicts: 'செயலில் உள்ள ரயில் மோதல்கள்', delaysAvoided: 'தவிர்க்கப்பட்ட ரயில் தாமதங்கள்', jointBlocks: 'கூட்டு ஒத்திசைக்கப்பட்ட பிளாக்குகள்', availability: 'சொத்து கிடைக்கும் திறன் உயர்வு' } },
    ui: { ...ENGLISH.ui, close: 'மூடு', response: 'பதில்', newQuery: 'புதிய கேள்வி', suggestedQueries: 'பரிந்துரைக்கப்பட்ட செயல்பாட்டு கேள்விகள்', affectedTrains: 'பாதிக்கப்பட்ட ரயில்கள்', passengerImpact: 'பயணி தாக்கம்', authorityState: 'அதிகார நிலை', runDynamicResolve: 'டைனமிக் மறுதீர்வை இயக்கவும்', runningCpsat: 'CP-SAT இயங்குகிறது...', responseGenerated: 'பதில் உருவாக்கப்பட்டது', approveResponse: 'அவசர பதிலை அங்கீகரிக்கவும்', approvalRequired: 'அங்கீகாரம் தேவை', exportIncident: 'கையொப்பமிட்ட அறிக்கையை ஏற்றுமதி செய்', issueEmergencyPtw: 'அவசர PTW வழங்கு', requested: 'கோரப்பட்டது', selected: 'தேர்ந்தெடுக்கப்பட்டது', delayAvoided: 'தவிர்க்கப்பட்ட தாமதம்', trainsProtected: 'பாதுகாக்கப்பட்ட ரயில்கள்', nationalTitle: 'இந்திய நெட்வொர்க் ஆதாரக் காட்சி', measuredDelay: 'ஒரு சுழற்சியில் அளவிடப்பட்ட தாமத சேமிப்பு', measuredJoint: 'ஒரு சுழற்சியில் கூட்டு பணிகள்', runSolver: 'தீர்வியை இயக்கு', showMethod: 'முறையைக் காட்டு', hideMethod: 'முறையை மறை', openSource: 'மூலத்தைத் திற', directory: 'அடைவு', login: 'டாஷ்போர்டில் உள்நுழை', email: 'மின்னஞ்சல்', password: 'கடவுச்சொல்', secureSignIn: 'பாதுகாப்பான உள்நுழைவு', demoCredentials: 'டெமோ சான்றுகள்', authenticating: 'அங்கீகரிக்கப்படுகிறது...' },
  },
  te: {
    ...ENGLISH,
    brandSubtitle: 'రైల్వే మంత్రిత్వ శాఖ - భారతవ్యాప్త ఆటోమేటిక్ బ్లాక్ ప్రణాళిక', compliant: 'CRIS అనుగుణం', language: 'భాష', corridor: 'కారిడార్', role: 'పాత్ర', askAi: 'AIని అడగండి', optimizer: 'AI ఆప్టిమైజర్ అమలు చేయండి', solving: 'పరిష్కరిస్తోంది...', reset: 'రీసెట్', demoTour: 'డెమో టూర్ ప్రారంభించండి', closeTour: 'టూర్ మూసివేయండి', demoTourLabel: 'డెమో టూర్', close: 'మూసివేయి', footer: 'మోనోకిల్ ఇంజిన్ © స్మార్ట్ ఇండియా హ్యాకథాన్ 2026', ministry: 'రైల్వే మంత్రిత్వ శాఖకు అంకితం',
    groups: { operations: 'ఆపరేషన్స్', intelligence: 'ఇంటెలిజెన్స్', compliance: 'అనుసరణ' },
    nav: { COMMAND_CENTER: 'ఆపరేషన్స్ సెంటర్', GIS_MAP: 'భౌగోళిక GIS మ్యాప్', ML_SCORER: 'పట్టాలు తప్పే ప్రమాద స్కోరర్', GANTT: '24 గంటల గాంట్ టైమ్‌లైన్', STRING_CHART: 'సమయం-దూరం చార్ట్', NATIONAL: 'భారత జోనల్ గ్రిడ్', SIMULATION: 'ఏమైతే సిమ్యులేటర్', PTW: 'సంఘర్షణ మరియు PTW (PDF)', CALENDAR: '26 వారాల పరిధి' },
    tour: { COMMAND_CENTER: 'పూర్తి ఆపరేషన్ల దృశ్యం మరియు AI ప్రభావాన్ని ఒకే చూపులో చూడండి.', GIS_MAP: 'స్టేషన్లు, రైళ్లు మరియు ట్రాక్ ఆస్తులను మ్యాప్‌లో చూడండి.', ML_SCORER: 'అంచనా ట్రాక్ ప్రమాదంతో నిర్వహణకు ప్రాధాన్యత ఇవ్వండి.', GANTT: '24 గంటల ట్రాఫిక్ ప్రణాళికతో నిర్వహణను సమన్వయం చేయండి.', STRING_CHART: 'సమయం మరియు దూరంలో రైలు మార్గాలను చూడండి.', NATIONAL: 'జాతీయ రైల్వే జోన్ల స్థితిని పోల్చండి.', SIMULATION: 'అత్యవసర పరిస్థితికి ముందు కారిడార్‌ను పరీక్షించండి.', PTW: 'సంఘర్షణలను పరిష్కరించి నియంత్రిత పని అనుమతి ఇవ్వండి.', CALENDAR: '26 వారాల నిర్వహణ విండోలను ప్లాన్ చేయండి.' },
    dashboard: { ...ENGLISH.dashboard, operationsCenter: 'ఆపరేషన్స్ కమాండ్ సెంటర్', crisisMode: 'సంక్షోభ మోడ్ సక్రియం', corridorOperational: 'కారిడార్ పనిచేస్తోంది', manualVsAi: 'మాన్యువల్ మరియు AI ప్రణాళిక', decisionView: 'నిర్ణయ దృశ్యం', manualScheduling: 'మాన్యువల్ షెడ్యూలింగ్', aiScheduling: 'AI ఆప్టిమైజ్డ్ షెడ్యూలింగ్', baseline: 'బేస్‌లైన్', recommended: 'సిఫార్సు', activeConflicts: 'క్రియాశీల రైలు సంఘర్షణలు', passengerDelay: 'ప్రయాణికుల ఆలస్యం ప్రమాదం', jointPossessions: 'జాయింట్ బ్లాక్స్', liveMovement: 'లైవ్ రైలు స్థితి', openMap: 'మ్యాప్ తెరవండి', maintenanceWatchlist: 'నిర్వహణ జాబితా', timeline: 'టైమ్‌లైన్', scanRisk: 'ఆస్తి ప్రమాదాన్ని స్కాన్ చేయండి', openRisk: 'రిస్క్ స్కోరర్ తెరవండి', testDisruption: 'అంతరాయం పరీక్షించండి', openSimulator: 'సిమ్యులేటర్ తెరవండి', authorizeWork: 'సురక్షిత పనిని అనుమతించండి', reviewConflicts: 'సంఘర్షణలను సమీక్షించండి', exploreNetwork: 'కారిడార్ నెట్‌వర్క్ చూడండి', metrics: { ...ENGLISH.dashboard.metrics, activeConflicts: 'క్రియాశీల రైలు సంఘర్షణలు', delaysAvoided: 'తప్పించిన రైలు ఆలస్యాలు', jointBlocks: 'జాయింట్ సింక్రొనైజ్డ్ బ్లాక్స్', availability: 'ఆస్తి లభ్యత పెరుగుదల' } },
    ui: { ...ENGLISH.ui, close: 'మూసివేయి', response: 'ప్రతిస్పందన', newQuery: 'కొత్త ప్రశ్న', suggestedQueries: 'సూచించిన ఆపరేషన్ ప్రశ్నలు', affectedTrains: 'ప్రభావిత రైళ్లు', passengerImpact: 'ప్రయాణికుల ప్రభావం', authorityState: 'అధికార స్థితి', runDynamicResolve: 'డైనమిక్ రీ-సాల్వ్ అమలు చేయండి', runningCpsat: 'CP-SAT నడుస్తోంది...', responseGenerated: 'ప్రతిస్పందన సిద్ధం', approveResponse: 'అత్యవసర ప్రతిస్పందనను ఆమోదించండి', approvalRequired: 'ఆమోదం అవసరం', exportIncident: 'సంతకం చేసిన నివేదికను ఎగుమతి చేయండి', issueEmergencyPtw: 'అత్యవసర PTW జారీ చేయండి', requested: 'అభ్యర్థించిన', selected: 'ఎంచుకున్న', delayAvoided: 'తప్పించిన ఆలస్యం', trainsProtected: 'రక్షించబడిన రైళ్లు', nationalTitle: 'భారత నెట్‌వర్క్ ఆధార దృశ్యం', measuredDelay: 'ప్రతి చక్రంలో కొలిచిన ఆలస్యం ఆదా', measuredJoint: 'ప్రతి చక్రంలో సంయుక్త బ్లాకులు', runSolver: 'సాల్వర్ అమలు చేయండి', showMethod: 'విధానాన్ని చూపు', hideMethod: 'విధానాన్ని దాచు', openSource: 'మూలాన్ని తెరవండి', directory: 'డైరెక్టరీ', login: 'డాష్‌బోర్డ్‌లో లాగిన్', email: 'ఇమెయిల్', password: 'పాస్‌వర్డ్', secureSignIn: 'సురక్షిత సైన్ ఇన్', demoCredentials: 'డెమో ఆధారాలు', authenticating: 'ధృవీకరిస్తోంది...' },
  },
  mr: {
    ...ENGLISH,
    brandSubtitle: 'रेल्वे मंत्रालय - अखिल भारतीय स्वयंचलित ब्लॉक नियोजन', compliant: 'CRIS-अनुरूप', language: 'भाषा', corridor: 'कॉरिडॉर', role: 'भूमिका', askAi: 'AI ला विचारा', optimizer: 'AI ऑप्टिमायझर चालवा', solving: 'निराकरण सुरू आहे...', reset: 'रीसेट', demoTour: 'डेमो टूर सुरू करा', closeTour: 'टूर बंद करा', demoTourLabel: 'डेमो टूर', close: 'बंद करा', footer: 'मोनोकल इंजिन © स्मार्ट इंडिया हॅकाथॉन 2026', ministry: 'रेल्वे मंत्रालय (भारत सरकार) यांना समर्पित',
    groups: { operations: 'ऑपरेशन्स', intelligence: 'इंटेलिजन्स', compliance: 'अनुपालन' },
    nav: { COMMAND_CENTER: 'ऑपरेशन्स केंद्र', GIS_MAP: 'भौगोलिक GIS नकाशा', ML_SCORER: 'पटरी घसरण जोखीम स्कोअरर', GANTT: '24 तासांची गॅन्ट वेळापत्रक', STRING_CHART: 'वेळ-अंतर चार्ट', NATIONAL: 'अखिल भारतीय विभागीय ग्रिड', SIMULATION: 'काय-तर सिम्युलेटर', PTW: 'संघर्ष आणि PTW (PDF)', CALENDAR: '26 आठवड्यांचा क्षितिज' },
    tour: { COMMAND_CENTER: 'संपूर्ण ऑपरेशन्स चित्र आणि AI प्रभाव एका दृष्टीक्षेपात पहा.', GIS_MAP: 'स्टेशन, ट्रेन आणि ट्रॅक मालमत्ता नकाशावर पहा.', ML_SCORER: 'अंदाजित ट्रॅक जोखमीने देखभालीला प्राधान्य द्या.', GANTT: '24 तासांच्या वाहतूक योजनेसोबत देखभालीचा समन्वय करा.', STRING_CHART: 'वेळ आणि अंतरावरील ट्रेन मार्ग व ब्लॉक संघर्ष पहा.', NATIONAL: 'राष्ट्रीय रेल्वे विभागांची स्थिती तुलना करा.', SIMULATION: 'आपत्कालीन स्थितीपूर्वी कॉरिडॉरची चाचणी घ्या.', PTW: 'संघर्ष सोडवा आणि नियंत्रित कामाची परवानगी द्या.', CALENDAR: '26 आठवड्यांच्या देखभाल विंडोचे नियोजन करा.' },
    dashboard: { ...ENGLISH.dashboard, operationsCenter: 'ऑपरेशन्स कमांड सेंटर', crisisMode: 'संकट मोड सक्रिय', corridorOperational: 'कॉरिडॉर कार्यरत', manualVsAi: 'मॅन्युअल आणि AI योजना', decisionView: 'निर्णय दृश्य', manualScheduling: 'मॅन्युअल शेड्युलिंग', aiScheduling: 'AI-अनुकूलित शेड्युलिंग', baseline: 'बेसलाइन', recommended: 'शिफारस केलेले', activeConflicts: 'सक्रिय ट्रेन संघर्ष', passengerDelay: 'प्रवासी विलंब जोखीम', jointPossessions: 'संयुक्त ब्लॉक', liveMovement: 'लाइव्ह ट्रेन स्थिती', openMap: 'नकाशा उघडा', maintenanceWatchlist: 'देखभाल यादी', timeline: 'वेळापत्रक', scanRisk: 'मालमत्ता जोखीम तपासा', openRisk: 'जोखीम स्कोअरर उघडा', testDisruption: 'व्यत्यय तपासा', openSimulator: 'सिम्युलेटर उघडा', authorizeWork: 'सुरक्षित काम मंजूर करा', reviewConflicts: 'संघर्ष तपासा', exploreNetwork: 'कॉरिडॉर नेटवर्क पहा', metrics: { ...ENGLISH.dashboard.metrics, activeConflicts: 'सक्रिय ट्रेन संघर्ष', delaysAvoided: 'टाळलेला ट्रेन विलंब', jointBlocks: 'संयुक्त समक्रमित ब्लॉक', availability: 'मालमत्ता उपलब्धता वाढ' } },
    ui: { ...ENGLISH.ui, close: 'बंद करा', response: 'प्रतिसाद', newQuery: 'नवीन प्रश्न', suggestedQueries: 'सुचवलेले ऑपरेशन प्रश्न', affectedTrains: 'प्रभावित गाड्या', passengerImpact: 'प्रवासी परिणाम', authorityState: 'अधिकारी स्थिती', runDynamicResolve: 'डायनॅमिक पुन्हा निराकरण चालवा', runningCpsat: 'CP-SAT सुरू आहे...', responseGenerated: 'प्रतिसाद तयार', approveResponse: 'आपत्कालीन प्रतिसाद मंजूर करा', approvalRequired: 'मंजुरी आवश्यक', exportIncident: 'स्वाक्षरी केलेला अहवाल निर्यात करा', issueEmergencyPtw: 'आपत्कालीन PTW जारी करा', requested: 'विनंती केलेले', selected: 'निवडलेले', delayAvoided: 'टाळलेला विलंब', trainsProtected: 'संरक्षित गाड्या', nationalTitle: 'भारत नेटवर्क पुरावा दृश्य', measuredDelay: 'प्रति चक्र मोजलेली विलंब बचत', measuredJoint: 'प्रति चक्र संयुक्त ब्लॉक', runSolver: 'सॉल्वर चालवा', showMethod: 'पद्धत दाखवा', hideMethod: 'पद्धत लपवा', openSource: 'स्रोत उघडा', directory: 'निर्देशिका', login: 'डॅशबोर्डमध्ये लॉगिन', email: 'ईमेल', password: 'पासवर्ड', secureSignIn: 'सुरक्षित साइन इन', demoCredentials: 'डेमो क्रेडेन्शियल्स', authenticating: 'प्रमाणीकरण सुरू आहे...' },
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => window.localStorage.getItem('railsync-language') || 'en');
  const setLanguage = (nextLanguage) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem('railsync-language', nextLanguage);
  };
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  const value = useMemo(() => ({ language, setLanguage, t: TRANSLATIONS[language] || ENGLISH }), [language]);
  return createElement(LanguageContext.Provider, { value }, children);
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}
