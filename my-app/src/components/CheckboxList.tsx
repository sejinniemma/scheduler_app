'use client';

import CheckboxItem from './CheckboxItem';

export interface CheckboxItemData {
  id: string;
  label: string;
  checked?: boolean;
}

interface CheckboxListProps {
  items: CheckboxItemData[];
  onChange?: (id: string, checked: boolean) => void;
  size?: number;
  className?: string;
}

const CheckboxList = ({
  items,
  onChange,
  size,
  className = '',
}: CheckboxListProps) => {
  return (
    <div
      className={`flex flex-col gap-[19px] border bg-white border-line-edge rounded-xl py-[15px] px-[20px] ${className}`}
    >
      {items.map((item) => (
        <CheckboxItem
          key={item.id}
          label={item.label}
          checked={item.checked}
          onChange={(checked) => onChange?.(item.id, checked)}
          size={size}
        />
      ))}
    </div>
  );
};

export default CheckboxList;
