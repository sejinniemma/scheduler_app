'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import MobileLayout from '../../layout/MobileLayout';
import Button from '../../components/Button';

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        name,
        phone,
        redirect: false,
      });

      if (result?.error) {
        setError('이름 또는 전화번호가 올바르지 않습니다.');
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <MobileLayout>
      <div className='flex flex-col items-center justify-center h-full bg-light'>
        <div className='flex flex-col items-center gap-[10px] mb-[50px]'>
          <div className='relative w-[60px] h-[60px]'>
            <Image
              src='/images/icons/camera.png'
              alt='camera icon'
              fill
              className='object-contain'
              priority
              unoptimized
            />
          </div>
          <h1 className='text-body2 text-normal font-bold'>Scheduler</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className='flex flex-col items-center w-[260px]'
        >
          <input
            type='text'
            placeholder='이름'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className='w-full h-[40px] mb-[30px] text-caption1 font-medium text-default border-0 border-b border-line-base focus:outline-none focus:border-b p-[--var(--gap-7)]'
          />
          <input
            type='text'
            placeholder='번호(-없이)'
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
            required
            className='w-full h-[40px] mb-[30px] text-caption1 font-medium text-default border-0 border-b border-line-base focus:outline-none focus:border-b p-[--var(--gap-7)]'
          />
          {error && (
            <p className='text-caption2 text-red mb-[10px] w-full text-center'>
              {error}
            </p>
          )}
          <Button
            text={isLoading ? '로그인 중...' : '로그인'}
            type='submit'
            disabled={isLoading}
          />
        </form>
      </div>
    </MobileLayout>
  );
}
