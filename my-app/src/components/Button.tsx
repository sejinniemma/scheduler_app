'use client';
interface ButtonProps {
  text: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export default function Button({
  text,
  onClick,
  type = 'button',
  className = '',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full h-[40px] p-[10px] text-body4 font-semibold bg-blue text-white rounded-[10px] cursor-pointer transition-all duration-200 hover:opacity-90 hover:shadow-lg ${className}`}
      style={{
        boxShadow: '0 4px 4px 0 rgba(59, 130, 246, 0.20)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          '0 6px 8px 0 rgba(59, 130, 246, 0.30)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow =
          '0 4px 4px 0 rgba(59, 130, 246, 0.20)';
      }}
    >
      {text}
    </button>
  );
}
