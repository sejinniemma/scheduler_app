'use client';

import { useState } from 'react';

interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: number;
}

const Checkbox = ({
  checked: controlledChecked,
  onChange,
  size = 22,
}: CheckboxProps) => {
  const [internalChecked, setInternalChecked] = useState(false);
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;

  const handleClick = () => {
    const newChecked = !checked;
    if (!isControlled) {
      setInternalChecked(newChecked);
    }
    onChange?.(newChecked);
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      className='flex items-center justify-center rounded'
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: checked ? 'var(--color-green-light)' : '#E5E8EB',
        cursor: 'pointer',
      }}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox='0 0 14 14'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M11.6667 3.5L5.25 9.91667L2.33334 7'
          stroke={checked ? 'white' : '#313D4C'}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </button>
  );
};

export default Checkbox;
