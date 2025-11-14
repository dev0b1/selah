'use client';

import { motion } from 'framer-motion';
import { FiMusic, FiImage, FiEdit, FiCheck } from 'react-icons/fi';

export type LoadingStep = 'ocr' | 'lyrics' | 'music' | 'complete';

interface LoadingProgressProps {
  currentStep: LoadingStep;
  progress?: number;
}

const steps = [
  {
    id: 'ocr' as LoadingStep,
    label: 'Extracting Text',
    icon: FiImage,
    description: 'Reading your chat screenshot...',
  },
  {
    id: 'lyrics' as LoadingStep,
    label: 'Writing Lyrics',
    icon: FiEdit,
    description: 'Crafting your breakup song...',
  },
  {
    id: 'music' as LoadingStep,
    label: 'Creating Music',
    icon: FiMusic,
    description: 'Generating your song...',
  },
  {
    id: 'complete' as LoadingStep,
    label: 'Complete',
    icon: FiCheck,
    description: 'Your song is ready!',
  },
];

export default function LoadingProgress({ currentStep, progress = 0 }: LoadingProgressProps) {
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStepIndex;
          const isComplete = index < currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4"
            >
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all
                  ${isComplete ? 'bg-green-500 text-white' : ''}
                  ${isActive ? 'bg-rose-500 text-white animate-pulse' : ''}
                  ${isPending ? 'bg-gray-200 text-gray-400' : ''}
                `}
              >
                <Icon className="w-6 h-6" />
              </div>

              <div className="flex-1">
                <h3
                  className={`
                    font-semibold text-sm transition-colors
                    ${isActive || isComplete ? 'text-gray-900' : 'text-gray-400'}
                  `}
                >
                  {step.label}
                </h3>
                <p
                  className={`
                    text-xs transition-colors
                    ${isActive ? 'text-gray-600' : 'text-gray-400'}
                  `}
                >
                  {step.description}
                </p>

                {isActive && progress > 0 && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-rose-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{progress}%</p>
                  </div>
                )}
              </div>

              {isComplete && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-green-500"
                >
                  <FiCheck className="w-5 h-5" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="inline-block"
        >
          <FiMusic className="w-8 h-8 text-rose-500" />
        </motion.div>
        <p className="mt-3 text-gray-600 text-sm">
          Creating your personalized breakup song...
        </p>
      </div>
    </div>
  );
}
