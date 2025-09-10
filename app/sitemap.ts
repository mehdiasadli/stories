import { MetadataRoute } from 'next';
import { getAllChapters, getAllCharacters } from '@/lib/fetchers';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = process.env.NEXT_PUBLIC_APP_URL;

  const chapters = await getAllChapters();
  const characters = await getAllCharacters();

  const chapterEntries: MetadataRoute.Sitemap = chapters.map((chapter) => ({
    url: `${url}/chapters/${chapter.slug}`,
    changeFrequency: 'monthly',
    lastModified: chapter.updatedAt,
  }));

  const characterEntries: MetadataRoute.Sitemap = characters.map((character) => ({
    url: `${url}/characters/${character.slug}`,
    changeFrequency: 'weekly',
    lastModified: character.updatedAt,
  }));

  return [
    {
      url: `${url}/`,
      changeFrequency: 'monthly',
      lastModified: new Date(),
    },
    {
      url: `${url}/about`,
      changeFrequency: 'yearly',
      lastModified: new Date(),
    },
    {
      url: `${url}/characters`,
      changeFrequency: 'weekly',
      lastModified: new Date(),
    },
    {
      url: `${url}/auth/login`,
      changeFrequency: 'never',
      lastModified: new Date(),
    },
    {
      url: `${url}/auth/register`,
      changeFrequency: 'never',
      lastModified: new Date(),
    },
    ...chapterEntries,
    ...characterEntries,
  ];
}
