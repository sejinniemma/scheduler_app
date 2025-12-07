import Image from 'next/image';
import MobileLayout from '../layout/MobileLayout';
import Button from '../components/Button';

export default function Home() {
  return (
    <MobileLayout>
      <div className='flex flex-col items-center justify-center h-full bg-light'>
        {/* Title */}
        <div className='flex flex-col items-center gap-[10px] mb-[50px]'>
          <div className='relative w-[60px] h-[60px]'>
            <Image
              src='/images/icons/camera.png'
              alt='camera icon'
              fill
              className='object-contain'
            />
          </div>
          <h1 className='text-body2 text-normal font-bold'>Scheduler</h1>
        </div>

        {/* Login Form */}
        <div className='flex flex-col items-center w-[260px] gap-[30px]'>
          <input
            type='text'
            placeholder='이름'
            className='w-full h-[40px] text-caption1 font-medium text-default border-0 border-b border-base focus:outline-none focus:border-b p-[--var(--gap-7)]'
          />
          <input
            type='password'
            placeholder='번호(-없이)'
            className='w-full h-[40px] text-caption1 font-medium text-default border-0 border-b border-base focus:outline-none focus:border-b p-[--var(--gap-7)]'
          />
          <Button text='로그인' />
        </div>
      </div>
    </MobileLayout>
  );
}
