import { MetadataRoute } from 'next';
import { getAllChapters, getAllCharacters } from '@/lib/fetchers';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const chapters = await getAllChapters();
  const characters = await getAllCharacters();

  const chapterEntries: MetadataRoute.Sitemap = chapters.map((chapter) => ({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/${chapter.slug}`,
    changeFrequency: 'monthly',
    lastModified: chapter.updatedAt,
  }));

  const characterEntries: MetadataRoute.Sitemap = characters.map((character) => ({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/characters/${character.slug}`,
    changeFrequency: 'weekly',
    lastModified: character.updatedAt,
  }));

  return [
    {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`,
      changeFrequency: 'never',
      lastModified: new Date(),
    },
    {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/register`,
      changeFrequency: 'never',
      lastModified: new Date(),
    },
    {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
      changeFrequency: 'monthly',
      lastModified: new Date(),
    },
    ...chapterEntries,
    ...characterEntries,
  ];
}
