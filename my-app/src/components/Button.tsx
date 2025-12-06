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
      className={`w-full h-[40px] p-[10px] text-body4 font-semibold bg-blue text-white rounded-[10px] ${className}`}
      style={{
        boxShadow: '0 4px 4px 0 rgba(59, 130, 246, 0.20)',
      }}
    >
      {text}
    </button>
  );
}

