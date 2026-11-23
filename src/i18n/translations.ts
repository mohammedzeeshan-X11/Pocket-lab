import type { LanguageCode, TeachingStrategy } from '../types/physics';

export interface TranslationBundle {
  brand: {
    name: string;
    tagline: string;
  };
  nav: {
    home: string;
    myLearning: string;
    explorePhysics: string;
    settings: string;
    menu: string;
  };
  languages: {
    en: string;
    kn: string;
    hi: string;
    selectorLabel: string;
  };
  hero: {
    kicker: string;
    headline: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    caption: string;
  };
  upload: {
    title: string;
    subtitle: string;
    dropHint: string;
    supportedFormats: string;
    browseButton: string;
    cameraButton: string;
    analyzeButton: string;
    analyzingLabel: string;
    uploadingLabel: string;
    replaceButton: string;
    removeButton: string;
    optimizingImage: string;
    readyToAnalyze: string;
    aiStatusReady: string;
    aiStatusMissingKey: string;
    unsupportedTypeError: string;
    fileReadError: string;
    fileTooLargeWarning: string;
    emptyUploadError: string;
  };
  sampleCard: {
    kicker: string;
    title: string;
    description: string;
    exploreConcepts: string;
    launchLab: string;
    includesLabel: string;
  };
  workflow: {
    heading: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
  };
  conceptExplorer: {
    title: string;
    subtitle: string;
    scannedPageBadge: string;
    builtInModuleBadge: string;
    subjectLabel: string;
    classLevelLabel: string;
    chapterLabel: string;
    topicLabel: string;
    confidenceLabel: string;
    summaryLabel: string;
    conceptsLabel: string;
    selectConceptPrompt: string;
    variablesLabel: string;
    symbolLabel: string;
    meaningLabel: string;
    unitsLabel: string;
    relationshipsLabel: string;
    equationsLabel: string;
    terminologyLabel: string;
    diagramsLabel: string;
    diagramComponentsLabel: string;
    diagramUnclearNote: string;
    extractedTextLabel: string;
    showExtractedText: string;
    hideExtractedText: string;
    uncertainContentHeading: string;
    simulationAvailableLabel: string;
    exploreSimulationBtn: string;
    explanationOnlyLabel: string;
    emptyTitle: string;
    emptyDescription: string;
    uploadPageBtn: string;
    openSampleModuleBtn: string;
    nonPhysicsWarning: string;
    backToDashboard: string;
    confidenceLevels: {
      high: string;
      medium: string;
      low: string;
    };
  };
  lab: {
    title: string;
    subtitle: string;
    mode2d: string;
    mode3d: string;
    play: string;
    pause: string;
    reset: string;
    resetCamera: string;
    fullscreen: string;
    exitFullscreen: string;
    parametersHeading: string;
    magnetAngleLabel: string;
    magnetPitchLabel: string;
    magneticStrengthLabel: string;
    showVectorGridLabel: string;
    showFieldLinesLabel: string;
    compassTelemetryHeading: string;
    fieldStrengthUnit: string;
    fieldAngleLabel: string;
    compassPositionLabel: string;
    dragCompassHint: string;
    orbit3dHint: string;
    conceptNotesHeading: string;
    northPole: string;
    southPole: string;
    dipoleEquationName: string;
    quickExplanation: string;
    keyTakeaway1: string;
    keyTakeaway2: string;
    keyTakeaway3: string;
    webglFallback: string;
    resetDefaults: string;
    compassXLabel: string;
    compassYLabel: string;
    liveResultsHeading: string;
    openControlsDrawerBtn: string;
    closeControlsDrawerBtn: string;
  };
  myLearning: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyDescription: string;
    openAnalysis: string;
    deleteEntry: string;
    featuredModuleTitle: string;
    featuredModuleDesc: string;
    launchLabBtn: string;
  };
  explorePhysics: {
    title: string;
    subtitle: string;
    availableNow: string;
    comingSoon: string;
    barMagnetTitle: string;
    barMagnetDesc: string;
    open2dLab: string;
    open3dLab: string;
    viewConcepts: string;
    upcoming1Title: string;
    upcoming1Desc: string;
    upcoming2Title: string;
    upcoming2Desc: string;
    upcoming3Title: string;
    upcoming3Desc: string;
  };
  settings: {
    title: string;
    subtitle: string;
    languageSection: string;
    languageHelp: string;
    simulationSection: string;
    defaultModeLabel: string;
    defaultVectorGridLabel: string;
    reducedMotionLabel: string;
    aiConnectionSection: string;
    aiConnectedText: string;
    aiNotConfiguredText: string;
    aiSecurityNote: string;
  };
  footer: {
    tagline: string;
    languagesNote: string;
  };
  explainability: {
    kicker: string;
    title: string;
    subtitle: string;
    explainButton: string;
    generatingLabel: string;
    listenBtn: string;
    stopListeningBtn: string;
    inspectObjectHeading: string;
    inspectObjectHint: string;
    clearSelection: string;
    objectCharacteristicsLabel: string;
    objectFunctionLabel: string;
    objectInteractionLabel: string;
    emptyPrompt: string;
    sectionA: string;
    sectionB: string;
    sectionC: string;
    sectionD: string;
    sectionE: string;
    sectionF: string;
    sectionG: string;
    sectionH: string;
    sectionI: string;
    sectionJ: string;
  };
  voiceTutor: {
    kicker: string;
    title: string;
    subtitle: string;
    returnDefaultSimBtn: string;
    recordButton: string;
    recordingLabel: string;
    stopButton: string;
    cancelButton: string;
    inputPlaceholder: string;
    thinkingLabel: string;
    sendButton: string;
    recordedClipLabel: string;
    discardAudioButton: string;
    yourQuestionLabel: string;
    tryAnotherButton: string;
    diagnosisConceptLabel: string;
    strategyLabel: string;
    whyPreviousHardLabel: string;
    personalizedExplanationLabel: string;
    adaptiveSimLabel: string;
    fallbackSimNotice: string;
    followUpLabel: string;
    sessionTrackedNote: string;
    focusedComponentLabel: string;
    contextualSuggestionsLabel: string;
    ttsVoiceUnavailable: string;
    micUnsupportedError: string;
    micPermissionDeniedError: string;
    micBlockedSettingsError: string;
    micNotFoundError: string;
    micBusyError: string;
    micInsecureContextError: string;
    micFormatError: string;
    recordingInterruptedError: string;
    emptyRecordingError: string;
    emptyQuestionError: string;
    requestingPermissionLabel: string;
    transcriptReadyLabel: string;
    streamingLabel: string;
    openTutorDrawerBtn: string;
    closeTutorDrawerBtn: string;
    transcribingLabel: string;
    preparingVoiceLabel: string;
    speakingLabel: string;
    pausedLabel: string;
    readyLabel: string;
    processingLabel: string;
    errorLabel: string;
    retryBtn: string;
    playBtn: string;
    pauseBtn: string;
    resumeBtn: string;
    replayBtn: string;
    stopVoiceBtn: string;
    transcriptPreviewHint: string;
    applySuggestionBtn: string;
    appliedSuggestionLabel: string;
    quickSimpler: string;
    quickStepByStep: string;
    quickRealLife: string;
    quickAnalogy: string;
    quickFormula: string;
    quickNumerical: string;
    quickComponent: string;
    quickRepeat: string;
    quickDetailed: string;
    explainInLangPrefix: string;
    welcomeTitle: string;
    welcomeHint: string;
    clearChatBtn: string;
    askPhysixAiTooltip: string;
    quickCompSimple: string;
    quickCompStepByStep: string;
    quickCompWhyUsed: string;
    quickCompChangeValue: string;
    quickCompRealExample: string;
    quickCompAnother: string;
    strategies: Record<TeachingStrategy, string>;
  };
  componentOverlay: {
    idleHint: string;
    clickAgainHint: string;
    deselectHint: string;
    closeBtn: string;
    refreshAiBtn: string;
    tailoringAiLabel: string;
    aiTailoredBadge: string;
    liveStateLabel: string;
    learnMoreBtn: string;
    showLessBtn: string;
    askPhysixAiBtn: string;
    interactivePartsLabel: string;
    firstOpenHint: string;
    dismissHintBtn: string;
    selectedPrefix: string;
    visualReferenceBadge: string;
    imageLoadingLabel: string;
    imageErrorLabel: string;
    retryImageBtn: string;
    fields: {
      definition: string;
      characteristics: string;
      function: string;
      scientificProperties: string;
      behaviour: string;
      relationshipWithOthers: string;
      realWorldExample: string;
      whyItMatters: string;
    };
  };
  classLibrary: {
    dashboardHeading: string;
    dashboardSubtitle: string;
    dashboardOpenClassBtn: string;
    classPrefix: string;
    title: string;
    tabClassLibrary: string;
    tabCoverageReport: string;
    statChapters: string;
    statChaptersShort: string;
    statInteractiveLabs: string;
    statCompleted: string;
    progressLabel: string;
    chaptersHeading: string;
    showAllChapters: string;
    activitiesUnit: string;
    filterHeading: string;
    clearFiltersBtn: string;
    searchPlaceholder: string;
    filterChapter: string;
    filterAllChapters: string;
    filterTopic: string;
    filterAllTopics: string;
    filterCategory: string;
    filterAllTypes: string;
    catPractical: string;
    catActivity: string;
    catConcept: string;
    catSupplementary: string;
    filterAvailability: string;
    filterAllModes: string;
    filterInteractiveOnly: string;
    filterStatus: string;
    filterAllStatus: string;
    filterCompleted: string;
    filterIncomplete: string;
    statusInteractive2d3d: string;
    statusInteractive2d: string;
    statusInteractive3d: string;
    statusExplanationOnly: string;
    statusComingSoon: string;
    verifiedNcertLabel: string;
    supplementaryLabel: string;
    needsVerificationLabel: string;
    sharedAcrossPrefix: string;
    launchLabBtn: string;
    openActivityGuideBtn: string;
    noResultsTitle: string;
    noResultsDesc: string;
    openClassBtn: string;
    coverageUniqueEnginesLabel: string;
    coverageZeroDuplicatesNote: string;
    coverageClassListingsLabel: string;
    coverageInteractiveListingsLabel: string;
    coverageRemainingLabel: string;
    coverageRemainingNote: string;
    coverageGradesLabel: string;
    coverageTableHeading: string;
    coverageColListed: string;
    coverageColImplemented: string;
    coverageColReused: string;
    coverageColVerification: string;
    coverageColAction: string;
    sharedEnginesHeading: string;
    defaultClassSettingLabel: string;
  };
  experimentLab: {
    backToClassLibrary: string;
    tabExperiment: string;
    tabIntroduction: string;
    tabObservations: string;
    tabAssessment: string;
    objectiveLabel: string;
    whyImportantLabel: string;
    realWorldLabel: string;
    apparatusLabel: string;
    procedureLabel: string;
    expectedOutcomeLabel: string;
    scientificExplanationLabel: string;
    gradeAdaptedHeading: string;
    observationsGuideLabel: string;
    observationPlaceholder: string;
    saveObservationBtn: string;
    markCompletedBtn: string;
    completedBadge: string;
    assessmentHeading: string;
    assessmentSubtitle: string;
    noQuestionsAvailable: string;
    questionKindConceptual: string;
    questionKindApplication: string;
    questionKindNumerical: string;
    submitQuizBtn: string;
    retakeQuizBtn: string;
    correctLabel: string;
    reviewLabel: string;
    scoreSavedLabel: string;
    lastScoreLabel: string;
    clickComponentTip: string;
  };
  dynamicLab: {
    generatedBadge: string;
    validatedExactBadge: string;
    validatedSimplifiedBadge: string;
    simplifiedModelHeading: string;
    saveToLibraryBtn: string;
    savedToLibraryBtn: string;
    generateExperimentBtn: string;
    openExistingLabBtn: string;
    reopenSavedLabBtn: string;
    savedGeneratedSectionTitle: string;
    savedGeneratedEmpty: string;
    deleteSavedLab: string;
    detectedApparatusLabel: string;
    registryExactMatchLabel: string;
    registryDynamicLabel: string;
    generatingHeading: string;
    generateFailedHeading: string;
  };
}

export const TRANSLATIONS: Record<LanguageCode, TranslationBundle> = {
  en: {
    brand: {
      name: 'Pocket Lab',
      tagline: 'Experience Physics. Understand Everything.',
    },
    nav: {
      home: 'Home',
      myLearning: 'My Learning',
      explorePhysics: 'Explore Physics',
      settings: 'Settings',
      menu: 'Menu',
    },
    languages: {
      en: 'English',
      kn: 'ಕನ್ನಡ',
      hi: 'हिन्दी',
      selectorLabel: 'Language',
    },
    hero: {
      kicker: 'Experience Physics. Understand Everything.',
      headline: 'Physics is better when you can see it.',
      description:
        'Turn your NCERT textbook into an interactive physics laboratory. Learn through simulations, experiments and explanations in your own language.',
      primaryCta: 'Bring Your Textbook to Life',
      secondaryCta: 'Explore Physics Lab',
      caption: 'Bar magnet dipole field · Compass deflection · 2D & 3D NCERT laboratory',
    },
    upload: {
      title: 'Upload Your NCERT Textbook Page',
      subtitle: 'Photograph or upload a clear page showing concepts, equations, or diagrams.',
      dropHint: 'Drag and drop a textbook page photo here, or choose a file',
      supportedFormats: 'Supports JPG, JPEG, PNG, and WEBP images',
      browseButton: 'Browse Files',
      cameraButton: 'Capture Photo',
      analyzeButton: 'Analyze Textbook',
      analyzingLabel: 'Analyzing concepts, equations, and diagrams...',
      uploadingLabel: 'Preparing textbook image...',
      replaceButton: 'Replace Image',
      removeButton: 'Remove',
      optimizingImage: 'Optimizing large image for crisp analysis...',
      readyToAnalyze: 'Textbook page ready for multimodal analysis',
      aiStatusReady: 'Multimodal textbook analyzer is connected and ready.',
      aiStatusMissingKey:
        'Server Gemini API key is not configured yet. Upload preview works now; configure GEMINI_API_KEY in Secrets to enable live textbook scanning.',
      unsupportedTypeError: 'Unsupported file type. Please choose a JPG, JPEG, PNG, or WEBP image.',
      fileReadError: 'Could not read this image file. Please try another photograph.',
      fileTooLargeWarning: 'Large smartphone photo automatically resized for crisp analysis.',
      emptyUploadError: 'Please upload a textbook page photograph before running analysis.',
    },
    sampleCard: {
      kicker: 'NCERT Class 10 · Chapter 13 / Class 12 · Chapter 5',
      title: 'Magnetic Field Around a Bar Magnet',
      description:
        'Move a compass needle around a bar magnet in 2D, rotate the magnet poles, adjust magnetic dipole strength, and inspect 3D closed field loops.',
      exploreConcepts: 'Explore Concepts',
      launchLab: 'Open Simulation Lab',
      includesLabel: '2D Compass Field · 3D Dipole Loops · EN / KN / HI',
    },
    workflow: {
      heading: 'From printed page to active experiment',
      step1Title: '01. Capture the textbook page',
      step1Desc: 'Photograph any NCERT Physics page from your phone or upload an existing image.',
      step2Title: '02. Inspect concepts & formulas',
      step2Desc: 'Review detected chapters, scientific definitions, equations, and diagrams in your chosen language.',
      step3Title: '03. Manipulate parameters live',
      step3Desc: 'Test magnetic orientation, field strength, and compass deflection in real-time 2D and 3D viewports.',
    },
    conceptExplorer: {
      title: 'Concept Explorer',
      subtitle: 'Structured breakdown of physics principles, equations, and visual diagrams.',
      scannedPageBadge: 'Analyzed Textbook Page',
      builtInModuleBadge: 'Curated NCERT Module',
      subjectLabel: 'Subject',
      classLevelLabel: 'Class / Grade',
      chapterLabel: 'Detected Chapter',
      topicLabel: 'Main Topic',
      confidenceLabel: 'Analysis Confidence',
      summaryLabel: 'Concept Overview',
      conceptsLabel: 'Identified Concepts',
      selectConceptPrompt: 'Select any concept below to inspect its equations, variables, units, and simulation status.',
      variablesLabel: 'Variables & Units',
      symbolLabel: 'Symbol',
      meaningLabel: 'Meaning',
      unitsLabel: 'Unit',
      relationshipsLabel: 'Relationships & Principle',
      equationsLabel: 'Relevant Equations',
      terminologyLabel: 'Scientific Terminology',
      diagramsLabel: 'Detected Diagrams',
      diagramComponentsLabel: 'Components',
      diagramUnclearNote: 'Part of this diagram appeared blurry or partially obstructed and could not be reliably interpreted.',
      extractedTextLabel: 'Visible Page Text',
      showExtractedText: 'Show Extracted Page Text',
      hideExtractedText: 'Hide Extracted Page Text',
      uncertainContentHeading: 'Partially Unclear Content Noted by Analyzer',
      simulationAvailableLabel: 'Interactive 2D & 3D Lab Ready',
      exploreSimulationBtn: 'Explore Simulation',
      explanationOnlyLabel: 'Explanation only — interactive simulation not yet available for this concept',
      emptyTitle: 'No textbook page analyzed yet',
      emptyDescription:
        'Upload a photograph of your NCERT Physics textbook to extract concepts, or open the built-in Bar Magnet curriculum module.',
      uploadPageBtn: 'Upload Textbook Page',
      openSampleModuleBtn: 'Open Bar Magnet Module',
      nonPhysicsWarning:
        'The uploaded image does not appear to contain readable physics textbook content. Try a clearer photo of a physics page.',
      backToDashboard: 'Back to Home',
      confidenceLevels: {
        high: 'High',
        medium: 'Medium',
        low: 'Low',
      },
    },
    lab: {
      title: 'Physics Simulation Lab',
      subtitle: 'Magnetic Field Around a Bar Magnet',
      mode2d: '2D',
      mode3d: '3D',
      play: 'Play',
      pause: 'Pause',
      reset: 'Reset',
      resetCamera: 'Reset Camera',
      fullscreen: 'Fullscreen',
      exitFullscreen: 'Exit Fullscreen',
      parametersHeading: 'Experimental Parameters',
      magnetAngleLabel: 'Magnet Rotation',
      magnetPitchLabel: 'Vertical Tilt (3D)',
      magneticStrengthLabel: 'Magnetic Strength',
      showVectorGridLabel: 'Show Vector Grid',
      showFieldLinesLabel: 'Show Field Lines',
      compassTelemetryHeading: 'Compass Probe Reading',
      fieldStrengthUnit: 'mT',
      fieldAngleLabel: 'Field Direction',
      compassPositionLabel: 'Probe Offset',
      dragCompassHint: 'Drag the brass compass anywhere around the magnet to measure local field direction.',
      orbit3dHint: 'Drag to orbit 3D view · Scroll or pinch to zoom · Adjust pole angles below.',
      conceptNotesHeading: 'Physics Explanation',
      northPole: 'North Pole (N)',
      southPole: 'South Pole (S)',
      dipoleEquationName: 'Magnetic Dipole Field',
      quickExplanation:
        'Magnetic field lines emerge from the North pole and curve smoothly around the magnet to enter the South pole, forming continuous closed loops through the interior.',
      keyTakeaway1: 'A compass needle always aligns tangent to the magnetic field line at its location, pointing away from N and toward S.',
      keyTakeaway2: 'Closer field lines near the poles indicate a stronger magnetic flux density B.',
      keyTakeaway3: 'Magnetic field magnitude decreases rapidly with distance (approximately proportional to 1/r³ for a dipole).',
      webglFallback: '3D WebGL view is unavailable in this browser context. Please use the interactive 2D Field View.',
      resetDefaults: 'Reset Defaults',
      compassXLabel: 'Compass X Position',
      compassYLabel: 'Compass Y Position',
      liveResultsHeading: 'Live Measurements & Results',
      openControlsDrawerBtn: 'Parameters & Results',
      closeControlsDrawerBtn: 'Done',
    },
    myLearning: {
      title: 'My Learning',
      subtitle: 'Your recently analyzed textbook pages and active physics laboratories on this device.',
      emptyTitle: 'No saved textbook scans yet',
      emptyDescription:
        'When you analyze an NCERT textbook page with Gemini AI, your extracted concepts and equations appear here for quick revision.',
      openAnalysis: 'Open Concepts',
      deleteEntry: 'Remove',
      featuredModuleTitle: 'Magnetic Field Around a Bar Magnet',
      featuredModuleDesc: 'Interactive 2D compass experiment and 3D dipole field visualization.',
      launchLabBtn: 'Launch Lab',
    },
    explorePhysics: {
      title: 'Explore Physics',
      subtitle: 'Interactive laboratories and NCERT curriculum modules.',
      availableNow: 'Interactive Simulation Available',
      comingSoon: 'Curriculum Preview · Explanation Only',
      barMagnetTitle: 'Magnetic Field Around a Bar Magnet',
      barMagnetDesc:
        'Investigate dipole field geometry, compass needle torque, pole strength, and 3D flux loops.',
      open2dLab: 'Launch 2D Lab',
      open3dLab: 'Launch 3D Lab',
      viewConcepts: 'Read Concepts',
      upcoming1Title: 'Electromagnetic Induction',
      upcoming1Desc: 'Faraday’s law, changing magnetic flux through a coil, and Lenz’s law direction.',
      upcoming2Title: 'Refraction Through a Glass Prism',
      upcoming2Desc: 'Snell’s law, angle of deviation, and wavelength dispersion across visible spectra.',
      upcoming3Title: 'Ohm’s Law & Series-Parallel Circuits',
      upcoming3Desc: 'Potential difference, drift current, and equivalent resistance relationships.',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Customize your learning language and laboratory defaults.',
      languageSection: 'Learning Language',
      languageHelp: 'Switch interface labels, concept explanations, and terminology between English, Kannada, and Hindi.',
      simulationSection: 'Simulation Lab Defaults',
      defaultModeLabel: 'Preferred Lab Viewport',
      defaultVectorGridLabel: 'Show vector field arrows in 2D by default',
      reducedMotionLabel: 'Reduce motion in simulations and transitions',
      aiConnectionSection: 'Textbook Analyzer Service',
      aiConnectedText: 'Server-side Gemini multimodal service is active and ready to analyze uploaded textbook images.',
      aiNotConfiguredText:
        'Server-side GEMINI_API_KEY is not configured yet. Add GEMINI_API_KEY in AI Studio Settings > Secrets to enable textbook image scanning.',
      aiSecurityNote: 'All Gemini API requests run securely through the backend server endpoint.',
    },
    footer: {
      tagline: 'Pocket Lab · Experience Physics. Understand Everything.',
      languagesNote: 'Available in English, ಕನ್ನಡ, and हिन्दी',
    },
    explainability: {
      kicker: 'AI Experiment Explainability',
      title: 'Understand What Is Happening Inside This Experiment',
      subtitle:
        'Generate a structured breakdown tailored to the live simulation state, active parameters, and textbook concepts.',
      explainButton: 'Explain',
      generatingLabel: 'Analyzing live simulation...',
      listenBtn: 'Listen to Explanation',
      stopListeningBtn: 'Stop Audio',
      inspectObjectHeading: 'Click an object in 2D/3D or select below to inspect',
      inspectObjectHint:
        'Tap the North Pole, South Pole, Bar Magnet body, Field Lines, or Compass Needle directly in the simulation or choose a part above.',
      clearSelection: 'Clear Selection',
      objectCharacteristicsLabel: 'Characteristics',
      objectFunctionLabel: 'Function in Experiment',
      objectInteractionLabel: 'Interactions & Parameter Response',
      emptyPrompt:
        'Click "Explain This Experiment" to analyze the current bar magnet orientation, field strength, compass reading, and scientific principles.',
      sectionA: 'What Are We Observing?',
      sectionB: 'Objects and Their Characteristics',
      sectionC: 'Important Components',
      sectionD: 'Scientific Principles',
      sectionE: 'How the Experiment Works',
      sectionF: 'Step-by-Step Explanation',
      sectionG: 'Important Equations & Variables',
      sectionH: 'Real-World Applications',
      sectionI: 'What Happens When Parameters Change?',
      sectionJ: 'Key Learning Outcomes',
    },
    voiceTutor: {
      kicker: 'Personalized Multilingual Voice Tutor',
      title: 'Ask Pocket Lab AI',
      subtitle:
        'Speak into your microphone or type a physics doubt in English, ಕನ್ನಡ, or हिन्दी. Pocket Lab AI diagnoses the exact sticking point and adapts the simulation.',
      returnDefaultSimBtn: 'Return to Default Lab',
      recordButton: 'Ask with Voice',
      recordingLabel: 'Listening',
      stopButton: 'Stop Recording',
      cancelButton: 'Cancel',
      inputPlaceholder: 'Ask why field lines never cross, how dipole strength works, or what changed...',
      thinkingLabel: 'Diagnosing & Adapting...',
      sendButton: 'Send Question',
      recordedClipLabel: 'Recorded Question',
      discardAudioButton: 'Discard',
      yourQuestionLabel: 'Your Question',
      tryAnotherButton: 'Try Another Explanation',
      diagnosisConceptLabel: 'Concept Focus',
      strategyLabel: 'Teaching Strategy Used',
      whyPreviousHardLabel: 'Why This Felt Confusing',
      personalizedExplanationLabel: 'Personalized Explanation',
      adaptiveSimLabel: 'Adaptive Simulation Loaded',
      fallbackSimNotice:
        'Loaded a closely related validated simulation module for safe interactive inspection.',
      followUpLabel: 'Quick Check for Understanding',
      sessionTrackedNote: 'Session progress (questions · strategies)',
      focusedComponentLabel: 'Selected Simulation Component',
      contextualSuggestionsLabel: 'Ask about this component',
      ttsVoiceUnavailable:
        'No natural speech voice is installed on this browser/OS for the selected language. The complete written explanation above remains ready to read.',
      micUnsupportedError:
        'Microphone recording is not supported in this browser. You can type your physics question directly.',
      micPermissionDeniedError:
        'Microphone permission was declined. Click the mic button to grant access or type your question below.',
      micBlockedSettingsError:
        'Microphone permission is blocked in your browser site settings. Enable microphone access from the browser address bar lock icon, then tap Retry.',
      micNotFoundError:
        'No microphone hardware was detected on this device. Connect a microphone or type your question below.',
      micBusyError:
        'Your microphone is currently in use by another app or tab. Close the other audio app and tap Retry.',
      micInsecureContextError:
        'Microphone access requires a secure HTTPS or localhost connection.',
      micFormatError:
        'Your browser could not encode a supported audio format. Please try again or type your question below.',
      recordingInterruptedError:
        'The microphone recording was interrupted before completion. Please try recording again or type your question.',
      emptyRecordingError:
        'No clear speech was captured in the recording. Hold recording while speaking near your mic, or type your question.',
      emptyQuestionError:
        'Please record a voice question or type your question before sending.',
      requestingPermissionLabel: 'Requesting mic permission...',
      transcriptReadyLabel: 'Transcription ready — review or send',
      streamingLabel: 'Responding...',
      openTutorDrawerBtn: 'Ask AI Tutor',
      closeTutorDrawerBtn: 'Close Tutor',
      transcribingLabel: 'Transcribing speech...',
      preparingVoiceLabel: 'Preparing voice...',
      speakingLabel: 'Speaking',
      pausedLabel: 'Paused',
      readyLabel: 'Ready',
      processingLabel: 'Processing...',
      errorLabel: 'Error',
      retryBtn: 'Retry',
      playBtn: 'Listen',
      pauseBtn: 'Pause',
      resumeBtn: 'Resume',
      replayBtn: 'Replay',
      stopVoiceBtn: 'Stop',
      transcriptPreviewHint: 'Review or edit your recognized question before sending.',
      applySuggestionBtn: 'Apply Suggested Visual Change',
      appliedSuggestionLabel: 'Applied to simulation',
      quickSimpler: 'Explain simply',
      quickStepByStep: 'Step-by-step',
      quickRealLife: 'Real-life example',
      quickAnalogy: 'Analogy',
      quickFormula: 'Explain formula',
      quickNumerical: 'Numerical example',
      quickComponent: 'Explain component',
      quickRepeat: 'Repeat',
      quickDetailed: 'Go deeper',
      explainInLangPrefix: 'Explain in',
      welcomeTitle: 'Your personal Physics AI Tutor',
      welcomeHint:
        'Interact with the simulation on the left, click any component, and ask questions by voice or text in English, ಕನ್ನಡ, or हिन्दी.',
      clearChatBtn: 'New chat',
      askPhysixAiTooltip: 'Ask Pocket Lab AI',
      quickCompSimple: 'Explain simply',
      quickCompStepByStep: 'Explain step by step',
      quickCompWhyUsed: 'Why is this component used?',
      quickCompChangeValue: 'What happens if I change this value?',
      quickCompRealExample: 'Give a real-life example',
      quickCompAnother: 'Ask another question',
      strategies: {
        simpler_explanation: 'Simpler Everyday Explanation',
        step_by_step: 'Step-by-Step Reasoning',
        real_world_analogy: 'Real-World Analogy',
        numerical_example: 'Numerical Calculation Example',
        visual_explanation: 'Visual Spatial Breakdown',
        detailed_scientific: 'Deep Scientific Derivation',
        alternative_experiment: 'Alternative Interactive Experiment',
      },
    },
    componentOverlay: {
      idleHint: 'Click any component to identify · Click again to explain',
      clickAgainHint: 'Explain component',
      deselectHint: 'Click empty canvas or press Esc to clear selection',
      closeBtn: 'Close',
      refreshAiBtn: 'Refresh AI explanation',
      tailoringAiLabel: 'Updating with live parameters...',
      aiTailoredBadge: 'AI Live Context',
      liveStateLabel: 'Live State',
      learnMoreBtn: 'Learn more',
      showLessBtn: 'Show less',
      askPhysixAiBtn: 'Ask Pocket Lab AI',
      interactivePartsLabel: 'interactive parts',
      firstOpenHint: 'Click any part inside the simulation to highlight and inspect it, or tap Pocket Lab AI at bottom-right.',
      dismissHintBtn: 'Got it',
      selectedPrefix: 'Selected',
      visualReferenceBadge: 'Lab reference visual · Generated studio illustration',
      imageLoadingLabel: 'Loading component reference visual...',
      imageErrorLabel: 'Component visual preview unavailable',
      retryImageBtn: 'Retry visual',
      fields: {
        definition: 'Overview',
        characteristics: 'Key Properties & Characteristics',
        function: 'Purpose in Experiment',
        scientificProperties: 'Scientific Working Principle',
        behaviour: 'How It Works Here',
        relationshipWithOthers: 'Relationship With Experiment',
        realWorldExample: 'Real-Life Example',
        whyItMatters: 'Why It Matters',
      },
    },
    classLibrary: {
      dashboardHeading: 'Choose Your NCERT Class (Classes 6–10)',
      dashboardSubtitle:
        'Select your class to explore aligned NCERT Physics chapters, hands-on interactive simulations, practical activities, and quizzes.',
      dashboardOpenClassBtn: 'Open Library',
      classPrefix: 'Class',
      title: 'NCERT Physics Learning Library',
      tabClassLibrary: 'Class Library',
      tabCoverageReport: 'Coverage Report (6–10)',
      statChapters: 'Physics Chapters',
      statChaptersShort: 'Physics ch.',
      statInteractiveLabs: 'Interactive Sims',
      statCompleted: 'Completed',
      progressLabel: 'Progress',
      chaptersHeading: 'Chapters with Physics Concepts',
      showAllChapters: 'Show All Chapters',
      activitiesUnit: 'modules',
      filterHeading: 'Search & Filter Experiments',
      clearFiltersBtn: 'Clear Filters',
      searchPlaceholder: 'Search topic, chapter, or experiment...',
      filterChapter: 'Filter by chapter',
      filterAllChapters: 'All Chapters',
      filterTopic: 'Filter by physics topic',
      filterAllTopics: 'All Topic Areas',
      filterCategory: 'Filter by type',
      filterAllTypes: 'All Entry Types',
      catPractical: 'Prescribed Practical',
      catActivity: 'NCERT Activity',
      catConcept: 'Concept Module',
      catSupplementary: 'Supplementary',
      filterAvailability: 'Filter by availability',
      filterAllModes: 'All Availability',
      filterInteractiveOnly: 'Interactive Labs Only',
      filterStatus: 'Filter by status',
      filterAllStatus: 'All Progress',
      filterCompleted: 'Completed',
      filterIncomplete: 'Not Completed',
      statusInteractive2d3d: 'Interactive 2D + 3D simulation available',
      statusInteractive2d: 'Interactive 2D simulation available',
      statusInteractive3d: 'Interactive 3D simulation available',
      statusExplanationOnly: 'Explanation & activity guide only',
      statusComingSoon: 'Planned interactive simulation · Study guide ready',
      verifiedNcertLabel: 'Verified NCERT',
      supplementaryLabel: 'Pocket Lab Supplementary',
      needsVerificationLabel: 'Edition Transition · Verify',
      sharedAcrossPrefix: 'Shared engine across',
      launchLabBtn: 'Launch Interactive Lab',
      openActivityGuideBtn: 'Open Activity & Quiz',
      noResultsTitle: 'No matching experiments found',
      noResultsDesc: 'Clear filters or try another chapter keyword.',
      openClassBtn: 'Open Class',
      coverageUniqueEnginesLabel: 'Unique Simulation Engines Implemented',
      coverageZeroDuplicatesNote: 'Centralized registry with zero duplicate implementations',
      coverageClassListingsLabel: 'Curriculum Listings (Classes 6–10)',
      coverageInteractiveListingsLabel: 'Interactive class cards served',
      coverageRemainingLabel: 'Coming Soon Modules',
      coverageRemainingNote: 'Explicitly separated from active simulations',
      coverageGradesLabel: 'Covered NCERT Grades',
      coverageTableHeading: 'Class-by-Class Physics & Simulation Coverage',
      coverageColListed: 'Listed Modules',
      coverageColImplemented: 'Interactive',
      coverageColReused: 'Reused Engines',
      coverageColVerification: 'Syllabus Status',
      coverageColAction: 'Browse',
      sharedEnginesHeading: 'Centralized Reusable Simulation Engines',
      defaultClassSettingLabel: 'Selected Student Class',
    },
    experimentLab: {
      backToClassLibrary: 'Back to Class Library',
      tabExperiment: 'Lab',
      tabIntroduction: 'Procedure',
      tabObservations: 'Observations',
      tabAssessment: 'Quiz',
      objectiveLabel: 'Learning Objective',
      whyImportantLabel: 'Why This Concept Matters',
      realWorldLabel: 'Real-World Application',
      apparatusLabel: 'Apparatus Used',
      procedureLabel: 'Step-by-Step Procedure',
      expectedOutcomeLabel: 'Expected Conclusion',
      scientificExplanationLabel: 'Scientific Principle & Explanation',
      gradeAdaptedHeading: 'Class-Specific Context',
      observationsGuideLabel: 'Key Things to Observe',
      observationPlaceholder: 'Record an observation from your live experiment (e.g., doubling resistance halved current)...',
      saveObservationBtn: 'Log Observation',
      markCompletedBtn: 'Mark Completed',
      completedBadge: 'Completed',
      assessmentHeading: 'Experiment Understanding Check',
      assessmentSubtitle: 'Test conceptual, application, and numerical understanding based on this experiment.',
      noQuestionsAvailable: 'No assessment questions listed for this module yet.',
      questionKindConceptual: 'Conceptual',
      questionKindApplication: 'Application',
      questionKindNumerical: 'Numerical',
      submitQuizBtn: 'Check Answers & Save Score',
      retakeQuizBtn: 'Retake Quiz',
      correctLabel: 'Correct',
      reviewLabel: 'Concept Review',
      scoreSavedLabel: 'Saved Quiz Score',
      lastScoreLabel: 'Best Saved Score',
      clickComponentTip: 'Click any component inside the simulation canvas to identify and click again to explain.',
    },
    dynamicLab: {
      generatedBadge: 'AI-Generated Interactive Lab',
      validatedExactBadge: 'Validated Deterministic Physics Model',
      validatedSimplifiedBadge: 'Educational Simplified Model',
      simplifiedModelHeading: 'Model Scope & Simplifications',
      saveToLibraryBtn: 'Save to Library',
      savedToLibraryBtn: 'Saved in Library',
      generateExperimentBtn: 'Generate & Launch Interactive Experiment',
      openExistingLabBtn: 'Open Existing NCERT Simulation',
      reopenSavedLabBtn: 'Reopen Saved Dynamic Lab',
      savedGeneratedSectionTitle: 'AI-Generated Experiments (Saved)',
      savedGeneratedEmpty: 'Scan any physics textbook page without an existing module to generate and save custom interactive experiments here.',
      deleteSavedLab: 'Remove generated lab',
      detectedApparatusLabel: 'Detected Apparatus & Setup',
      registryExactMatchLabel: 'Matched Verified NCERT Simulator',
      registryDynamicLabel: 'Custom Dynamic Experiment Ready',
      generatingHeading: 'Building Validated Physics Simulation',
      generateFailedHeading: 'Could not generate a validated simulation',
    },
  },
  kn: {
    brand: {
      name: 'Pocket Lab',
      tagline: 'ಭೌತಶಾಸ್ತ್ರವನ್ನು ಅನುಭವಿಸಿ. ಎಲ್ಲವನ್ನೂ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ.',
    },
    nav: {
      home: 'ಮುಖಪುಟ',
      myLearning: 'ನನ್ನ ಕಲಿಕೆ',
      explorePhysics: 'ಭೌತಶಾಸ್ತ್ರ ಅನ್ವೇಷಿಸಿ',
      settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
      menu: 'ಮೆನು',
    },
    languages: {
      en: 'English',
      kn: 'ಕನ್ನಡ',
      hi: 'हिन्दी',
      selectorLabel: 'ಭಾಷೆ',
    },
    hero: {
      kicker: 'ಭೌತಶಾಸ್ತ್ರವನ್ನು ಅನುಭವಿಸಿ. ಎಲ್ಲವನ್ನೂ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ.',
      headline: 'ನೀವು ನೋಡಿದಾಗ ಭೌತಶಾಸ್ತ್ರ ಇನ್ನಷ್ಟು ಸುಲಭವಾಗಿ ಅರ್ಥವಾಗುತ್ತದೆ.',
      description:
        'ನಿಮ್ಮ NCERT ಪಠ್ಯಪುಸ್ತಕವನ್ನು ಸಂವಾದಾತ್ಮಕ ಭೌತಶಾಸ್ತ್ರ ಪ್ರಯೋಗಾಲಯವಾಗಿ ಪರಿವರ್ತಿಸಿ. ನಿಮ್ಮದೇ ಭಾಷೆಯಲ್ಲಿ ಸಿಮ್ಯುಲೇಶನ್‌ಗಳು, ಪ್ರಯೋಗಗಳು ಮತ್ತು ವಿವರಣೆಗಳ ಮೂಲಕ ಕಲಿಯಿರಿ.',
      primaryCta: 'ಪಠ್ಯಪುಸ್ತಕವನ್ನು ಜೀವಂತಗೊಳಿಸಿ',
      secondaryCta: 'ಭೌತಶಾಸ್ತ್ರ ಪ್ರಯೋಗಾಲಯ',
      caption: 'ದಂಡ ಅಯಸ್ಕಾಂತ ಕ್ಷೇತ್ರ · ದಿಕ್ಸೂಚಿ ವಿಚಲನೆ · 2D ಮತ್ತು 3D NCERT ಪ್ರಯೋಗಾಲಯ',
    },
    upload: {
      title: 'ನಿಮ್ಮ NCERT ಪಠ್ಯಪುಸ್ತಕದ ಪುಟವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
      subtitle: 'ಪರಿಕಲ್ಪನೆಗಳು, ಸಮೀಕರಣಗಳು ಅಥವಾ ಚಿತ್ರಗಳನ್ನು ಹೊಂದಿರುವ ಸ್ಪಷ್ಟವಾದ ಪುಟದ ಫೋಟೋವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
      dropHint: 'ಪಠ್ಯಪುಸ್ತಕದ ಫೋಟೋವನ್ನು ಇಲ್ಲಿ ಎಳೆದು ಬಿಡಿ, ಅಥವಾ ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ',
      supportedFormats: 'JPG, JPEG, PNG ಮತ್ತು WEBP ಚಿತ್ರಗಳು ಮಾನ್ಯವಾಗಿವೆ',
      browseButton: 'ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ',
      cameraButton: 'ಫೋಟೋ ತೆಗೆಯಿರಿ',
      analyzeButton: 'ಪಠ್ಯಪುಸ್ತಕ ವಿಶ್ಲೇಷಿಸಿ',
      analyzingLabel: 'ಪರಿಕಲ್ಪನೆಗಳು, ಸಮೀಕರಣಗಳು ಮತ್ತು ಚಿತ್ರಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
      uploadingLabel: 'ಪಠ್ಯಪುಸ್ತಕದ ಚಿತ್ರವನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...',
      replaceButton: 'ಚಿತ್ರ ಬದಲಾಯಿಸಿ',
      removeButton: 'ತೆಗೆದುಹಾಕಿ',
      optimizingImage: 'ವೇಗದ ವಿಶ್ಲೇಷಣೆಗಾಗಿ ದೊಡ್ಡ ಚಿತ್ರವನ್ನು ಹೊಂದಿಸಲಾಗುತ್ತಿದೆ...',
      readyToAnalyze: 'ಪಠ್ಯಪುಸ್ತಕದ ಪುಟ ವಿಶ್ಲೇಷಣೆಗೆ ಸಿದ್ಧವಾಗಿದೆ',
      aiStatusReady: 'ಪಠ್ಯಪುಸ್ತಕ ವಿಶ್ಲೇಷಕ ಸಿದ್ಧವಾಗಿದೆ.',
      aiStatusMissingKey:
        'ಸರ್ವರ್‌ನಲ್ಲಿ GEMINI_API_KEY ಇನ್ನೂ ಸೆಟ್ ಆಗಿಲ್ಲ. ನೀವು ಈಗಲೂ ಅಯಸ್ಕಾಂತೀಯ ಸಿಮ್ಯುಲೇಶನ್ ಪ್ರಯೋಗಾಲಯವನ್ನು ಬಳಸಬಹುದು.',
      unsupportedTypeError: 'ಬೆಂಬಲವಿಲ್ಲದ ಫೈಲ್ ಪ್ರಕಾರ. ದಯವಿಟ್ಟು JPG, JPEG, PNG ಅಥವಾ WEBP ಚಿತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
      fileReadError: 'ಈ ಚಿತ್ರವನ್ನು ಓದಲಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಬೇರೆ ಫೋಟೋ ಪ್ರಯತ್ನಿಸಿ.',
      fileTooLargeWarning: 'ಸ್ಪಷ್ಟ ವಿಶ್ಲೇಷಣೆಗಾಗಿ ದೊಡ್ಡ ಫೋಟೋವನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಹೊಂದಿಸಲಾಗಿದೆ.',
      emptyUploadError: 'ವಿಶ್ಲೇಷಿಸುವ ಮೊದಲು ದಯವಿಟ್ಟು ಪಠ್ಯಪುಸ್ತಕದ ಪುಟದ ಫೋಟೋವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
    },
    sampleCard: {
      kicker: 'NCERT ತರಗತಿ 10 · ಅಧ್ಯಾಯ 13 / ತರಗತಿ 12 · ಅಧ್ಯಾಯ 5',
      title: 'ದಂಡ ಅಯಸ್ಕಾಂತದ ಸುತ್ತಲಿನ ಕಾಂತೀಯ ಕ್ಷೇತ್ರ',
      description:
        '2D ಯಲ್ಲಿ ದಂಡ ಅಯಸ್ಕಾಂತದ ಸುತ್ತ ದಿಕ್ಸೂಚಿಯನ್ನು ಚಲಿಸಿ, ಧ್ರುವಗಳನ್ನು ತಿರುಗಿಸಿ, ಕಾಂತೀಯ ಶಕ್ತಿಯನ್ನು ಬದಲಾಯಿಸಿ ಮತ್ತು 3D ಕ್ಷೇತ್ರ ರೇಖೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ.',
      exploreConcepts: 'ಪರಿಕಲ್ಪನೆಗಳನ್ನು ಓದಿ',
      launchLab: 'ಪ್ರಯೋಗಾಲಯ ತೆರೆಯಿರಿ',
      includesLabel: '2D ದಿಕ್ಸೂಚಿ · 3D ಕ್ಷೇತ್ರ ರೇಖೆಗಳು · EN / KN / HI',
    },
    workflow: {
      heading: 'ಮುದ್ರಿತ ಪುಟದಿಂದ ನೇರ ಪ್ರಯೋಗದವರೆಗೆ',
      step1Title: '01. ಪಠ್ಯಪುಸ್ತಕದ ಫೋಟೋ ತೆಗೆಯಿರಿ',
      step1Desc: 'ನಿಮ್ಮ ಫೋನ್‌ನಿಂದ NCERT ಭೌತಶಾಸ್ತ್ರದ ಪುಟದ ಫೋಟೋ ತೆಗೆಯಿರಿ ಅಥವಾ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
      step2Title: '02. ಪರಿಕಲ್ಪನೆ ಮತ್ತು ಸೂತ್ರಗಳನ್ನು ತಿಳಿಯಿರಿ',
      step2Desc: 'ಪತ್ತೆಯಾದ ಅಧ್ಯಾಯ, ವೈಜ್ಞಾನಿಕ ಪದಗಳು, ಸಮೀಕರಣಗಳು ಮತ್ತು ಚಿತ್ರಗಳನ್ನು ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಓದಿ.',
      step3Title: '03. ನೇರವಾಗಿ ಪ್ರಯೋಗ ಮಾಡಿ',
      step3Desc: '2D ಮತ್ತು 3D ಪರದೆಯಲ್ಲಿ ಅಯಸ್ಕಾಂತದ ದಿಕ್ಕು, ಶಕ್ತಿ ಮತ್ತು ದಿಕ್ಸೂಚಿ ಚಲನೆಯನ್ನು ಪರೀಕ್ಷಿಸಿ.',
    },
    conceptExplorer: {
      title: 'ಪರಿಕಲ್ಪನೆ ಅನ್ವೇಷಕ',
      subtitle: 'ಭೌತಶಾಸ್ತ್ರದ ತತ್ವಗಳು, ಸಮೀಕರಣಗಳು ಮತ್ತು ಚಿತ್ರಗಳ ಸ್ಪಷ್ಟ ವಿವರಣೆ.',
      scannedPageBadge: 'ವಿಶ್ಲೇಷಿಸಿದ ಪಠ್ಯಪುಸ್ತಕದ ಪುಟ',
      builtInModuleBadge: 'NCERT ಪಠ್ಯ ವಿಭಾಗ',
      subjectLabel: 'ವಿಷಯ',
      classLevelLabel: 'ತರಗತಿ',
      chapterLabel: 'ಪತ್ತೆಯಾದ ಅಧ್ಯಾಯ',
      topicLabel: 'ಮುಖ್ಯ ವಿಷಯ',
      confidenceLabel: 'ವಿಶ್ಲೇಷಣೆಯ ನಿಖರತೆ',
      summaryLabel: 'ಸಾರಾಂಶ',
      conceptsLabel: 'ಪ್ರಮುಖ ಪರಿಕಲ್ಪನೆಗಳು',
      selectConceptPrompt: 'ಸಮೀಕರಣಗಳು, ಚರಾಂಕಗಳು, ಏಕಮಾನಗಳು ಮತ್ತು ಸಿಮ್ಯುಲೇಶನ್ ಸ್ಥಿತಿಯನ್ನು ನೋಡಲು ಕೆಳಗಿನ ಪರಿಕಲ್ಪನೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
      variablesLabel: 'ಚರಾಂಕಗಳು ಮತ್ತು ಏಕಮಾನಗಳು',
      symbolLabel: 'ಚಿಹ್ನೆ',
      meaningLabel: 'ಅರ್ಥ',
      unitsLabel: 'ಏಕಮಾನ',
      relationshipsLabel: 'ಸಂಬಂಧಗಳು ಮತ್ತು ತತ್ವ',
      equationsLabel: 'ಸಂಬಂಧಿತ ಸಮೀಕರಣಗಳು',
      terminologyLabel: 'ವೈಜ್ಞಾನಿಕ ಪದಕೋಶ',
      diagramsLabel: 'ಪತ್ತೆಯಾದ ಚಿತ್ರಗಳು',
      diagramComponentsLabel: 'ಭಾಗಗಳು',
      diagramUnclearNote: 'ಈ ಚಿತ್ರದ ಕೆಲವು ಭಾಗಗಳು ಅಸ್ಪಷ್ಟವಾಗಿರುವುದರಿಂದ ಸಂಪೂರ್ಣವಾಗಿ ಓದಲಾಗಲಿಲ್ಲ.',
      extractedTextLabel: 'ಪುಟದಲ್ಲಿ ಕಂಡ ಪಠ್ಯ',
      showExtractedText: 'ಹೊರತೆಗೆದ ಪಠ್ಯವನ್ನು ತೋರಿಸಿ',
      hideExtractedText: 'ಹೊರತೆಗೆದ ಪಠ್ಯವನ್ನು ಮರೆಮಾಡಿ',
      uncertainContentHeading: 'ವಿಶ್ಲೇಷಣೆಯಲ್ಲಿ ಅಸ್ಪಷ್ಟವಾಗಿರುವ ಭಾಗಗಳು',
      simulationAvailableLabel: '2D ಮತ್ತು 3D ಪ್ರಯೋಗಾಲಯ ಸಿದ್ಧವಾಗಿದೆ',
      exploreSimulationBtn: 'ಸಿಮ್ಯುಲೇಶನ್ ಅನ್ವೇಷಿಸಿ',
      explanationOnlyLabel: 'ವಿವರಣೆ ಮಾತ್ರ — ಈ ಪರಿಕಲ್ಪನೆಗೆ ಸಂವಾದಾತ್ಮಕ ಸಿಮ್ಯುಲೇಶನ್ ಇನ್ನೂ ಲಭ್ಯವಿಲ್ಲ',
      emptyTitle: 'ಯಾವುದೇ ಪಠ್ಯಪುಸ್ತಕದ ಪುಟವನ್ನು ಇನ್ನೂ ವಿಶ್ಲೇಷಿಸಿಲ್ಲ',
      emptyDescription:
        'ಪರಿಕಲ್ಪನೆಗಳನ್ನು ಪಡೆಯಲು ನಿಮ್ಮ NCERT ಪುಸ್ತಕದ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, ಅಥವಾ ದಂಡ ಅಯಸ್ಕಾಂತದ ಪಾಠವನ್ನು ತೆರೆಯಿರಿ.',
      uploadPageBtn: 'ಪುಟ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
      openSampleModuleBtn: 'ದಂಡ ಅಯಸ್ಕಾಂತ ಪಾಠ ತೆರೆಯಿರಿ',
      nonPhysicsWarning:
        'ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಚಿತ್ರದಲ್ಲಿ ಭೌತಶಾಸ್ತ್ರದ ಪಠ್ಯ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಸ್ಪಷ್ಟವಾದ ಪಠ್ಯಪುಸ್ತಕದ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
      backToDashboard: 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',
      confidenceLevels: {
        high: 'ಉತ್ತಮ',
        medium: 'ಮಧ್ಯಮ',
        low: 'ಕಡಿಮೆ',
      },
    },
    lab: {
      title: 'ಭೌತಶಾಸ್ತ್ರ ಸಿಮ್ಯುಲೇಶನ್ ಪ್ರಯೋಗಾಲಯ',
      subtitle: 'ದಂಡ ಅಯಸ್ಕಾಂತದ ಸುತ್ತಲಿನ ಕಾಂತೀಯ ಕ್ಷೇತ್ರ',
      mode2d: '2D',
      mode3d: '3D',
      play: 'ಪ್ರಾರಂಭಿಸಿ',
      pause: 'ನಿಲ್ಲಿಸಿ',
      reset: 'ಮರುಹೊಂದಿಸಿ',
      resetCamera: 'ಕ್ಯಾಮೆರಾ ಮರುಹೊಂದಿಸಿ',
      fullscreen: 'ಪೂರ್ಣ ಪರದೆ',
      exitFullscreen: 'ಪೂರ್ಣ ಪರದೆಯಿಂದ ಹೊರಬನ್ನಿ',
      parametersHeading: 'ಪ್ರಯೋಗದ ನಿಯಂತ್ರಣಗಳು',
      magnetAngleLabel: 'ಅಯಸ್ಕಾಂತದ ತಿರುಗುವಿಕೆ',
      magnetPitchLabel: 'ಲಂಬ ಕೋನ (3D)',
      magneticStrengthLabel: 'ಕಾಂತೀಯ ಶಕ್ತಿ',
      showVectorGridLabel: 'ವೆಕ್ಟರ್ ಗ್ರಿಡ್ ತೋರಿಸಿ',
      showFieldLinesLabel: 'ಕ್ಷೇತ್ರ ರೇಖೆಗಳನ್ನು ತೋರಿಸಿ',
      compassTelemetryHeading: 'ದಿಕ್ಸೂಚಿ ಮಾಪನ',
      fieldStrengthUnit: 'mT',
      fieldAngleLabel: 'ಕ್ಷೇತ್ರದ ದಿಕ್ಕು',
      compassPositionLabel: 'ದಿಕ್ಸೂಚಿ ಸ್ಥಾನ',
      dragCompassHint: 'ಸ್ಥಳೀಯ ಕಾಂತೀಯ ಕ್ಷೇತ್ರದ ದಿಕ್ಕನ್ನು ಅಳೆಯಲು ದಿಕ್ಸೂಚಿಯನ್ನು ಅಯಸ್ಕಾಂತದ ಸುತ್ತ ಎಳೆಯಿರಿ.',
      orbit3dHint: 'ತಿರುಗಿಸಲು ಎಳೆಯಿರಿ · ಜೂಮ್ ಮಾಡಲು ಸ್ಕ್ರಾಲ್ ಮಾಡಿ · ಕೆಳಗಿನ ಸ್ಲೈಡರ್‌ಗಳಿಂದ ಧ್ರುವಗಳನ್ನು ತಿರುಗಿಸಿ.',
      conceptNotesHeading: 'ಭೌತಶಾಸ್ತ್ರದ ವಿವರಣೆ',
      northPole: 'ಉತ್ತರ ಧ್ರುವ (N)',
      southPole: 'ದಕ್ಷಿಣ ಧ್ರುವ (S)',
      dipoleEquationName: 'ಕಾಂತೀಯ ದ್ವಿಧ್ರುವಿ ಕ್ಷೇತ್ರ',
      quickExplanation:
        'ಕಾಂತೀಯ ಬಲ ರೇಖೆಗಳು ಉತ್ತರ ಧ್ರುವದಿಂದ (N) ಹೊರಹೊಮ್ಮಿ, ಹೊರಭಾಗದಲ್ಲಿ ಬಾಗಿ ದಕ್ಷಿಣ ಧ್ರುವವನ್ನು (S) ಪ್ರವೇಶಿಸುತ್ತವೆ ಮತ್ತು ಅಯಸ್ಕಾಂತದ ಒಳಭಾಗದಲ್ಲೂ ಮುಂದುವರೆದು ಮುಚ್ಚಿದ ಆವರ್ತಗಳನ್ನು ರಚಿಸುತ್ತವೆ.',
      keyTakeaway1: 'ದಿಕ್ಸೂಚಿ ಸೂಜಿಯು ಯಾವಾಗಲೂ ಆ ಬಿಂದುವಿನಲ್ಲಿನ ಕಾಂತೀಯ ಕ್ಷೇತ್ರ ರೇಖೆಗೆ ಸ್ಪರ್ಶಕವಾಗಿ (tangent) ನಿಲ್ಲುತ್ತದೆ.',
      keyTakeaway2: 'ಧ್ರುವಗಳ ಹತ್ತಿರ ಕ್ಷೇತ್ರ ರೇಖೆಗಳು ದಟ್ಟವಾಗಿದ್ದಷ್ಟೂ ಕಾಂತೀಯ ಕ್ಷೇತ್ರ B ಬಲವಾಗಿರುತ್ತದೆ.',
      keyTakeaway3: 'ಅಯಸ್ಕಾಂತದಿಂದ ದೂರ ಹೋದಂತೆ ಕಾಂತೀಯ ಕ್ಷೇತ್ರದ ತೀವ್ರತೆಯು ವೇಗವಾಗಿ ಕಡಿಮೆಯಾಗುತ್ತದೆ (ಸುಮಾರು 1/r³).',
      webglFallback: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ 3D WebGL ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು 2D ಕ್ಷೇತ್ರ ನೋಟವನ್ನು ಬಳಸಿ.',
      resetDefaults: 'ಮೂಲಸ್ಥಿತಿಗೆ ಮರುಹೊಂದಿಸಿ',
      compassXLabel: 'ದಿಕ್ಸೂಚಿ X ಸ್ಥಾನ',
      compassYLabel: 'ದಿಕ್ಸೂಚಿ Y ಸ್ಥಾನ',
      liveResultsHeading: 'ನೇರ ಅಳತೆಗಳು ಮತ್ತು ಫಲಿತಾಂಶಗಳು',
      openControlsDrawerBtn: 'ನಿಯಂತ್ರಣಗಳು ಮತ್ತು ಫಲಿತಾಂಶಗಳು',
      closeControlsDrawerBtn: 'ಮುಗಿಸಿ',
    },
    myLearning: {
      title: 'ನನ್ನ ಕಲಿಕೆ',
      subtitle: 'ಈ ಸಾಧನದಲ್ಲಿ ನೀವು ವಿಶ್ಲೇಷಿಸಿದ ಪಠ್ಯಪುಸ್ತಕದ ಪುಟಗಳು ಮತ್ತು ಸಕ್ರಿಯ ಪ್ರಯೋಗಗಳು.',
      emptyTitle: 'ಇನ್ನೂ ಯಾವುದೇ ವಿಶ್ಲೇಷಣೆಗಳನ್ನು ಉಳಿಸಲಾಗಿಲ್ಲ',
      emptyDescription:
        'ನೀವು NCERT ಪಠ್ಯಪುಸ್ತಕದ ಪುಟವನ್ನು ವಿಶ್ಲೇಷಿಸಿದಾಗ, ಅದರ ಪರಿಕಲ್ಪನೆಗಳು ಮತ್ತು ಸಮೀಕರಣಗಳು ಪುನರಾವರ್ತನೆಗಾಗಿ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.',
      openAnalysis: 'ಪರಿಕಲ್ಪನೆ ತೆರೆಯಿರಿ',
      deleteEntry: 'ತೆಗೆದುಹಾಕಿ',
      featuredModuleTitle: 'ದಂಡ ಅಯಸ್ಕಾಂತದ ಸುತ್ತಲಿನ ಕಾಂತೀಯ ಕ್ಷೇತ್ರ',
      featuredModuleDesc: '2D ದಿಕ್ಸೂಚಿ ಪ್ರಯೋಗ ಮತ್ತು 3D ಕಾಂತೀಯ ಕ್ಷೇತ್ರ ರೇಖೆಗಳ ದೃಶ್ಯೀಕರಣ.',
      launchLabBtn: 'ಪ್ರಯೋಗಾಲಯ ತೆರೆಯಿರಿ',
    },
    explorePhysics: {
      title: 'ಭೌತಶಾಸ್ತ್ರ ಅನ್ವೇಷಿಸಿ',
      subtitle: 'ಸಂವಾದಾತ್ಮಕ ಪ್ರಯೋಗಾಲಯಗಳು ಮತ್ತು NCERT ಪಠ್ಯಕ್ರಮದ ವಿಭಾಗಗಳು.',
      availableNow: 'ಸಂವಾದಾತ್ಮಕ ಸಿಮ್ಯುಲೇಶನ್ ಲಭ್ಯವಿದೆ',
      comingSoon: 'ಪಠ್ಯಕ್ರಮದ ಮುನ್ನೋಟ · ವಿವರಣೆ ಮಾತ್ರ',
      barMagnetTitle: 'ದಂಡ ಅಯಸ್ಕಾಂತದ ಸುತ್ತಲಿನ ಕಾಂತೀಯ ಕ್ಷೇತ್ರ',
      barMagnetDesc: 'ಕಾಂತೀಯ ಕ್ಷೇತ್ರ ರೇಖೆಗಳು, ದಿಕ್ಸೂಚಿ ವಿಚಲನೆ, ಧ್ರುವ ಬಲ ಮತ್ತು 3D ದ್ವಿಧ್ರುವಿ ಆವರ್ತಗಳನ್ನು ಅಧ್ಯಯನ ಮಾಡಿ.',
      open2dLab: '2D ಪ್ರಯೋಗಾಲಯ',
      open3dLab: '3D ಪ್ರಯೋಗಾಲಯ',
      viewConcepts: 'ಪರಿಕಲ್ಪನೆ ಓದಿ',
      upcoming1Title: 'ವಿದ್ಯುತ್ಕಾಂತೀಯ ಪ್ರೇರಣೆ (Electromagnetic Induction)',
      upcoming1Desc: 'ಫ್ಯಾರಡೆಯ ನಿಯಮ, ಬದಲಾಗುವ ಕಾಂತೀಯ ಫ್ಲಕ್ಸ್ ಮತ್ತು ಲೆಂಜ್‌ನ ನಿಯಮ.',
      upcoming2Title: 'ಗಾಜಿನ ಪ್ರಿಸಂ ಮೂಲಕ ವಕ್ರೀಭವನ',
      upcoming2Desc: 'ಸ್ನೆಲ್‌ನ ನಿಯಮ, ವಿಚಲನ ಕೋನ ಮತ್ತು ಬೆಳಕಿನ ವರ್ಣವಿಭಜನೆ.',
      upcoming3Title: 'ಓಮ್‌ನ ನಿಯಮ ಮತ್ತು ವಿದ್ಯುತ್ ಮಂಡಲಗಳು',
      upcoming3Desc: 'ವಿಭವಾಂತರ, ವಿದ್ಯುತ್ ಪ್ರವಾಹ ಮತ್ತು ಸಮಾನಾಂತರ-ಶ್ರೇಣಿ ರೋಧ.',
    },
    settings: {
      title: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
      subtitle: 'ನಿಮ್ಮ ಕಲಿಕೆಯ ಭಾಷೆ ಮತ್ತು ಪ್ರಯೋಗಾಲಯದ ಆದ್ಯತೆಗಳನ್ನು ಬದಲಾಯಿಸಿ.',
      languageSection: 'ಕಲಿಕೆಯ ಭಾಷೆ',
      languageHelp: 'ಎಲ್ಲಾ ವಿವರಣೆಗಳು, ಪದಗಳು ಮತ್ತು ನಿಯಂತ್ರಣಗಳನ್ನು ಇಂಗ್ಲಿಷ್, ಕನ್ನಡ ಅಥವಾ ಹಿಂದಿಯಲ್ಲಿ ವೀಕ್ಷಿಸಿ.',
      simulationSection: 'ಪ್ರಯೋಗಾಲಯದ ಆದ್ಯತೆಗಳು',
      defaultModeLabel: 'ಆದ್ಯತೆಯ ವೀಕ್ಷಣೆ',
      defaultVectorGridLabel: '2D ಯಲ್ಲಿ ವೆಕ್ಟರ್ ಬಾಣಗಳನ್ನು ಪೂರ್ವನಿಯೋಜಿತವಾಗಿ ತೋರಿಸಿ',
      reducedMotionLabel: 'ಅನಿಮೇಷನ್ ಚಲನೆಯನ್ನು ಕಡಿಮೆ ಮಾಡಿ',
      aiConnectionSection: 'ಪಠ್ಯಪುಸ್ತಕ ವಿಶ್ಲೇಷಕ ಸೇವೆ',
      aiConnectedText: 'ಸರ್ವರ್-ಸೈಡ್ Gemini ಸೇವೆ ಸಕ್ರಿಯವಾಗಿದೆ ಮತ್ತು ಪಠ್ಯಪುಸ್ತಕ ವಿಶ್ಲೇಷಣೆಗೆ ಸಿದ್ಧವಾಗಿದೆ.',
      aiNotConfiguredText: 'GEMINI_API_KEY ಇನ್ನೂ ಕಾನ್ಫಿಗರ್ ಆಗಿಲ್ಲ. AI Studio Secrets ನಲ್ಲಿ ಕೀ ಸೇರಿಸಿ.',
      aiSecurityNote: 'ಎಲ್ಲಾ AI ವಿನಂತಿಗಳು ಸುರಕ್ಷಿತವಾಗಿ ಬ್ಯಾಕೆಂಡ್ ಸರ್ವರ್ ಮೂಲಕ ನಡೆಯುತ್ತವೆ.',
    },
    footer: {
      tagline: 'Pocket Lab · ಭೌತಶಾಸ್ತ್ರವನ್ನು ಅನುಭವಿಸಿ. ಎಲ್ಲವನ್ನೂ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ.',
      languagesNote: 'English, ಕನ್ನಡ ಮತ್ತು हिन्दी ಭಾಷೆಗಳಲ್ಲಿ ಲಭ್ಯ',
    },
    explainability: {
      kicker: 'AI ಪ್ರಯೋಗ ವಿವರಣೆ ಎಂಜಿನ್',
      title: 'ಈ ಪ್ರಯೋಗದಲ್ಲಿ ಏನಾಗುತ್ತಿದೆ ಎಂಬುದನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ',
      subtitle:
        'ಪ್ರಸ್ತುತ ಸಿಮ್ಯುಲೇಶನ್ ಸ್ಥಿತಿ, ಸಕ್ರಿಯ ನಿಯಂತ್ರಣಗಳು ಮತ್ತು ಪಠ್ಯಪುಸ್ತಕದ ಪರಿಕಲ್ಪನೆಗಳಿಗೆ ಅನುಗುಣವಾಗಿ ಸ್ಪಷ್ಟ ವಿವರಣೆಯನ್ನು ಪಡೆಯಿರಿ.',
      explainButton: 'ವಿವರಿಸಿ',
      generatingLabel: 'ಸಿಮ್ಯುಲೇಶನ್ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
      listenBtn: 'ವಿವರಣೆ ಕೇಳಿ',
      stopListeningBtn: 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ',
      inspectObjectHeading: 'ಪರೀಕ್ಷಿಸಲು 2D/3D ಯಲ್ಲಿ ವಸ್ತುವನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ ಕೆಳಗೆ ಆಯ್ಕೆಮಾಡಿ',
      inspectObjectHint:
        'ಉತ್ತರ ಧ್ರುವ, ದಕ್ಷಿಣ ಧ್ರುವ, ದಂಡ ಅಯಸ್ಕಾಂತ, ಕ್ಷೇತ್ರ ರೇಖೆಗಳು ಅಥವಾ ದಿಕ್ಸೂಚಿ ಸೂಜಿಯನ್ನು ನೇರವಾಗಿ ಕ್ಲಿಕ್ ಮಾಡಿ.',
      clearSelection: 'ಆಯ್ಕೆ ತೆರವುಗೊಳಿಸಿ',
      objectCharacteristicsLabel: 'ಲಕ್ಷಣಗಳು',
      objectFunctionLabel: 'ಪ್ರಯೋಗದಲ್ಲಿನ ಕಾರ್ಯ',
      objectInteractionLabel: 'ಪರಸ್ಪರ ಕ್ರಿಯೆ ಮತ್ತು ನಿಯಂತ್ರಣ ಪ್ರತಿಕ್ರಿಯೆ',
      emptyPrompt:
        'ಪ್ರಸ್ತುತ ದಂಡ ಅಯಸ್ಕಾಂತದ ಕೋನ, ಶಕ್ತಿ, ದಿಕ್ಸೂಚಿ ಓದುವಿಕೆ ಮತ್ತು ವೈಜ್ಞಾನಿಕ ತತ್ವಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲು "ಈ ಪ್ರಯೋಗವನ್ನು ವಿವರಿಸಿ" ಕ್ಲಿಕ್ ಮಾಡಿ.',
      sectionA: 'ನಾವು ಏನನ್ನು ಗಮನಿಸುತ್ತಿದ್ದೇವೆ?',
      sectionB: 'ವಸ್ತುಗಳು ಮತ್ತು ಅವುಗಳ ಲಕ್ಷಣಗಳು',
      sectionC: 'ಪ್ರಮುಖ ಘಟಕಗಳು',
      sectionD: 'ವೈಜ್ಞಾನಿಕ ತತ್ವಗಳು',
      sectionE: 'ಪ್ರಯೋಗವು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ',
      sectionF: 'ಹಂತ-ಹಂತದ ವಿವರಣೆ',
      sectionG: 'ಪ್ರಮುಖ ಸಮೀಕರಣಗಳು ಮತ್ತು ಚರಾಂಕಗಳು',
      sectionH: 'ನಿಜ ಜೀವನದ ಅನ್ವಯಗಳು',
      sectionI: 'ನಿಯಂತ್ರಣಗಳನ್ನು ಬದಲಾಯಿಸಿದಾಗ ಏನಾಗುತ್ತದೆ?',
      sectionJ: 'ಪ್ರಮುಖ ಕಲಿಕೆಯ ಫಲಿತಾಂಶಗಳು',
    },
    voiceTutor: {
      kicker: 'ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ಬಹುಭಾಷಾ ಧ್ವನಿ ಶಿಕ್ಷಕ',
      title: 'Pocket Lab AI ಅನ್ನು ಕೇಳಿ',
      subtitle:
        'ಕನ್ನಡ, English ಅಥವಾ हिन्दी ಭಾಷೆಯಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಮಾತನಾಡಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ. Pocket Lab AI ನಿಮ್ಮ ಗೊಂದಲವನ್ನು ಗುರುತಿಸಿ ಸೂಕ್ತ ಪ್ರಯೋಗದೊಂದಿಗೆ ವಿವರಿಸುತ್ತದೆ.',
      returnDefaultSimBtn: 'ಮೂಲ ಪ್ರಯೋಗಕ್ಕೆ ಹಿಂತಿರುಗಿ',
      recordButton: 'ಧ್ವನಿಯ ಮೂಲಕ ಕೇಳಿ',
      recordingLabel: 'ಕೇಳಿಸಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ',
      stopButton: 'ರೆಕಾರ್ಡಿಂಗ್ ನಿಲ್ಲಿಸಿ',
      cancelButton: 'ರದ್ದುಮಾಡಿ',
      inputPlaceholder: 'ಕಾಂತೀಯ ಕ್ಷೇತ್ರ ರೇಖೆಗಳು ಏಕೆ ಪರಸ್ಪರ ಛೇದಿಸುವುದಿಲ್ಲ ಅಥವಾ ಶಕ್ತಿ ಹೇಗೆ ಬದಲಾಗುತ್ತದೆ ಎಂದು ಕೇಳಿ...',
      thinkingLabel: 'ವಿಶ್ಲೇಷಿಸಿ ಹೊಂದಿಸಲಾಗುತ್ತಿದೆ...',
      sendButton: 'ಪ್ರಶ್ನೆ ಕಳುಹಿಸಿ',
      recordedClipLabel: 'ರೆಕಾರ್ಡ್ ಮಾಡಿದ ಪ್ರಶ್ನೆ',
      discardAudioButton: 'ತೆಗೆದುಹಾಕಿ',
      yourQuestionLabel: 'ನಿಮ್ಮ ಪ್ರಶ್ನೆ',
      tryAnotherButton: 'ಬೇರೆ ರೀತಿಯಲ್ಲಿ ವಿವರಿಸಿ',
      diagnosisConceptLabel: 'ಕೇಂದ್ರೀಕೃತ ಪರಿಕಲ್ಪನೆ',
      strategyLabel: 'ಬಳಸಿದ ಬೋಧನಾ ವಿಧಾನ',
      whyPreviousHardLabel: 'ಗೊಂದಲಕ್ಕೆ ಕಾರಣವೇನಿರಬಹುದು',
      personalizedExplanationLabel: 'ವೈಯಕ್ತಿಕ ವಿವರಣೆ',
      adaptiveSimLabel: 'ಅನುವರ್ತಿತ ಸಿಮ್ಯುಲೇಶನ್ ಲೋಡ್ ಆಗಿದೆ',
      fallbackSimNotice:
        'ಸುರಕ್ಷಿತ ಸಂವಾದಾತ್ಮಕ ಪರಿಶೀಲನೆಗಾಗಿ ಹತ್ತಿರದ ಮಾನ್ಯ ಸಿಮ್ಯುಲೇಶನ್ ಅನ್ನು ತೆರೆಯಲಾಗಿದೆ.',
      followUpLabel: 'ಅರ್ಥವಾಗಿದೆಯೇ ಪರೀಕ್ಷಿಸಿ',
      sessionTrackedNote: 'ಅಧಿವೇಶನ ಪ್ರಗತಿ (ಪ್ರಶ್ನೆಗಳು · ವಿಧಾನಗಳು)',
      focusedComponentLabel: 'ಆಯ್ಕೆಮಾಡಿದ ಸಿಮ್ಯುಲೇಶನ್ ಭಾಗ',
      contextualSuggestionsLabel: 'ಈ ಭಾಗದ ಬಗ್ಗೆ ಕೇಳಿ',
      ttsVoiceUnavailable:
        'ಆಯ್ಕೆಮಾಡಿದ ಭಾಷೆಗೆ ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಉಚ್ಚಾರಣೆ ಲಭ್ಯವಿಲ್ಲ. ಮೇಲಿನ ಸಂಪೂರ್ಣ ಲಿಖಿತ ವಿವರಣೆಯನ್ನು ಓದಬಹುದು.',
      micUnsupportedError:
        'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮೈಕ್ರೊಫೋನ್ ರೆಕಾರ್ಡಿಂಗ್ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ.',
      micPermissionDeniedError:
        'ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿಯನ್ನು ನಿರಾಕರಿಸಲಾಗಿದೆ. ಅನುಮತಿ ನೀಡಲು ಮೈಕ್ ಒತ್ತಿ ಅಥವಾ ಕೆಳಗೆ ಟೈಪ್ ಮಾಡಿ.',
      micBlockedSettingsError:
        'ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಮೈಕ್ರೊಫೋನ್ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ವಿಳಾಸ ಪಟ್ಟಿಯ ಲಾಕ್ ಐಕಾನ್‌ನಿಂದ ಮೈಕ್ ಅನುಮತಿ ಆನ್ ಮಾಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
      micNotFoundError:
        'ಈ ಸಾಧನದಲ್ಲಿ ಯಾವುದೇ ಮೈಕ್ರೊಫೋನ್ ಕಂಡುಬಂದಿಲ್ಲ. ಮೈಕ್ ಸಂಪರ್ಕಿಸಿ ಅಥವಾ ಕೆಳಗೆ ಟೈಪ್ ಮಾಡಿ.',
      micBusyError:
        'ಮೈಕ್ರೊಫೋನ್ ಪ್ರಸ್ತುತ ಬೇರೆ ಆಪ್ ಅಥವಾ ಟ್ಯಾಬ್‌ನಲ್ಲಿ ಬಳಕೆಯಲ್ಲಿದೆ. ಅದನ್ನು ಮುಚ್ಚಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
      micInsecureContextError:
        'ಮೈಕ್ರೊಫೋನ್ ಬಳಸಲು ಸುರಕ್ಷಿತ HTTPS ಅಥವಾ localhost ಸಂಪರ್ಕ ಅಗತ್ಯವಿದೆ.',
      micFormatError:
        'ಬ್ರೌಸರ್ ಬೆಂಬಲಿತ ಆಡಿಯೋ ಫಾರ್ಮ್ಯಾಟ್ ರಚಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ.',
      recordingInterruptedError:
        'ರೆಕಾರ್ಡಿಂಗ್ ಪೂರ್ಣಗೊಳ್ಳುವ ಮೊದಲೇ ಅಡ್ಡಿಯಾಯಿತು. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ.',
      emptyRecordingError:
        'ರೆಕಾರ್ಡಿಂಗ್‌ನಲ್ಲಿ ಸ್ಪಷ್ಟ ಧ್ವನಿ ಕೇಳಿಸಲಿಲ್ಲ. ಮೈಕ್ ಹತ್ತಿರ ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ.',
      emptyQuestionError:
        'ಕಳುಹಿಸುವ ಮೊದಲು ದಯವಿಟ್ಟು ಧ್ವನಿ ಪ್ರಶ್ನೆಯನ್ನು ರೆಕಾರ್ಡ್ ಮಾಡಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ.',
      requestingPermissionLabel: 'ಮೈಕ್ ಅನುಮತಿ ಕೇಳಲಾಗುತ್ತಿದೆ...',
      transcriptReadyLabel: 'ಪಠ್ಯ ಸಿದ್ಧವಾಗಿದೆ — ಪರಿಶೀಲಿಸಿ ಕಳುಹಿಸಿ',
      streamingLabel: 'ಉತ್ತರಿಸುತ್ತಿದೆ...',
      openTutorDrawerBtn: 'AI ಶಿಕ್ಷಕರನ್ನು ಕೇಳಿ',
      closeTutorDrawerBtn: 'ಶಿಕ್ಷಕರ ಫಲಕ ಮುಚ್ಚಿ',
      transcribingLabel: 'ಧ್ವನಿಯನ್ನು ಪಠ್ಯವಾಗಿಸಲಾಗುತ್ತಿದೆ...',
      preparingVoiceLabel: 'ಧ್ವನಿ ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...',
      speakingLabel: 'ಮಾತನಾಡುತ್ತಿದೆ',
      pausedLabel: 'ವಿರಾಮದಲ್ಲಿದೆ',
      readyLabel: 'ಸಿದ್ಧವಾಗಿದೆ',
      processingLabel: 'ಪ್ರಕ್ರಿಯೆ ನಡೆಯುತ್ತಿದೆ...',
      errorLabel: 'ದೋಷ',
      retryBtn: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
      playBtn: 'ಕೇಳಿ',
      pauseBtn: 'ವಿರಾಮ',
      resumeBtn: 'ಮುಂದುವರಿಸಿ',
      replayBtn: 'ಮತ್ತೆ ಕೇಳಿ',
      stopVoiceBtn: 'ನಿಲ್ಲಿಸಿ',
      transcriptPreviewHint: 'ಕಳುಹಿಸುವ ಮೊದಲು ಗುರುತಿಸಿದ ಪ್ರಶ್ನೆಯನ್ನು ಪರಿಶೀಲಿಸಿ ಅಥವಾ ತಿದ್ದಿ.',
      applySuggestionBtn: 'ಸೂಚಿಸಿದ ದೃಶ್ಯ ಬದಲಾವಣೆ ಅನ್ವಯಿಸಿ',
      appliedSuggestionLabel: 'ಸಿಮ್ಯುಲೇಶನ್‌ಗೆ ಅನ್ವಯಿಸಲಾಗಿದೆ',
      quickSimpler: 'ಸರಳವಾಗಿ',
      quickStepByStep: 'ಹಂತ-ಹಂತವಾಗಿ',
      quickRealLife: 'ನಿಜ ಜೀವನದ ಉದಾಹರಣೆ',
      quickAnalogy: 'ಹೋಲಿಕೆ',
      quickFormula: 'ಸೂತ್ರ ವಿವರಿಸಿ',
      quickNumerical: 'ಲೆಕ್ಕ ಉದಾಹರಣೆ',
      quickComponent: 'ಆಯ್ದ ಭಾಗ ವಿವರಿಸಿ',
      quickRepeat: 'ಮತ್ತೆ ವಿವರಿಸಿ',
      quickDetailed: 'ಆಳವಾಗಿ',
      explainInLangPrefix: 'ಭಾಷೆಯಲ್ಲಿ ವಿವರಿಸಿ:',
      welcomeTitle: 'ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಭೌತಶಾಸ್ತ್ರ AI ಶಿಕ್ಷಕ',
      welcomeHint:
        'ಎಡಭಾಗದ ಪ್ರಯೋಗವನ್ನು ತಿರುಗಿಸಿ ಅಥವಾ ಭಾಗವನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ, ಕನ್ನಡ, English ಅಥವಾ हिन्दी ಭಾಷೆಯಲ್ಲಿ ಕೇಳಿ.',
      clearChatBtn: 'ಹೊಸ ಚಾಟ್',
      askPhysixAiTooltip: 'Pocket Lab AI ಅನ್ನು ಕೇಳಿ',
      quickCompSimple: 'ಸರಳವಾಗಿ ವಿವರಿಸಿ',
      quickCompStepByStep: 'ಹಂತ-ಹಂತವಾಗಿ ವಿವರಿಸಿ',
      quickCompWhyUsed: 'ಈ ಭಾಗವನ್ನು ಏಕೆ ಬಳಸಲಾಗುತ್ತದೆ?',
      quickCompChangeValue: 'ಈ ಮೌಲ್ಯವನ್ನು ಬದಲಾಯಿಸಿದರೆ ಏನಾಗುತ್ತದೆ?',
      quickCompRealExample: 'ನಿಜ ಜೀವನದ ಉದಾಹರಣೆ ನೀಡಿ',
      quickCompAnother: 'ಮತ್ತೊಂದು ಪ್ರಶ್ನೆ ಕೇಳಿ',
      strategies: {
        simpler_explanation: 'ಸರಳ ದೈನಂದಿನ ವಿವರಣೆ',
        step_by_step: 'ಹಂತ-ಹಂತದ ತಾರ್ಕಿಕ ವಿವರಣೆ',
        real_world_analogy: 'ನಿಜ ಜೀವನದ ಹೋಲಿಕೆ',
        numerical_example: 'ಸಂಖ್ಯಾತ್ಮಕ ಉದಾಹರಣೆ',
        visual_explanation: 'ದೃಶ್ಯ ಮತ್ತು ದಿಕ್ಕಿನ ವಿವರಣೆ',
        detailed_scientific: 'ಆಳವಾದ ವೈಜ್ಞಾನಿಕ ವಿಶ್ಲೇಷಣೆ',
        alternative_experiment: 'ಪರ್ಯಾಯ ಸಂವಾದಾತ್ಮಕ ಪ್ರಯೋಗ',
      },
    },
    componentOverlay: {
      idleHint: 'ಗುರುತಿಸಲು ಯಾವುದೇ ಭಾಗವನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ · ವಿವರಿಸಲು ಮತ್ತೊಮ್ಮೆ ಕ್ಲಿಕ್ ಮಾಡಿ',
      clickAgainHint: 'ಭಾಗವನ್ನು ವಿವರಿಸಿ',
      deselectHint: 'ಖಾಲಿ ಸ್ಥಳ ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ Esc ಒತ್ತಿ',
      closeBtn: 'ಮುಚ್ಚಿ',
      refreshAiBtn: 'ವಿವರಣೆ ನವೀಕರಿಸಿ',
      tailoringAiLabel: 'ಪ್ರಸ್ತುತ ಸ್ಥಿತಿಗೆ ಹೊಂದಿಸಲಾಗುತ್ತಿದೆ...',
      aiTailoredBadge: 'AI ನೇರ ಸಂದರ್ಭ',
      liveStateLabel: 'ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ',
      learnMoreBtn: 'ಹೆಚ್ಚು ತಿಳಿಯಿರಿ',
      showLessBtn: 'ಕಡಿಮೆ ತೋರಿಸಿ',
      askPhysixAiBtn: 'Pocket Lab AI ಕೇಳಿ',
      interactivePartsLabel: 'ಸಂವಾದಾತ್ಮಕ ಭಾಗಗಳು',
      firstOpenHint: 'ಪರೀಕ್ಷಿಸಲು ಸಿಮ್ಯುಲೇಶನ್ ಒಳಗಿನ ಯಾವುದೇ ಭಾಗವನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ ಬಲ-ಕೆಳಗಿನ Pocket Lab AI ಒತ್ತಿರಿ.',
      dismissHintBtn: 'ಸರಿ',
      selectedPrefix: 'ಆಯ್ಕೆ',
      visualReferenceBadge: 'ಪ್ರಯೋಗಾಲಯ ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಸ್ಟುಡಿಯೋ ಚಿತ್ರಣ',
      imageLoadingLabel: 'ಘಟಕದ ದೃಶ್ಯ ಉಲ್ಲೇಖ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      imageErrorLabel: 'ಘಟಕದ ದೃಶ್ಯ ಪೂರ್ವವೀಕ್ಷಣೆ ಲಭ್ಯವಾಗಲಿಲ್ಲ',
      retryImageBtn: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
      fields: {
        definition: 'ಸರಳ ವಿವರಣೆ',
        characteristics: 'ಪ್ರಮುಖ ಲಕ್ಷಣಗಳು',
        function: 'ಪ್ರಯೋಗದಲ್ಲಿನ ಉದ್ದೇಶ',
        scientificProperties: 'ವೈಜ್ಞಾನಿಕ ಕಾರ್ಯತತ್ವ',
        behaviour: 'ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ',
        relationshipWithOthers: 'ಪ್ರಯೋಗದೊಂದಿಗೆ ಸಂಬಂಧ',
        realWorldExample: 'ನಿಜ ಜೀವನದ ಉದಾಹರಣೆ',
        whyItMatters: 'ಇದು ಏಕೆ ಮುಖ್ಯ?',
      },
    },
    classLibrary: {
      dashboardHeading: 'ನಿಮ್ಮ NCERT ತರಗತಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ (ತರಗತಿ 6–10)',
      dashboardSubtitle:
        'ನಿಮ್ಮ ತರಗತಿಗೆ ಅನುಗುಣವಾದ NCERT ಭೌತಶಾಸ್ತ್ರ ಅಧ್ಯಾಯಗಳು, 2D/3D ಸಿಮ್ಯುಲೇಶನ್‌ಗಳು, ಚಟುವಟಿಕೆಗಳು ಮತ್ತು ರಸಪ್ರಶ್ನೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.',
      dashboardOpenClassBtn: 'ಪಾಠಶಾಲೆ ತೆರೆಯಿರಿ',
      classPrefix: 'ತರಗತಿ',
      title: 'NCERT ಭೌತಶಾಸ್ತ್ರ ಕಲಿಕಾ ಗ್ರಂಥಾಲಯ',
      tabClassLibrary: 'ತರಗತಿ ಗ್ರಂಥಾಲಯ',
      tabCoverageReport: 'ಪಠ್ಯಕ್ರಮ ವರದಿ (6–10)',
      statChapters: 'ಭೌತಶಾಸ್ತ್ರ ಅಧ್ಯಾಯಗಳು',
      statChaptersShort: 'ಅಧ್ಯಾಯಗಳು',
      statInteractiveLabs: 'ಸಂವಾದಾತ್ಮಕ ಪ್ರಯೋಗಗಳು',
      statCompleted: 'ಪೂರ್ಣಗೊಂಡವು',
      progressLabel: 'ಪ್ರಗತಿ',
      chaptersHeading: 'ಭೌತಶಾಸ್ತ್ರ ಪರಿಕಲ್ಪನೆಗಳ ಅಧ್ಯಾಯಗಳು',
      showAllChapters: 'ಎಲ್ಲಾ ಅಧ್ಯಾಯಗಳನ್ನು ತೋರಿಸಿ',
      activitiesUnit: 'ಪಾಠಗಳು',
      filterHeading: 'ಪ್ರಯೋಗಗಳನ್ನು ಹುಡುಕಿ ಮತ್ತು ಫಿಲ್ಟರ್ ಮಾಡಿ',
      clearFiltersBtn: 'ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ',
      searchPlaceholder: 'ವಿಷಯ, ಅಧ್ಯಾಯ ಅಥವಾ ಪ್ರಯೋಗ ಹುಡುಕಿ...',
      filterChapter: 'ಅಧ್ಯಾಯದ ಪ್ರಕಾರ',
      filterAllChapters: 'ಎಲ್ಲಾ ಅಧ್ಯಾಯಗಳು',
      filterTopic: 'ವಿಷಯದ ಪ್ರಕಾರ',
      filterAllTopics: 'ಎಲ್ಲಾ ವಿಷಯಗಳು',
      filterCategory: 'ವಿಧದ ಪ್ರಕಾರ',
      filterAllTypes: 'ಎಲ್ಲಾ ವಿಧಗಳು',
      catPractical: 'ನಿಗದಿತ ಪ್ರಾಯೋಗಿಕ',
      catActivity: 'NCERT ಚಟುವಟಿಕೆ',
      catConcept: 'ಪರಿಕಲ್ಪನೆ ಪಾಠ',
      catSupplementary: 'ಹೆಚ್ಚುವರಿ ಪಾಠ',
      filterAvailability: 'ಲಭ್ಯತೆ',
      filterAllModes: 'ಎಲ್ಲಾ ಲಭ್ಯತೆ',
      filterInteractiveOnly: 'ಸಂವಾದಾತ್ಮಕ ಪ್ರಯೋಗಗಳು ಮಾತ್ರ',
      filterStatus: 'ಸ್ಥಿತಿ',
      filterAllStatus: 'ಎಲ್ಲಾ ಸ್ಥಿತಿ',
      filterCompleted: 'ಪೂರ್ಣಗೊಂಡವು',
      filterIncomplete: 'ಬಾಕಿ ಇರುವವು',
      statusInteractive2d3d: '2D + 3D ಸಂವಾದಾತ್ಮಕ ಸಿಮ್ಯುಲೇಶನ್ ಲಭ್ಯವಿದೆ',
      statusInteractive2d: '2D ಸಂವಾದಾತ್ಮಕ ಸಿಮ್ಯುಲೇಶನ್ ಲಭ್ಯವಿದೆ',
      statusInteractive3d: '3D ಸಂವಾದಾತ್ಮಕ ಸಿಮ್ಯುಲೇಶನ್ ಲಭ್ಯವಿದೆ',
      statusExplanationOnly: 'ವಿವರಣೆ ಮತ್ತು ಚಟುವಟಿಕೆ ಮಾರ್ಗದರ್ಶಿ ಮಾತ್ರ',
      statusComingSoon: 'ಶೀಘ್ರದಲ್ಲೇ ಸಂವಾದಾತ್ಮಕ ಸಿಮ್ಯುಲೇಶನ್ ಬರಲಿದೆ',
      verifiedNcertLabel: 'ದೃಢೀಕೃತ NCERT',
      supplementaryLabel: 'Pocket Lab ಪೂರಕ',
      needsVerificationLabel: 'ಪಠ್ಯಕ್ರಮ ಪರಿಶೀಲಿಸಿ',
      sharedAcrossPrefix: 'ಹಂಚಿಕೆಯಾದ ತರಗತಿಗಳು',
      launchLabBtn: 'ಪ್ರಯೋಗಾಲಯ ತೆರೆಯಿರಿ',
      openActivityGuideBtn: 'ಚಟುವಟಿಕೆ ಮತ್ತು ರಸಪ್ರಶ್ನೆ',
      noResultsTitle: 'ಹೊಂದಾಣಿಕೆಯ ಪ್ರಯೋಗಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
      noResultsDesc: 'ಫಿಲ್ಟರ್‌ಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ ಅಥವಾ ಬೇರೆ ಪದವನ್ನು ಹುಡುಕಿ.',
      openClassBtn: 'ತರಗತಿ ತೆರೆಯಿರಿ',
      coverageUniqueEnginesLabel: 'ಅನನ್ಯ ಸಿಮ್ಯುಲೇಶನ್ ಎಂಜಿನ್‌ಗಳು',
      coverageZeroDuplicatesNote: 'ನಕಲುಗಳಿಲ್ಲದ ಕೇಂದ್ರೀಕೃತ ವ್ಯವಸ್ಥೆ',
      coverageClassListingsLabel: 'ಪಠ್ಯಕ್ರಮ ಪಟ್ಟಿಗಳು (ತರಗತಿ 6–10)',
      coverageInteractiveListingsLabel: 'ಸಂವಾದಾತ್ಮಕ ಪಾಠಗಳು',
      coverageRemainingLabel: 'ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿರುವವು',
      coverageRemainingNote: 'ಸಕ್ರಿಯ ಪ್ರಯೋಗಗಳಿಂದ ಪ್ರತ್ಯೇಕಿಸಲಾಗಿದೆ',
      coverageGradesLabel: 'ಒಳಗೊಂಡಿರುವ ತರಗತಿಗಳು',
      coverageTableHeading: 'ತರಗತಿ-ವಾರು ಭೌತಶಾಸ್ತ್ರ ಮತ್ತು ಸಿಮ್ಯುಲೇಶನ್ ವರದಿ',
      coverageColListed: 'ಪಟ್ಟಿ ಮಾಡಿದವು',
      coverageColImplemented: 'ಸಂವಾದಾತ್ಮಕ',
      coverageColReused: 'ಮರುಬಳಕೆ',
      coverageColVerification: 'ಪಠ್ಯಕ್ರಮ ಸ್ಥಿತಿ',
      coverageColAction: 'ತೆರೆಯಿರಿ',
      sharedEnginesHeading: 'ಕೇಂದ್ರೀಕೃತ ಮರುಬಳಕೆ ಸಿಮ್ಯುಲೇಶನ್ ಎಂಜಿನ್‌ಗಳು',
      defaultClassSettingLabel: 'ಆಯ್ಕೆಮಾಡಿದ ವಿದ್ಯಾರ್ಥಿ ತರಗತಿ',
    },
    experimentLab: {
      backToClassLibrary: 'ತರಗತಿ ಗ್ರಂಥಾಲಯಕ್ಕೆ ಹಿಂತಿರುಗಿ',
      tabExperiment: 'ಪ್ರಯೋಗ',
      tabIntroduction: 'ವಿಧಾನ',
      tabObservations: 'ವೀಕ್ಷಣೆಗಳು',
      tabAssessment: 'ರಸಪ್ರಶ್ನೆ',
      objectiveLabel: 'ಕಲಿಕೆಯ ಉದ್ದೇಶ',
      whyImportantLabel: 'ಈ ಪರಿಕಲ್ಪನೆ ಏಕೆ ಮುಖ್ಯ?',
      realWorldLabel: 'ನಿಜ ಜೀವನದ ಅನ್ವಯ',
      apparatusLabel: 'ಬಳಸುವ ಉಪಕರಣಗಳು',
      procedureLabel: 'ಹಂತ-ಹಂತದ ವಿಧಾನ',
      expectedOutcomeLabel: 'ನಿರೀಕ್ಷಿತ ಫಲಿತಾಂಶ',
      scientificExplanationLabel: 'ವೈಜ್ಞಾನಿಕ ತತ್ವ ಮತ್ತು ವಿವರಣೆ',
      gradeAdaptedHeading: 'ತರಗತಿಗೆ ಅನುಗುಣವಾದ ವಿವರ',
      observationsGuideLabel: 'ಗಮನಿಸಬೇಕಾದ ಅಂಶಗಳು',
      observationPlaceholder: 'ನಿಮ್ಮ ಪ್ರಯೋಗದ ವೀಕ್ಷಣೆಯನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ...',
      saveObservationBtn: 'ವೀಕ್ಷಣೆ ಉಳಿಸಿ',
      markCompletedBtn: 'ಪೂರ್ಣಗೊಂಡಿದೆ ಎಂದು ಗುರುತಿಸಿ',
      completedBadge: 'ಪೂರ್ಣಗೊಂಡಿದೆ',
      assessmentHeading: 'ಪ್ರಯೋಗ ತಿಳುವಳಿಕೆ ಪರೀಕ್ಷೆ',
      assessmentSubtitle: 'ಈ ಪ್ರಯೋಗದ ಆಧಾರದ ಮೇಲೆ ಪರಿಕಲ್ಪನೆ ಮತ್ತು ಸಂಖ್ಯಾತ್ಮಕ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ.',
      noQuestionsAvailable: 'ಈ ಪಾಠಕ್ಕೆ ಇನ್ನೂ ಪ್ರಶ್ನೆಗಳನ್ನು ಸೇರಿಸಲಾಗಿಲ್ಲ.',
      questionKindConceptual: 'ಪರಿಕಲ್ಪನಾತ್ಮಕ',
      questionKindApplication: 'ಅನ್ವಯಿಕ',
      questionKindNumerical: 'ಸಂಖ್ಯಾತ್ಮಕ',
      submitQuizBtn: 'ಉತ್ತರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಉಳಿಸಿ',
      retakeQuizBtn: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
      correctLabel: 'ಸರಿಯಾದ ಉತ್ತರ',
      reviewLabel: 'ಪರಿಕಲ್ಪನೆ ವಿವರಣೆ',
      scoreSavedLabel: 'ಉಳಿಸಿದ ಅಂಕಗಳು',
      lastScoreLabel: 'ಹಿಂದಿನ ಅಂಕಗಳು',
      clickComponentTip: 'ಗುರುತಿಸಲು ಸಿಮ್ಯುಲೇಶನ್‌ನಲ್ಲಿ ಯಾವುದೇ ಭಾಗವನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ ಮತ್ತು ವಿವರಣೆಗೆ ಮತ್ತೊಮ್ಮೆ ಕ್ಲಿಕ್ ಮಾಡಿ.',
    },
    dynamicLab: {
      generatedBadge: 'AI-ನಿರ್ಮಿತ ಸಂವಾದಾತ್ಮಕ ಪ್ರಯೋಗಾಲಯ',
      validatedExactBadge: 'ಪ್ರಮಾಣೀಕೃತ ಭೌತಶಾಸ್ತ್ರ ಮಾದರಿ',
      validatedSimplifiedBadge: 'ಸರಳೀಕೃತ ಶೈಕ್ಷಣಿಕ ಮಾದರಿ',
      simplifiedModelHeading: 'ಮಾದರಿಯ ವ್ಯಾಪ್ತಿ ಮತ್ತು ಮಿತಿಗಳು',
      saveToLibraryBtn: 'ಲೈಬ್ರರಿಯಲ್ಲಿ ಉಳಿಸಿ',
      savedToLibraryBtn: 'ಲೈಬ್ರರಿಯಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ',
      generateExperimentBtn: 'ಸಂವಾದಾತ್ಮಕ ಪ್ರಯೋಗವನ್ನು ರಚಿಸಿ ಮತ್ತು ತೆರೆಯಿರಿ',
      openExistingLabBtn: 'ಅಸ್ತಿತ್ವದಲ್ಲಿರುವ NCERT ಪ್ರಯೋಗ ತೆರೆಯಿರಿ',
      reopenSavedLabBtn: 'ಉಳಿಸಿದ AI ಪ್ರಯೋಗವನ್ನು ಮತ್ತೆ ತೆರೆಯಿರಿ',
      savedGeneratedSectionTitle: 'AI-ರಚಿತ ಪ್ರಯೋಗಗಳು (ಉಳಿಸಿದವು)',
      savedGeneratedEmpty: 'ಲಭ್ಯವಿಲ್ಲದ ಪಠ್ಯಪುಸ್ತಕ ಪ್ರಯೋಗದ ಪುಟವನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಹೊಸ ಸಂವಾದಾತ್ಮಕ ಪ್ರಯೋಗಗಳನ್ನು ಇಲ್ಲಿ ಉಳಿಸಿ.',
      deleteSavedLab: 'ರಚಿತ ಪ್ರಯೋಗವನ್ನು ಅಳಿಸಿ',
      detectedApparatusLabel: 'ಗುರುತಿಸಿದ ಉಪಕರಣಗಳು ಮತ್ತು ವಿನ್ಯಾಸ',
      registryExactMatchLabel: 'ಹೊಂದಾಣಿಕೆಯಾದ NCERT ಸಿಮ್ಯುಲೇಟರ್ ಕಂಡುಬಂದಿದೆ',
      registryDynamicLabel: 'ಕಸ್ಟಮ್ ಸಂವಾದಾತ್ಮಕ ಪ್ರಯೋಗ ಸಿದ್ಧವಾಗಿದೆ',
      generatingHeading: 'ಪ್ರಮಾಣೀಕೃತ ಭೌತಶಾಸ್ತ್ರ ಸಿಮ್ಯುಲೇಶನ್ ನಿರ್ಮಿಸಲಾಗುತ್ತಿದೆ',
      generateFailedHeading: 'ಪ್ರಮಾಣೀಕೃತ ಪ್ರಯೋಗವನ್ನು ರಚಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ',
    },
  },
  hi: {
    brand: {
      name: 'Pocket Lab',
      tagline: 'भौतिकी को अनुभव करें। सब कुछ समझें।',
    },
    nav: {
      home: 'होम',
      myLearning: 'मेरा अध्ययन',
      explorePhysics: 'भौतिकी खोजें',
      settings: 'सेटिंग्स',
      menu: 'मेनू',
    },
    languages: {
      en: 'English',
      kn: 'ಕನ್ನಡ',
      hi: 'हिन्दी',
      selectorLabel: 'भाषा',
    },
    hero: {
      kicker: 'भौतिकी को अनुभव करें। सब कुछ समझें।',
      headline: 'जब आप भौतिकी को देख सकते हैं, तो वह और बेहतर समझ आती है।',
      description:
        'अपनी NCERT पाठ्यपुस्तक को एक इंटरैक्टिव भौतिकी प्रयोगशाला में बदलें। अपनी भाषा में सिमुलेशन, प्रयोग और सरल व्याख्याओं के माध्यम से सीखें।',
      primaryCta: 'अपनी किताब को जीवंत बनाएं',
      secondaryCta: 'भौतिकी लैब देखें',
      caption: 'छड़ चुंबक का द्विध्रुव क्षेत्र · दिक्सूचक विक्षेप · 2D और 3D NCERT प्रयोगशाला',
    },
    upload: {
      title: 'अपना NCERT पाठ्यपुस्तक पृष्ठ अपलोड करें',
      subtitle: 'संकल्पनाओं, समीकरणों या चित्रों वाले पृष्ठ की स्पष्ट तस्वीर अपलोड करें।',
      dropHint: 'यहाँ पाठ्यपुस्तक की तस्वीर खींचकर छोड़ें, या फ़ाइल चुनें',
      supportedFormats: 'JPG, JPEG, PNG और WEBP प्रारूप समर्थित हैं',
      browseButton: 'फ़ाइल चुनें',
      cameraButton: 'फ़ोटो लें',
      analyzeButton: 'पाठ्यपुस्तक का विश्लेषण करें',
      analyzingLabel: 'अवधारणाओं, समीकरणों और चित्रों का विश्लेषण हो रहा है...',
      uploadingLabel: 'पाठ्यपुस्तक छवि तैयार की जा रही है...',
      replaceButton: 'छवि बदलें',
      removeButton: 'हटाएं',
      optimizingImage: 'तेज़ विश्लेषण के लिए बड़ी छवि को समायोजित किया जा रहा है...',
      readyToAnalyze: 'पाठ्यपुस्तक पृष्ठ विश्लेषण के लिए तैयार है',
      aiStatusReady: 'पाठ्यपुस्तक विश्लेषक सेवा सक्रिय और तैयार है।',
      aiStatusMissingKey:
        'सर्वर पर GEMINI_API_KEY अभी सेट नहीं है। आप अभी भी चुंबकीय क्षेत्र सिमुलेशन लैब का उपयोग कर सकते हैं।',
      unsupportedTypeError: 'असमर्थित फ़ाइल प्रकार। कृपया JPG, JPEG, PNG या WEBP छवि चुनें।',
      fileReadError: 'इस छवि को पढ़ा नहीं जा सका। कृपया कोई दूसरी तस्वीर चुनें।',
      fileTooLargeWarning: 'स्पष्ट विश्लेषण के लिए बड़ी छवि का आकार स्वचालित रूप से समायोजित किया गया है।',
      emptyUploadError: 'विश्लेषण शुरू करने से पहले कृपया पाठ्यपुस्तक पृष्ठ की तस्वीर अपलोड करें।',
    },
    sampleCard: {
      kicker: 'NCERT कक्षा 10 · अध्याय 13 / कक्षा 12 · अध्याय 5',
      title: 'छड़ चुंबक के चारों ओर चुंबकीय क्षेत्र',
      description:
        '2D में छड़ चुंबक के चारों ओर कंपास सुई घुमाएं, ध्रुवों का कोण और चुंबकीय शक्ति बदलें, तथा 3D बंद क्षेत्र रेखाओं का निरीक्षण करें।',
      exploreConcepts: 'अवधारणाएं पढ़ें',
      launchLab: 'सिमुलेशन लैब खोलें',
      includesLabel: '2D कंपास क्षेत्र · 3D द्विध्रुव लूप · EN / KN / HI',
    },
    workflow: {
      heading: 'छपे हुए पृष्ठ से जीवंत प्रयोग तक',
      step1Title: '01. पाठ्यपुस्तक पृष्ठ की तस्वीर लें',
      step1Desc: 'अपने फ़ोन से किसी भी NCERT भौतिकी पृष्ठ की तस्वीर लें या अपलोड करें।',
      step2Title: '02. अवधारणाएं और सूत्र समझें',
      step2Desc: 'पहचाने गए अध्याय, वैज्ञानिक शब्दावली, समीकरण और आरेख अपनी भाषा में देखें।',
      step3Title: '03. मापदंडों को लाइव बदलें',
      step3Desc: '2D और 3D लैब में चुंबक की दिशा, शक्ति और कंपास विक्षेप का प्रयोग करें।',
    },
    conceptExplorer: {
      title: 'अवधारणा एक्सप्लोरर',
      subtitle: 'भौतिकी के सिद्धांतों, समीकरणों और आरेखों का व्यवस्थित विवरण।',
      scannedPageBadge: 'विश्लेषित पाठ्यपुस्तक पृष्ठ',
      builtInModuleBadge: 'NCERT पाठ्यक्रम मॉड्यूल',
      subjectLabel: 'विषय',
      classLevelLabel: 'कक्षा',
      chapterLabel: 'पहचाना गया अध्याय',
      topicLabel: 'मुख्य विषय',
      confidenceLabel: 'विश्लेषण सटीकता',
      summaryLabel: 'सारांश',
      conceptsLabel: 'प्रमुख अवधारणाएं',
      selectConceptPrompt: 'समीकरण, चर, मात्रक और सिमुलेशन स्थिति देखने के लिए नीचे किसी भी अवधारणा को चुनें।',
      variablesLabel: 'चर और मात्रक',
      symbolLabel: 'प्रतीक',
      meaningLabel: 'अर्थ',
      unitsLabel: 'मात्रक',
      relationshipsLabel: 'संबंध और सिद्धांत',
      equationsLabel: 'संबंधित समीकरण',
      terminologyLabel: 'वैज्ञानिक शब्दावली',
      diagramsLabel: 'पहचाने गए आरेख',
      diagramComponentsLabel: 'मुख्य भाग',
      diagramUnclearNote: 'इस आरेख का कुछ हिस्सा धुंधला था और विश्वसनीय रूप से पढ़ा नहीं जा सका।',
      extractedTextLabel: 'पृष्ठ का पठित पाठ',
      showExtractedText: 'पठित पाठ दिखाएं',
      hideExtractedText: 'पठित पाठ छिपाएं',
      uncertainContentHeading: 'विश्लेषण में आंशिक रूप से अस्पष्ट सामग्री',
      simulationAvailableLabel: '2D और 3D सिमुलेशन लैब तैयार',
      exploreSimulationBtn: 'सिमुलेशन देखें',
      explanationOnlyLabel: 'केवल व्याख्या — इस अवधारणा के लिए इंटरैक्टिव सिमुलेशन अभी उपलब्ध नहीं है',
      emptyTitle: 'अभी कोई पाठ्यपुस्तक पृष्ठ विश्लेषित नहीं है',
      emptyDescription:
        'अवधारणाएं निकालने के लिए अपनी NCERT भौतिकी पुस्तक की तस्वीर अपलोड करें, या छड़ चुंबक मॉड्यूल खोलें।',
      uploadPageBtn: 'पृष्ठ अपलोड करें',
      openSampleModuleBtn: 'छड़ चुंबक मॉड्यूल खोलें',
      nonPhysicsWarning:
        'अपलोड की गई छवि में पठनीय भौतिकी सामग्री नहीं दिख रही है। कृपया स्पष्ट तस्वीर के साथ पुनः प्रयास करें।',
      backToDashboard: 'होम पर वापस जाएं',
      confidenceLevels: {
        high: 'उच्च',
        medium: 'मध्यम',
        low: 'कम',
      },
    },
    lab: {
      title: 'भौतिकी सिमुलेशन प्रयोगशाला',
      subtitle: 'छड़ चुंबक के चारों ओर चुंबकीय क्षेत्र',
      mode2d: '2D',
      mode3d: '3D',
      play: 'चलाएं',
      pause: 'रोकें',
      reset: 'रीसेट करें',
      resetCamera: 'कैमरा रीसेट करें',
      fullscreen: 'पूर्ण स्क्रीन',
      exitFullscreen: 'पूर्ण स्क्रीन बंद करें',
      parametersHeading: 'प्रयोग के मापदंड',
      magnetAngleLabel: 'चुंबक का घूर्णन',
      magnetPitchLabel: 'ऊर्ध्वाधर झुकाव (3D)',
      magneticStrengthLabel: 'चुंबकीय शक्ति',
      showVectorGridLabel: 'सदिश ग्रिड दिखाएं',
      showFieldLinesLabel: 'क्षेत्र रेखाएं दिखाएं',
      compassTelemetryHeading: 'कंपास मापन',
      fieldStrengthUnit: 'mT',
      fieldAngleLabel: 'क्षेत्र की दिशा',
      compassPositionLabel: 'कंपास स्थिति',
      dragCompassHint: 'स्थानीय चुंबकीय क्षेत्र की दिशा देखने के लिए पीतल के कंपास को चुंबक के चारों ओर घुमाएं।',
      orbit3dHint: 'घुमाने के लिए ड्रैग करें · ज़ूम करने के लिए स्क्रॉल करें · नीचे से ध्रुवों का कोण बदलें।',
      conceptNotesHeading: 'भौतिकी व्याख्या',
      northPole: 'उत्तरी ध्रुव (N)',
      southPole: 'दक्षिणी ध्रुव (S)',
      dipoleEquationName: 'चुंबकीय द्विध्रुव क्षेत्र',
      quickExplanation:
        'चुंबकीय क्षेत्र रेखाएं उत्तरी ध्रुव (N) से निकलती हैं और बाहर से मुड़कर दक्षिणी ध्रुव (S) में प्रवेश करती हैं, तथा चुंबक के भीतर से गुजरकर बंद वक्र बनाती हैं।',
      keyTakeaway1: 'कंपास की सुई हमेशा अपने स्थान पर चुंबकीय क्षेत्र रेखा के स्पर्शरेखा (tangent) की दिशा में संरेखित होती है।',
      keyTakeaway2: 'ध्रुवों के पास घनी क्षेत्र रेखाएं अधिक चुंबकीय फ्लक्स घनत्व B को दर्शाती हैं।',
      keyTakeaway3: 'दूरी बढ़ने पर चुंबकीय क्षेत्र की तीव्रता तेज़ी से घटती है (द्विध्रुव के लिए लगभग 1/r³ के अनुपात में)।',
      webglFallback: 'इस ब्राउज़र में 3D WebGL उपलब्ध नहीं है। कृपया इंटरैक्टिव 2D क्षेत्र दृश्य का उपयोग करें।',
      resetDefaults: 'डिफ़ॉल्ट रीसेट करें',
      compassXLabel: 'कंपास X स्थिति',
      compassYLabel: 'कंपास Y स्थिति',
      liveResultsHeading: 'लाइव माप और परिणाम',
      openControlsDrawerBtn: 'मापदंड व परिणाम',
      closeControlsDrawerBtn: 'हो गया',
    },
    myLearning: {
      title: 'मेरा अध्ययन',
      subtitle: 'इस डिवाइस पर सहेजे गए आपके पाठ्यपुस्तक विश्लेषण और प्रयोगशाला मॉड्यूल।',
      emptyTitle: 'अभी कोई सहेजा गया विश्लेषण नहीं है',
      emptyDescription:
        'जब आप किसी NCERT पृष्ठ का विश्लेषण करते हैं, तो उसकी अवधारणाएं और सूत्र त्वरित दोहराव के लिए यहाँ दिखाई देते हैं।',
      openAnalysis: 'अवधारणाएं खोलें',
      deleteEntry: 'हटाएं',
      featuredModuleTitle: 'छड़ चुंबक के चारों ओर चुंबकीय क्षेत्र',
      featuredModuleDesc: '2D कंपास प्रयोग और 3D चुंबकीय क्षेत्र रेखाओं का इंटरैक्टिव मॉडल।',
      launchLabBtn: 'लैब खोलें',
    },
    explorePhysics: {
      title: 'भौतिकी खोजें',
      subtitle: 'इंटरैक्टिव प्रयोगशालाएं और NCERT पाठ्यक्रम विषय।',
      availableNow: 'इंटरैक्टिव सिमुलेशन उपलब्ध',
      comingSoon: 'पाठ्यक्रम पूर्वावलोकन · केवल व्याख्या',
      barMagnetTitle: 'छड़ चुंबक के चारों ओर चुंबकीय क्षेत्र',
      barMagnetDesc: 'द्विध्रुव क्षेत्र ज्यामिति, कंपास विक्षेप, ध्रुव शक्ति और 3D फ्लक्स लूप का अन्वेषण करें।',
      open2dLab: '2D लैब खोलें',
      open3dLab: '3D लैब खोलें',
      viewConcepts: 'अवधारणाएं पढ़ें',
      upcoming1Title: 'विद्युतचुंबकीय प्रेरण',
      upcoming1Desc: 'फैराडे का नियम, कुंडली में चुंबकीय फ्लक्स परिवर्तन और लेंज़ का नियम।',
      upcoming2Title: 'काँच के प्रिज्म से अपवर्तन',
      upcoming2Desc: 'स्नेल का नियम, विचलन कोण और प्रकाश का वर्ण-विक्षेपण।',
      upcoming3Title: 'ओम का नियम एवं विद्युत परिपथ',
      upcoming3Desc: 'विभवांतर, विद्युत धारा और श्रेणी/समानांतर प्रतिरोध संबंध।',
    },
    settings: {
      title: 'सेटिंग्स',
      subtitle: 'अपनी सीखने की भाषा और प्रयोगशाला की प्राथमिकताएं चुनें।',
      languageSection: 'अध्ययन की भाषा',
      languageHelp: 'इंटरफ़ेस, अवधारणाओं और वैज्ञानिक शब्दावली को अंग्रेज़ी, कन्नड़ या हिन्दी में बदलें।',
      simulationSection: 'सिमुलेशन लैब प्राथमिकताएं',
      defaultModeLabel: 'डिफ़ॉल्ट लैब दृश्य',
      defaultVectorGridLabel: '2D में डिफ़ॉल्ट रूप से सदिश तीर दिखाएं',
      reducedMotionLabel: 'सिमुलेशन और ट्रांज़िशन में गति कम करें',
      aiConnectionSection: 'पाठ्यपुस्तक विश्लेषक सेवा',
      aiConnectedText: 'सर्वर-साइड Gemini सेवा सक्रिय है और पाठ्यपुस्तक छवियों का विश्लेषण करने के लिए तैयार है।',
      aiNotConfiguredText: 'GEMINI_API_KEY अभी कॉन्फ़िगर नहीं है। विश्लेषण सक्षम करने के लिए Secrets में कुंजी जोड़ें।',
      aiSecurityNote: 'सभी Gemini अनुरोध सुरक्षित रूप से बैकएंड सर्वर के माध्यम से चलते हैं।',
    },
    footer: {
      tagline: 'Pocket Lab · भौतिकी को अनुभव करें। सब कुछ समझें।',
      languagesNote: 'English, ಕನ್ನಡ और हिन्दी में उपलब्ध',
    },
    explainability: {
      kicker: 'AI प्रयोग व्याख्या इंजन',
      title: 'इस प्रयोग में क्या हो रहा है, विस्तार से समझें',
      subtitle:
        'लाइव सिमुलेशन स्थिति, सक्रिय मापदंडों और पाठ्यपुस्तक अवधारणाओं के अनुसार सटीक व्याख्या प्राप्त करें।',
      explainButton: 'समझाएं',
      generatingLabel: 'लाइव सिमुलेशन का विश्लेषण हो रहा है...',
      listenBtn: 'व्याख्या सुनें',
      stopListeningBtn: 'ऑडियो रोकें',
      inspectObjectHeading: 'जाँचने के लिए 2D/3D में वस्तु पर क्लिक करें या नीचे चुनें',
      inspectObjectHint:
        'उत्तरी ध्रुव, दक्षिणी ध्रुव, छड़ चुंबक, क्षेत्र रेखाओं या कंपास सुई पर क्लिक करके उनके गुण और कार्य देखें।',
      clearSelection: 'चयन हटाएं',
      objectCharacteristicsLabel: 'विशेषताएं',
      objectFunctionLabel: 'प्रयोग में कार्य',
      objectInteractionLabel: 'अंतःक्रिया और मापदंड प्रभाव',
      emptyPrompt:
        'छड़ चुंबक के वर्तमान कोण, चुंबकीय शक्ति, कंपास मापन और वैज्ञानिक सिद्धांतों को समझने के लिए "इस प्रयोग को समझाएं" पर क्लिक करें।',
      sectionA: 'हम क्या देख रहे हैं?',
      sectionB: 'वस्तुएं और उनकी विशेषताएं',
      sectionC: 'महत्वपूर्ण घटक',
      sectionD: 'वैज्ञानिक सिद्धांत',
      sectionE: 'प्रयोग कैसे काम करता है',
      sectionF: 'चरण-दर-चरण व्याख्या',
      sectionG: 'महत्वपूर्ण समीकरण और चर',
      sectionH: 'दैनिक जीवन में उपयोग',
      sectionI: 'मापदंड बदलने पर क्या होता है?',
      sectionJ: 'मुख्य सीखने के निष्कर्ष',
    },
    voiceTutor: {
      kicker: 'व्यक्तिगत बहुभाषी वॉइस ट्यूटर',
      title: 'Pocket Lab AI से पूछें',
      subtitle:
        'हिन्दी, English या ಕನ್ನಡ में माइक से बोलें या प्रश्न लिखें। Pocket Lab AI आपकी कठिनाई को पहचानकर सिमुलेशन को अनुकूलित करता है।',
      returnDefaultSimBtn: 'डिफ़ॉल्ट लैब पर लौटें',
      recordButton: 'आवाज़ से पूछें',
      recordingLabel: 'सुन रहा है',
      stopButton: 'रिकॉर्डिंग रोकें',
      cancelButton: 'रद्द करें',
      inputPlaceholder: 'पूछें कि चुंबकीय क्षेत्र रेखाएं कभी क्यों नहीं कटतीं, या चुंबकीय शक्ति कैसे काम करती है...',
      thinkingLabel: 'समझकर अनुकूलित कर रहा है...',
      sendButton: 'प्रश्न भेजें',
      recordedClipLabel: 'रिकॉर्ड किया गया प्रश्न',
      discardAudioButton: 'हटाएं',
      yourQuestionLabel: 'आपका प्रश्न',
      tryAnotherButton: 'दूसरे तरीके से समझाएं',
      diagnosisConceptLabel: 'मुख्य अवधारणा',
      strategyLabel: 'शिक्षण रणनीति',
      whyPreviousHardLabel: 'कठिनाई का कारण',
      personalizedExplanationLabel: 'व्यक्तिगत व्याख्या',
      adaptiveSimLabel: 'अनुकूलित सिमुलेशन लोड हुआ',
      fallbackSimNotice:
        'सुरक्षित इंटरैक्टिव अभ्यास के लिए एक निकटतम मान्य सिमुलेशन मॉड्यूल खोला गया है।',
      followUpLabel: 'समझ की जाँच',
      sessionTrackedNote: 'सत्र प्रगति (प्रश्न · रणनीतियाँ)',
      focusedComponentLabel: 'चयनित सिमुलेशन घटक',
      contextualSuggestionsLabel: 'इस घटक के बारे में पूछें',
      ttsVoiceUnavailable:
        'चुनी गई भाषा के लिए इस ब्राउज़र में प्राकृतिक वॉइस उपलब्ध नहीं है। ऊपर दी गई पूरी लिखित व्याख्या पढ़ी जा सकती है।',
      micUnsupportedError:
        'इस ब्राउज़र में माइक्रोफ़ोन रिकॉर्डिंग समर्थित नहीं है। आप नीचे अपना प्रश्न लिखकर पूछ सकते हैं।',
      micPermissionDeniedError:
        'माइक्रोफ़ोन अनुमति अस्वीकार की गई। अनुमति देने के लिए माइक बटन दबाएं या नीचे प्रश्न लिखें।',
      micBlockedSettingsError:
        'ब्राउज़र साइट सेटिंग्स में माइक्रोफ़ोन ब्लॉक है। एड्रेस बार के लॉक आइकन से माइक्रोफ़ोन चालू करें और पुनः प्रयास करें।',
      micNotFoundError:
        'इस डिवाइस में कोई माइक्रोफ़ोन नहीं मिला। माइक कनेक्ट करें या नीचे अपना प्रश्न लिखें।',
      micBusyError:
        'माइक्रोफ़ोन अभी किसी अन्य ऐप या टैब में उपयोग हो रहा है। उसे बंद करके पुनः प्रयास करें।',
      micInsecureContextError:
        'माइक्रोफ़ोन एक्सेस के लिए सुरक्षित HTTPS या localhost कनेक्शन आवश्यक है।',
      micFormatError:
        'ब्राउज़र समर्थित ऑडियो फ़ॉर्मैट रिकॉर्ड नहीं कर सका। कृपया पुनः प्रयास करें या प्रश्न लिखें।',
      recordingInterruptedError:
        'रिकॉर्डिंग पूरी होने से पहले बाधित हो गई। कृपया फिर से रिकॉर्ड करें या प्रश्न टाइप करें।',
      emptyRecordingError:
        'रिकॉर्डिंग में स्पष्ट आवाज़ नहीं मिली। माइक के पास स्पष्ट बोलें या प्रश्न लिखें।',
      emptyQuestionError:
        'भेजने से पहले कृपया वॉइस प्रश्न रिकॉर्ड करें या अपना प्रश्न लिखें।',
      requestingPermissionLabel: 'माइक अनुमति माँगी जा रही है...',
      transcriptReadyLabel: 'लिखित प्रश्न तैयार है — जाँचकर भेजें',
      streamingLabel: 'जवाब आ रहा है...',
      openTutorDrawerBtn: 'AI ट्यूटर से पूछें',
      closeTutorDrawerBtn: 'ट्यूटर बंद करें',
      transcribingLabel: 'आवाज़ को टेक्स्ट में बदल रहा है...',
      preparingVoiceLabel: 'आवाज़ तैयार हो रही है...',
      speakingLabel: 'बोल रहा है',
      pausedLabel: 'रोका गया',
      readyLabel: 'तैयार',
      processingLabel: 'प्रक्रिया जारी...',
      errorLabel: 'त्रुटि',
      retryBtn: 'पुनः प्रयास करें',
      playBtn: 'सुनें',
      pauseBtn: 'रोकें',
      resumeBtn: 'जारी रखें',
      replayBtn: 'दोबारा सुनें',
      stopVoiceBtn: 'बंद करें',
      transcriptPreviewHint: 'भेजने से पहले पहचाने गए प्रश्न की जाँच करें या सुधारें।',
      applySuggestionBtn: 'सुझाया गया दृश्य बदलाव लागू करें',
      appliedSuggestionLabel: 'सिमुलेशन में लागू',
      quickSimpler: 'आसान भाषा में',
      quickStepByStep: 'चरण-दर-चरण',
      quickRealLife: 'दैनिक जीवन उदाहरण',
      quickAnalogy: 'तुलना (Analogy)',
      quickFormula: 'सूत्र समझाएं',
      quickNumerical: 'संख्यात्मक हल',
      quickComponent: 'चयनित भाग समझाएं',
      quickRepeat: 'दोबारा समझाएं',
      quickDetailed: 'विस्तार से',
      explainInLangPrefix: 'भाषा में समझाएं:',
      welcomeTitle: 'आपका व्यक्तिगत भौतिकी AI ट्यूटर',
      welcomeHint:
        'बाईं ओर के सिमुलेशन से प्रयोग करें या किसी भाग पर क्लिक करके हिन्दी, English या ಕನ್ನಡ में प्रश्न पूछें।',
      clearChatBtn: 'नई चैट',
      askPhysixAiTooltip: 'Pocket Lab AI से पूछें',
      quickCompSimple: 'सरल भाषा में समझाएं',
      quickCompStepByStep: 'चरण-दर-चरण समझाएं',
      quickCompWhyUsed: 'यह घटक क्यों उपयोग होता है?',
      quickCompChangeValue: 'यह मान बदलने पर क्या होता है?',
      quickCompRealExample: 'दैनिक जीवन का उदाहरण दें',
      quickCompAnother: 'एक और प्रश्न पूछें',
      strategies: {
        simpler_explanation: 'सरल रोज़मर्रा की व्याख्या',
        step_by_step: 'चरण-दर-चरण तर्क',
        real_world_analogy: 'व्यावहारिक उदाहरण तुलना',
        numerical_example: 'संख्यात्मक गणना उदाहरण',
        visual_explanation: 'दृश्य और दिशात्मक व्याख्या',
        detailed_scientific: 'गहन वैज्ञानिक विश्लेषण',
        alternative_experiment: 'वैकल्पिक इंटरैक्टिव प्रयोग',
      },
    },
    componentOverlay: {
      idleHint: 'पहचानने के लिए किसी भाग पर क्लिक करें · समझाने के लिए फिर क्लिक करें',
      clickAgainHint: 'घटक समझाएं',
      deselectHint: 'खाली स्थान क्लिक करें या बंद करने के लिए Esc दबाएं',
      closeBtn: 'बंद करें',
      refreshAiBtn: 'AI व्याख्या ताज़ा करें',
      tailoringAiLabel: 'लाइव मापदंडों के अनुसार अपडेट हो रहा है...',
      aiTailoredBadge: 'AI लाइव संदर्भ',
      liveStateLabel: 'वर्तमान स्थिति',
      learnMoreBtn: 'और जानें',
      showLessBtn: 'कम दिखाएं',
      askPhysixAiBtn: 'Pocket Lab AI से पूछें',
      interactivePartsLabel: 'इंटरैक्टिव भाग',
      firstOpenHint: 'किसी भाग को हाइलाइट व जाँचने के लिए सिमुलेशन पर क्लिक करें, या नीचे दाईं ओर Pocket Lab AI दबाएं।',
      dismissHintBtn: 'समझ गया',
      selectedPrefix: 'चयनित',
      visualReferenceBadge: 'प्रयोगशाला संदर्भ दृश्य · स्टूडियो चित्रण',
      imageLoadingLabel: 'घटक का संदर्भ दृश्य लोड हो रहा है...',
      imageErrorLabel: 'घटक दृश्य पूर्वावलोकन लोड नहीं हो सका',
      retryImageBtn: 'पुनः प्रयास करें',
      fields: {
        definition: 'सरल व्याख्या',
        characteristics: 'मुख्य गुण एवं विशेषताएं',
        function: 'प्रयोग में उद्देश्य',
        scientificProperties: 'वैज्ञानिक कार्य सिद्धांत',
        behaviour: 'यह कैसे कार्य करता है',
        relationshipWithOthers: 'प्रयोग से संबंध',
        realWorldExample: 'दैनिक जीवन का उदाहरण',
        whyItMatters: 'यह क्यों महत्वपूर्ण है?',
      },
    },
    classLibrary: {
      dashboardHeading: 'अपनी NCERT कक्षा चुनें (कक्षा 6–10)',
      dashboardSubtitle:
        'अपनी कक्षा के अनुरूप NCERT भौतिकी अध्याय, इंटरैक्टिव 2D/3D सिमुलेशन, प्रयोग और प्रश्नोत्तरी देखने के लिए कक्षा चुनें।',
      dashboardOpenClassBtn: 'लाइब्रेरी खोलें',
      classPrefix: 'कक्षा',
      title: 'NCERT भौतिकी अध्ययन लाइब्रेरी',
      tabClassLibrary: 'कक्षा लाइब्रेरी',
      tabCoverageReport: 'पाठ्यक्रम रिपोर्ट (6–10)',
      statChapters: 'भौतिकी अध्याय',
      statChaptersShort: 'भौतिकी अध्याय',
      statInteractiveLabs: 'इंटरैक्टिव लैब',
      statCompleted: 'पूर्ण किए गए',
      progressLabel: 'प्रगति',
      chaptersHeading: 'भौतिकी अवधारणाओं वाले अध्याय',
      showAllChapters: 'सभी अध्याय दिखाएं',
      activitiesUnit: 'मॉड्यूल',
      filterHeading: 'प्रयोग खोजें और फ़िल्टर करें',
      clearFiltersBtn: 'फ़िल्टर हटाएं',
      searchPlaceholder: 'विषय, अध्याय या प्रयोग खोजें...',
      filterChapter: 'अध्याय के अनुसार',
      filterAllChapters: 'सभी अध्याय',
      filterTopic: 'भौतिकी विषय के अनुसार',
      filterAllTopics: 'सभी विषय क्षेत्र',
      filterCategory: 'प्रकार के अनुसार',
      filterAllTypes: 'सभी प्रकार',
      catPractical: 'निर्धारित प्रैक्टिकल',
      catActivity: 'NCERT गतिविधि',
      catConcept: 'अवधारणा मॉड्यूल',
      catSupplementary: 'अतिरिक्त मॉड्यूल',
      filterAvailability: 'उपलब्धता',
      filterAllModes: 'सभी उपलब्धता',
      filterInteractiveOnly: 'केवल इंटरैक्टिव लैब',
      filterStatus: 'पूर्णता स्थिति',
      filterAllStatus: 'सभी स्थिति',
      filterCompleted: 'पूर्ण',
      filterIncomplete: 'अपूर्ण',
      statusInteractive2d3d: '2D + 3D इंटरैक्टिव सिमुलेशन उपलब्ध',
      statusInteractive2d: '2D इंटरैक्टिव सिमुलेशन उपलब्ध',
      statusInteractive3d: '3D इंटरैक्टिव सिमुलेशन उपलब्ध',
      statusExplanationOnly: 'केवल व्याख्या एवं गतिविधि मार्गदर्शिका',
      statusComingSoon: 'आगामी इंटरैक्टिव सिमुलेशन · अध्ययन गाइड तैयार',
      verifiedNcertLabel: 'सत्यापित NCERT',
      supplementaryLabel: 'Pocket Lab अतिरिक्त',
      needsVerificationLabel: 'संस्करण जांच आवश्यक',
      sharedAcrossPrefix: 'साझा की गई कक्षाएं',
      launchLabBtn: 'इंटरैक्टिव लैब खोलें',
      openActivityGuideBtn: 'गतिविधि और क्विज़ खोलें',
      noResultsTitle: 'कोई मेल खाता प्रयोग नहीं मिला',
      noResultsDesc: 'फ़िल्टर हटाएं या किसी अन्य शब्द से खोजें।',
      openClassBtn: 'कक्षा खोलें',
      coverageUniqueEnginesLabel: 'सक्रिय अद्वितीय सिमुलेशन इंजन',
      coverageZeroDuplicatesNote: 'बिना किसी दोहराव के केंद्रीकृत पंजीकरण',
      coverageClassListingsLabel: 'कक्षा प्रयोग सूची (कक्षा 6–10)',
      coverageInteractiveListingsLabel: 'इंटरैक्टिव प्रयोग कार्ड',
      coverageRemainingLabel: 'आगामी मॉड्यूल',
      coverageRemainingNote: 'सक्रिय सिमुलेशन से स्पष्ट रूप से अलग',
      coverageGradesLabel: 'शामिल कक्षाएं',
      coverageTableHeading: 'कक्षा-वार NCERT भौतिकी और सिमुलेशन रिपोर्ट',
      coverageColListed: 'सूचीबद्ध',
      coverageColImplemented: 'इंटरैक्टिव',
      coverageColReused: 'पुनः प्रयुक्त',
      coverageColVerification: 'पाठ्यक्रम स्थिति',
      coverageColAction: 'देखें',
      sharedEnginesHeading: 'केंद्रीकृत पुन: प्रयोज्य सिमुलेशन इंजन',
      defaultClassSettingLabel: 'चयनित विद्यार्थी कक्षा',
    },
    experimentLab: {
      backToClassLibrary: 'कक्षा लाइब्रेरी पर वापस जाएं',
      tabExperiment: 'प्रयोग',
      tabIntroduction: 'कार्यविधि',
      tabObservations: 'प्रेक्षण',
      tabAssessment: 'क्विज़',
      objectiveLabel: 'सीखने का उद्देश्य',
      whyImportantLabel: 'यह अवधारणा क्यों महत्वपूर्ण है',
      realWorldLabel: 'दैनिक जीवन में उपयोग',
      apparatusLabel: 'आवश्यक उपकरण',
      procedureLabel: 'चरण-दर-चरण कार्यविधि',
      expectedOutcomeLabel: 'अपेक्षित निष्कर्ष',
      scientificExplanationLabel: 'वैज्ञानिक सिद्धांत एवं व्याख्या',
      gradeAdaptedHeading: 'कक्षा-विशिष्ट संदर्भ',
      observationsGuideLabel: 'प्रेक्षण के मुख्य बिंदु',
      observationPlaceholder: 'अपने लाइव प्रयोग से प्राप्त प्रेक्षण यहाँ लिखें...',
      saveObservationBtn: 'प्रेक्षण सहेजें',
      markCompletedBtn: 'पूर्ण चिह्नित करें',
      completedBadge: 'पूर्ण',
      assessmentHeading: 'प्रयोग समझ मूल्यांकन',
      assessmentSubtitle: 'इस प्रयोग पर आधारित अवधारणा, अनुप्रयोग और संख्यात्मक प्रश्नों के उत्तर दें।',
      noQuestionsAvailable: 'इस मॉड्यूल के लिए अभी कोई प्रश्न नहीं जोड़ा गया है।',
      questionKindConceptual: 'अवधारणात्मक',
      questionKindApplication: 'अनुप्रयोग आधारित',
      questionKindNumerical: 'संख्यात्मक',
      submitQuizBtn: 'उत्तर जांचें और स्कोर सहेजें',
      retakeQuizBtn: 'क्विज़ पुनः दें',
      correctLabel: 'सही उत्तर',
      reviewLabel: 'अवधारणा समीक्षा',
      scoreSavedLabel: 'सहेजा गया स्कोर',
      lastScoreLabel: 'पिछला सहेजा गया स्कोर',
      clickComponentTip: 'पहचानने के लिए कैनवास में किसी भी घटक पर क्लिक करें और समझाने के लिए दोबारा क्लिक करें।',
    },
    dynamicLab: {
      generatedBadge: 'AI-जनित इंटरैक्टिव लैब',
      validatedExactBadge: 'सत्यापित भौतिकी मॉडल',
      validatedSimplifiedBadge: 'सरलीकृत शैक्षणिक मॉडल',
      simplifiedModelHeading: 'मॉडल की सीमाएं और सरलीकरण',
      saveToLibraryBtn: 'लाइब्रेरी में सहेजें',
      savedToLibraryBtn: 'लाइब्रेरी में सहेजा गया',
      generateExperimentBtn: 'नया इंटरैक्टिव प्रयोग बनाएं और खोलें',
      openExistingLabBtn: 'मौजूदा NCERT सिमुलेशन खोलें',
      reopenSavedLabBtn: 'सहेजा गया AI प्रयोग फिर खोलें',
      savedGeneratedSectionTitle: 'AI-जनित प्रयोग (सहेजे गए)',
      savedGeneratedEmpty: 'किसी नए प्रयोग वाले पाठ्यपुस्तक पृष्ठ को स्कैन करके कस्टम इंटरैक्टिव प्रयोग यहाँ सहेजें।',
      deleteSavedLab: 'जनित प्रयोग हटाएं',
      detectedApparatusLabel: 'पहचाने गए उपकरण एवं व्यवस्था',
      registryExactMatchLabel: 'मौजूदा NCERT सिम्युलेटर मिल गया',
      registryDynamicLabel: 'कस्टम डायनामिक प्रयोग के लिए तैयार',
      generatingHeading: 'सत्यापित भौतिकी सिमुलेशन तैयार हो रहा है',
      generateFailedHeading: 'सत्यापित सिमुलेशन नहीं बनाया जा सका',
    },
  },
};
