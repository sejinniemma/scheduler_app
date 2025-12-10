import { ReactNode } from 'react';

interface ContentLayoutProps {
  children: ReactNode;
}

const ContentLayout = ({ children }: ContentLayoutProps) => {
  return <div className='px-[14px] pb-[29px]'>{children}</div>;
};

export default ContentLayout;



