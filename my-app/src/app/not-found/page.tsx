import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The requested page could not be found.',
};

export default function NotFound() {
  return (
    <div className='w-full min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center'>
        <div className='mb-6'>
          <h1 className='text-6xl font-bold text-gray-900 mb-2'>404</h1>
          <h2 className='text-2xl font-bold text-gray-700 mb-4'>
            Page Not Found
          </h2>
          <p className='text-gray-600 mb-8'>
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </p>
        </div>

        <div className='space-y-4'>
          <Link
            href='/'
            className='inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 '
          >
            Go to Homepage
          </Link>

          <div className='text-sm text-gray-500'>
            <p>Or try one of these languages:</p>
            <div className='flex justify-center space-x-4 mt-2'>
              <Link href='/en-US' className='text-blue-600 hover:text-blue-800'>
                English
              </Link>
              <Link href='/ko' className='text-blue-600 hover:text-blue-800'>
                한국어
              </Link>
              <Link href='/ja' className='text-blue-600 hover:text-blue-800'>
                日本語
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
