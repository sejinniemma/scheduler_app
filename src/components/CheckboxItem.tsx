'use client';

import Checkbox from './Checkbox';

interface CheckboxItemProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: number;
}

const CheckboxItem = ({
  label,
  checked,
  onChange,
  size = 16,
}: CheckboxItemProps) => {
  return (
    <div className='flex items-center gap-[10px]'>
      <Checkbox size={size} checked={checked} onChange={onChange} />
      <p className='text-caption1 text-normal-strong font-medium'>{label}</p>
    </div>
  );
};

export default CheckboxItem;
