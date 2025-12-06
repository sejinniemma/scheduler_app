import React from 'react';
import { cn } from '../lib/utiles';

const MobileLayout = ({
  children,
  id,
  className,
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) => {
  return (
    <section
      id={id}
      className={cn('max-w-[375px] h-[734px]  mx-auto w-full', className)}
    >
      {children}
    </section>
  );
};

export default MobileLayout;
