import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'haqqında',
  description: 'mahmud əsəri haqqında ümumi məlumat səhifəsi.',
  keywords: ['haqqında', 'mahmud', 'mahmud əsəri', 'mahmud əsəri haqqında', 'mahmud əsəri haqqında məlumat'],
  openGraph: {
    title: 'haqqında • mahmud',
    description: 'mahmud əsəri haqqında ümumi məlumat səhifəsi.',
    url: `${process.env.NEXT_PUBLIC_APP_URL}/about`,
    type: 'website',
  },
  twitter: {
    title: 'haqqında • mahmud',
    description: 'mahmud əsəri haqqında ümumi məlumat səhifəsi.',
    card: 'summary_large_image',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/about`,
  },
  bookmarks: ['haqqında', 'mahmud', 'mahmud əsəri', 'mahmud əsəri haqqında', 'mahmud əsəri haqqında məlumat'],
  appLinks: {
    web: {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/about`,
    },
  },
  category: 'Reading',
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutPage() {
  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <h1 className='text-6xl font-serif text-gray-900 mb-4 text-center'>haqqında</h1>
      <p className='text-sm text-gray-600 mb-4 text-center'>mahmud əsəri haqqında ümumi məlumat</p>
      <article className='prose prose-lg max-w-none text-justify font-serif'>
        <p>
          "mahmud" əsəri Mehdi Əsədli tərəfindən bədahətən və şifahi danışılan Mahmud adlı personajın həyatından
          danışır. Bu personaj, təxminən, 2020-ci ildə yaradılıb. Mahmud əvvəllər sonsuz həyatı olan və tarix boyu,
          necəsə, bütün vacib hadisələrdə iştirak etmiş "karikaturist" biri idi. Bir neçə il sonra Mehdi Ə. "blogg" adlı
          saytında bu personaj haqqında yazılı bölümlər paylaşmağa başladı. Mahmudun hekayələri oxucular tərəfindən
          sevilsə də Mehdi Ə. bir müddət sonra bu hekayələri dayandırdı.
        </p>
        <br />
        <p>
          İllər sonra Mehdi Ə. yenidən Mahmudun həyatını yazmaq barəsində düşünməyə başladı və bu səfər hekayənin
          absurdluğunu, nisbətən, azaldaraq, daha mürəkkəb və daha realist bir hekayə yaratmaq istədi və sonunda bu
          fikir reallaşır. Bu səfər yeganə baxış bucağı olan personaj Mahmud deyil və Mahmuddan əlavə onlarla fərqli
          "baş" personaj deyə biləcəyimiz obraz var.
        </p>
        <br />
        <p>
          Ölümsüz bir personaj olan Mahmudun ölümsüzlüyünün səbəbini axtarmasını oxumaq istəyirsinizsə, bu saytdan
          bölümlərlə tanış ola bilərsiniz. Saytda bölümlərdən əlavə "wiki" hissəsində personajlar haqqında da məlumat
          toplamaq mümkündür.
        </p>
        <br />
        <p>Qeydiyyatdan keçib hesabınıza daxil olaraq:</p>
        <ul>
          <li>• bölümləri "oxundu" olaraq işarələyə bilərsiniz</li>
          <li>• sevdiyiniz bölümləri "favoritləyə" bilərsiniz</li>
          <li>• bölümlərin diskusiya hissəsində şərhlər yaza bilərsiniz</li>
          <li>• sevdiyiniz personajları "favoritləyə" bilərsiniz</li>
          {/* <li>• yeni bölüm paylaşıldıqda elektron poçtunuza xəbər ala bilərsiniz</li> */}
        </ul>
      </article>
    </div>
  );
}
