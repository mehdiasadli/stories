import Link from 'next/link';
import { CreateChapterForm } from './form';

export default function DashboardChaptersCreatePage() {
  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-12'>
          <Link href={`/dashboard/chapters`} className='text-sm text-gray-500 hover:text-gray-700 transition-colors'>
            ← Back to Dashboard
          </Link>

          <h1 className='text-6xl font-serif text-gray-900 mt-6 mb-4'>New Chapter</h1>

          <p className='text-sm text-gray-600 mb-8'>Create a new chapter for your book</p>
        </div>

        {/* Form */}
        <div className='max-w-2xl mx-auto'>
          <CreateChapterForm />
        </div>
      </div>
    </div>
  );
}
