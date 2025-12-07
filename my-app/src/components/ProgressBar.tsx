interface ProgressBarProps {
  currentStep: 0 | 1 | 2 | 3;
  disabled?: boolean;
}

const CheckIcon = () => (
  <svg
    width='10'
    height='10'
    viewBox='0 0 14 14'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M11.6667 3.5L5.25 9.91667L2.33334 7'
      stroke='white'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

const ProgressBar = ({ currentStep, disabled = false }: ProgressBarProps) => {
  // currentStep: 0 = 출발 전, 1 = 출발, 2 = 도착 전, 3 = 종료
  const steps = [
    {
      label: '출발',
      position: 'left-0',
      checkCondition: (step: number) => step >= 1,
    },
    {
      label: '도착 전',
      position: 'left-1/2 -translate-x-1/2',
      checkCondition: (step: number) => step >= 2,
    },
    {
      label: '종료',
      position: 'right-0',
      checkCondition: (step: number) => step === 3,
    },
  ];

  const getProgressWidth = () => {
    if (currentStep === 0) return '0%';
    if (currentStep === 1) return '30%';
    if (currentStep === 2) return '75%';
    return '100%';
  };

  const getCircleStyle = (isCompleted: boolean) => {
    if (disabled) {
      return {
        backgroundColor: '#fff',
        border: '2px solid var(--color-disabled)',
      };
    }
    return {
      backgroundColor: isCompleted ? 'var(--color-green)' : '#fff',
      border: isCompleted ? 'none' : '2px solid var(--color-secondary)',
    };
  };

  const getLabelColor = (isCompleted: boolean) => {
    if (disabled) return 'var(--color-disabled)';
    return isCompleted ? 'var(--color-green)' : 'var(--color-secondary)';
  };

  return (
    <div className='flex flex-col gap-4'>
      {/* Progress Bar with Labels */}
      <div className='relative'>
        {/* Background bar */}
        <div className='w-full h-[8px] rounded-full bg-progress-bar-background' />

        {/* Green progress bar */}
        <div
          className='absolute top-0 left-0 h-[8px] rounded-full transition-all duration-300'
          style={{
            width: getProgressWidth(),
            backgroundColor: disabled
              ? 'var(--color-disabled)'
              : 'var(--color-green)',
          }}
        />

        {/* Circles */}
        {steps.map((step, index) => {
          const isCompleted = step.checkCondition(currentStep);
          return (
            <div
              key={index}
              className={`absolute ${step.position} w-[14px] h-[14px] rounded-full flex items-center justify-center transition-all duration-300`}
              style={{
                top: '-3px',
                ...getCircleStyle(isCompleted),
              }}
            >
              {!disabled && isCompleted && <CheckIcon />}
            </div>
          );
        })}

        {/* Labels */}
        <div className='flex items-center justify-between mt-[6px]'>
          {steps.map((step, index) => {
            const isCompleted = step.checkCondition(currentStep);
            return (
              <span
                key={index}
                className='text-caption2 font-medium'
                style={{
                  color: getLabelColor(isCompleted),
                }}
              >
                {step.label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
