import Link from 'next/link';

interface UserPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UserPage({ params }: UserPageProps) {
  const { slug } = await params;

  return (
    <div>
      əsas profil səhifəsi hal-hazırda hazırlanmamışdır. aşağıdakı səhifələri gözdən keçirə bilərsiniz
      <br />
      <Link className='underline text-blue-500' href={`/users/${slug}/comments`}>
        istifadəçinin şərhləri
      </Link>
      ,{' '}
      <Link className='underline text-blue-500' href={`/users/${slug}/favorites`}>
        istifadəçinin favorit bölümləri
      </Link>{' '}
      və{' '}
      <Link className='underline text-blue-500' href={`/users/${slug}/reads`}>
        istifadəçinin oxuduğu bölümlər
      </Link>{' '}
    </div>
  );
}
