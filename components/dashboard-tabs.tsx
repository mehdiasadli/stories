import Link from 'next/link';
import clsx from 'clsx';

const tabs = [
  { href: '/dashboard/chapters', label: 'bölümlər' },
  { href: '/dashboard/characters', label: 'personajlar' },
  { href: '/dashboard/users', label: 'istifadəçilər' },
];

export function DashboardTabs() {
  return (
    <nav className='w-ful border-b border-gray-200 bg-white'>
      <ul className='-mb-px flex flex-wrap gap-6 px-4'>
        {tabs.map((tab) => {
          return (
            <li key={tab.href} className=''>
              <Link
                href={tab.href}
                className={clsx(
                  'inline-block py-3 text-sm capitalize border-b-2',
                  'transition-colors',
                  'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-400'
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
