import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  GraduationCap,
  HelpCircle,
  Sparkles,
  Target,
  Trophy,
  X,
} from 'lucide-react';
import type { ExperimentCatalogItem, LanguageCode } from '../types/physics';
import type {
  GuidedClassroomActivity,
  GuidedStepId,
} from '../types/companion';

interface GuidedClassroomFlowBarProps {
  activity: GuidedClassroomActivity;
  experiment: ExperimentCatalogItem;
  language: LanguageCode;
  alreadyCompleted?: boolean;
  onSelectStepTab?: (tab: 'experiment' | 'introduction' | 'observations' | 'assessment') => void;
  onCompanionStepPrompt: (step: GuidedStepId, extraContext?: string) => void;
  onSubmitGuidedCompletion: (payload: {
    selectedPredictionIndex: number;
    quizScore: number;
    quizTotal: number;
    summaryNotes?: string;
  }) => Promise<void>;
  onExitGuidedMode: () => void;
}

const STEP_LABELS: Record<
  LanguageCode,
  Record<GuidedStepId, string> & {
    bannerTitle: string;
    teacherPrefix: string;
    classPrefix: string;
    predictionHeading: string;
    predictionLockHint: string;
    experimentStepNote: string;
    quizStepNote: string;
    summaryHeading: string;
    summaryPlaceholder: string;
    finishBtn: string;
    finishedBadge: string;
    nextBtn: string;
    backBtn: string;
    exitBtn: string;
  }
> = {
  en: {
    bannerTitle: 'Guided Classroom Activity',
    teacherPrefix: 'Teacher',
    classPrefix: 'Class',
    intro: '1. Topic Intro',
    objective: '2. Objective',
    prediction: '3. Prediction',
    experiment: '4. Experiment',
    quiz: '5. Quiz Check',
    summary: '6. Summary',
    predictionHeading: 'Before running the lab, predict what will happen:',
    predictionLockHint: 'Select an option to lock in your hypothesis before testing.',
    experimentStepNote: 'Use the simulation below to test your prediction and inspect parts.',
    quizStepNote: 'Complete the quick classroom concept check below to verify what you observed.',
    summaryHeading: 'Reflect & Submit Classroom Activity (+60 Bonus XP)',
    summaryPlaceholder: 'What did you observe compared to your prediction?',
    finishBtn: 'Submit Guided Lab & Claim +60 XP',
    finishedBadge: 'Submitted to Teacher',
    nextBtn: 'Next Step',
    backBtn: 'Previous',
    exitBtn: 'Exit Guided Mode',
  },
  kn: {
    bannerTitle: 'ಮಾರ್ಗದರ್ಶಿತ ತರಗತಿ ಚಟುವಟಿಕೆ',
    teacherPrefix: 'ಶಿಕ್ಷಕರು',
    classPrefix: 'ತರಗತಿ',
    intro: '1. ವಿಷಯ ಪರಿಚಯ',
    objective: '2. ಉದ್ದೇಶ',
    prediction: '3. ಊಹೆ',
    experiment: '4. ಪ್ರಯೋಗ',
    quiz: '5. ಕ್ವಿಜ್ ಪರೀಕ್ಷೆ',
    summary: '6. ಸಾರಾಂಶ',
    predictionHeading: 'ಪ್ರಯೋಗ ಪ್ರಾರಂಭಿಸುವ ಮೊದಲು ಏನಾಗಬಹುದು ಎಂದು ಊಹಿಸಿ:',
    predictionLockHint: 'ಪರೀಕ್ಷಿಸುವ ಮೊದಲು ನಿಮ್ಮ ಊಹೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    experimentStepNote: 'ನಿಮ್ಮ ಊಹೆಯನ್ನು ಪರೀಕ್ಷಿಸಲು ಕೆಳಗಿನ ಸಿಮ್ಯುಲೇಶನ್ ಬಳಸಿ ಮತ್ತು ಭಾಗಗಳನ್ನು ಸ್ಪರ್ಶಿಸಿ.',
    quizStepNote: 'ನೀವು ಗಮನಿಸಿದ ತತ್ವವನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಲು ಕ್ವಿಜ್ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ.',
    summaryHeading: 'ನಿಮ್ಮ ತೀರ್ಮಾನವನ್ನು ಬರೆಯಿರಿ (+60 ಬೋನಸ್ XP)',
    summaryPlaceholder: 'ನಿಮ್ಮ ಊಹೆಗಿಂತ ಪ್ರಯೋಗದಲ್ಲಿ ಏನು ಕಂಡುಬಂತು?',
    finishBtn: 'ಸಲ್ಲಿಸಿ ಮತ್ತು +60 XP ಪಡೆಯಿರಿ',
    finishedBadge: 'ಶಿಕ್ಷಕರಿಗೆ ಸಲ್ಲಿಸಲಾಗಿದೆ',
    nextBtn: 'ಮುಂದಿನ ಹಂತ',
    backBtn: 'ಹಿಂದಿನದು',
    exitBtn: 'ಮಾರ್ಗದರ್ಶಿತ ಮೋಡ್ ನಿಲ್ಲಿಸಿ',
  },
  hi: {
    bannerTitle: 'निर्देशित कक्षा गतिविधि',
    teacherPrefix: 'शिक्षक',
    classPrefix: 'कक्षा',
    intro: '1. विषय परिचय',
    objective: '2. उद्देश्य',
    prediction: '3. पूर्वानुमान',
    experiment: '4. प्रयोग',
    quiz: '5. क्विज़ जाँच',
    summary: '6. निष्कर्ष',
    predictionHeading: 'प्रयोग चलाने से पहले अनुमान लगाएँ कि क्या होगा:',
    predictionLockHint: 'परीक्षण से पहले अपना अनुमान चुनें।',
    experimentStepNote: 'अपना अनुमान जांचने के लिए नीचे सिमुलेशन चलाएँ और उपकरण भागों पर क्लिक करें।',
    quizStepNote: 'आपने जो देखा उसकी पुष्टि करने के लिए त्वरित क्विज़ प्रश्नों के उत्तर दें।',
    summaryHeading: 'अपना निष्कर्ष लिखें और जमा करें (+60 बोनस XP)',
    summaryPlaceholder: 'आपके अनुमान की तुलना में प्रयोग में क्या दिखाई दिया?',
    finishBtn: 'गतिविधि जमा करें और +60 XP पाएँ',
    finishedBadge: 'शिक्षक को सबमिट किया गया',
    nextBtn: 'अगला चरण',
    backBtn: 'पिछला',
    exitBtn: 'गाइडेड मोड बंद करें',
  },
};

const STEPS: GuidedStepId[] = ['intro', 'objective', 'prediction', 'experiment', 'quiz', 'summary'];

export const GuidedClassroomFlowBar: React.FC<GuidedClassroomFlowBarProps> = ({
  activity,
  experiment,
  language,
  alreadyCompleted = false,
  onSelectStepTab,
  onCompanionStepPrompt,
  onSubmitGuidedCompletion,
  onExitGuidedMode,
}) => {
  const copy = STEP_LABELS[language];
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedPrediction, setSelectedPrediction] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [summaryNotes, setSummaryNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(alreadyCompleted);

  const currentStep = STEPS[stepIndex];
  const questions = experiment.assessmentQuestions.slice(0, 2);

  const goToStep = (idx: number) => {
    const clamped = Math.max(0, Math.min(STEPS.length - 1, idx));
    const nextStep = STEPS[clamped];
    setStepIndex(clamped);
    if (nextStep === 'experiment') {
      onSelectStepTab?.('experiment');
    }
    onCompanionStepPrompt(nextStep);
  };

  const quizScore = questions.reduce(
    (sum, q) => (quizAnswers[q.id] === q.correctIndex ? sum + 1 : sum),
    0
  );

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      await onSubmitGuidedCompletion({
        selectedPredictionIndex: selectedPrediction ?? 0,
        quizScore,
        quizTotal: Math.max(1, questions.length),
        summaryNotes,
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      data-testid="guided-classroom-flow-bar"
      aria-label={copy.bannerTitle}
      className="rounded-2xl bg-white border-2 border-[#F49A3C]/45 p-4 sm:p-5 space-y-4 shadow-xs"
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#C96D12]">
            <GraduationCap className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{copy.bannerTitle}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#171A2F]">{activity.className}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#6F7487]">
              {copy.teacherPrefix}: {activity.teacherName}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#171A2F] truncate">
            {activity.experimentTitle}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {submitted && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FFF3E3]/75 border border-[#EFE7DF] text-xs font-semibold text-[#171A2F]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#C96D12]" />
              <span>{copy.finishedBadge}</span>
            </span>
          )}
          <button
            type="button"
            onClick={onExitGuidedMode}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#EFE7DF] text-xs font-semibold text-[#6F7487] hover:text-[#171A2F] hover:bg-[#FFF9F4] cursor-pointer whitespace-nowrap"
          >
            <X className="w-3.5 h-3.5" />
            <span>{copy.exitBtn}</span>
          </button>
        </div>
      </div>

      {/* 6-Step Progress Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
        {STEPS.map((step, idx) => {
          const isActive = idx === stepIndex;
          const isDone = idx < stepIndex || submitted;
          return (
            <button
              key={step}
              type="button"
              onClick={() => goToStep(idx)}
              className={`px-2.5 py-2 rounded-lg text-xs font-semibold text-left border transition-colors cursor-pointer truncate ${
                isActive
                  ? 'bg-[#F49A3C] border-[#F49A3C] text-white'
                  : isDone
                    ? 'bg-[#FFF3E3]/65 border-[#EFE7DF] text-[#171A2F]'
                    : 'bg-[#FFF9F4] border-[#EFE7DF] text-[#6F7487] hover:text-[#171A2F]'
              }`}
            >
              {copy[step]}
            </button>
          );
        })}
      </div>

      {/* Active Step Content */}
      <div className="rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] p-4 space-y-3">
        {currentStep === 'intro' && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#C96D12]">
              <Sparkles className="w-4 h-4" />
              <span>{experiment.chapterTitle}</span>
            </div>
            <p className="text-sm text-[#171A2F] leading-relaxed">{experiment.description}</p>
          </div>
        )}

        {currentStep === 'objective' && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#C96D12]">
              <Target className="w-4 h-4" />
              <span>{copy.objective}</span>
            </div>
            <p className="text-sm font-medium text-[#171A2F] leading-relaxed">
              {activity.customObjective || experiment.learningObjective}
            </p>
            <p className="text-xs text-[#6F7487]">{experiment.whyItImportant}</p>
          </div>
        )}

        {currentStep === 'prediction' && (
          <div className="space-y-3">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#C96D12]">{copy.predictionHeading}</p>
              <p className="text-sm font-semibold text-[#171A2F]">{activity.predictionPrompt}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activity.predictionOptions.map((opt, idx) => {
                const chosen = selectedPrediction === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    data-testid={`guided-prediction-opt-${idx}`}
                    onClick={() => {
                      setSelectedPrediction(idx);
                      onCompanionStepPrompt('prediction', `Predicted: ${opt}`);
                    }}
                    className={`p-3 rounded-lg border text-left text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                      chosen
                        ? 'bg-[#F49A3C] border-[#F49A3C] text-white'
                        : 'bg-white border-[#EFE7DF] text-[#171A2F] hover:border-[#F49A3C]'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-[#6F7487]">{copy.predictionLockHint}</p>
          </div>
        )}

        {currentStep === 'experiment' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-start gap-2.5 text-sm text-[#171A2F]">
              <Compass className="w-4 h-4 text-[#C96D12] shrink-0 mt-0.5" />
              <span>{copy.experimentStepNote}</span>
            </div>
            {selectedPrediction !== null && (
              <span className="text-xs font-semibold text-[#C96D12] shrink-0">
                Your guess: {activity.predictionOptions[selectedPrediction]}
              </span>
            )}
          </div>
        )}

        {currentStep === 'quiz' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#C96D12]">
              <HelpCircle className="w-4 h-4" />
              <span>{copy.quizStepNote}</span>
            </div>
            {questions.length === 0 ? (
              <p className="text-xs text-[#6F7487]">No quiz items attached; proceed to Summary.</p>
            ) : (
              <div className="space-y-3">
                {questions.map((q, qIdx) => (
                  <div key={q.id} className="rounded-lg bg-white border border-[#EFE7DF] p-3 space-y-2">
                    <p className="text-xs sm:text-sm font-semibold text-[#171A2F]">
                      Q{qIdx + 1}. {q.prompt}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {q.options.map((opt, optIdx) => {
                        const selected = quizAnswers[q.id] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                            className={`px-3 py-2 rounded-lg border text-left text-xs font-medium cursor-pointer ${
                              selected
                                ? 'bg-[#FFF3E3] border-[#F49A3C] text-[#171A2F] font-semibold'
                                : 'bg-[#FFF9F4] border-[#EFE7DF] text-[#171A2F] hover:border-[#F49A3C]'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentStep === 'summary' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#C96D12]">
                <ClipboardCheck className="w-4 h-4" />
                <span>{copy.summaryHeading}</span>
              </div>
              {selectedPrediction !== null && (
                <span
                  className={`text-xs font-semibold ${
                    selectedPrediction === activity.correctPredictionIndex
                      ? 'text-[#171A2F]'
                      : 'text-[#C96D12]'
                  }`}
                >
                  Prediction outcome:{' '}
                  {selectedPrediction === activity.correctPredictionIndex
                    ? 'Matched experiment!'
                    : `Expected: ${activity.predictionOptions[activity.correctPredictionIndex]}`}
                </span>
              )}
            </div>

            <textarea
              rows={2}
              value={summaryNotes}
              onChange={(e) => setSummaryNotes(e.target.value)}
              placeholder={copy.summaryPlaceholder}
              className="w-full px-3 py-2 rounded-lg border border-[#EFE7DF] bg-white text-xs sm:text-sm text-[#171A2F] focus:outline-none focus:border-[#F49A3C]"
            />

            {!submitted ? (
              <button
                type="button"
                data-testid="submit-guided-activity-btn"
                disabled={submitting}
                onClick={() => void handleFinish()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F49A3C] hover:bg-[#E5882A] text-white text-xs sm:text-sm font-semibold cursor-pointer disabled:opacity-60"
              >
                <Trophy className="w-4 h-4 text-[#FFF3E3]" />
                <span>{submitting ? 'Submitting...' : copy.finishBtn}</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FFF3E3]/75 border border-[#EFE7DF] text-xs font-semibold text-[#171A2F]">
                <CheckCircle2 className="w-4 h-4 text-[#C96D12]" />
                <span>{copy.finishedBadge}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step Footer Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={stepIndex === 0}
          onClick={() => goToStep(stepIndex - 1)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#EFE7DF] bg-white text-xs font-semibold text-[#171A2F] hover:bg-[#FFF9F4] disabled:opacity-45 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{copy.backBtn}</span>
        </button>

        {stepIndex < STEPS.length - 1 && (
          <button
            type="button"
            data-testid="guided-next-step-btn"
            disabled={currentStep === 'prediction' && selectedPrediction === null}
            onClick={() => goToStep(stepIndex + 1)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#F49A3C] text-white text-xs font-semibold hover:bg-[#E5882A] disabled:opacity-45 cursor-pointer"
          >
            <span>{copy.nextBtn}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </section>
  );
};
