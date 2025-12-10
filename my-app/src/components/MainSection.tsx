import Image from 'next/image';

interface MainSectionProps {
  icon: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  title: string;
  description: string;
}

const MainSection = ({ icon, title, description }: MainSectionProps) => {
  return (
    <div className='flex flex-col items-center justify-center pb-[20px]'>
      <Image
        src={icon.src}
        alt={icon.alt}
        width={icon.width || 60}
        height={icon.height || 60}
      />
      <h1 className='text-body2 text-normal font-bold mt-[20px]'>{title}</h1>
      <p className='text-caption1 text-dark mt-[8px]'>{description}</p>
    </div>
  );
};

export default MainSection;


