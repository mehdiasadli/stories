/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/prisma';
import { TCharacterSearch } from '@/lib/schemas/character.schema';
import { TChapterSearch, TChapterSearchOfUser, TChapterSearchOfUserResource } from '@/lib/schemas/chapter.schema';
import { Prisma } from '@prisma/client';
import { cache } from 'react';

export const getAllChapters = cache(async (onlyPublished = true) => {
  return await prisma.chapter.findMany({
    where: {
      status: onlyPublished ? 'PUBLISHED' : undefined,
    },
    orderBy: {
      publishedAt: 'desc',
    },
    include: {
      _count: {
        select: {
          reads: true,
          favorites: true,
          comments: true,
        },
      },
    },
  });
});

export const getChaptersOfUser = cache(
  async (userId: string, resource: TChapterSearchOfUserResource, params: TChapterSearchOfUser) => {
    const { page } = params;
    const CHAPTERS_PER_PAGE = 6;

    const where: Prisma.ChapterWhereInput = {
      [resource]: { some: { userId } },
      status: 'PUBLISHED',
    };

    const [totalCount, chaptersData] = await prisma.$transaction(async (tx) => [
      await tx.chapter.count({ where }),
      await tx.chapter.findMany({
        where,
        skip: (page - 1) * CHAPTERS_PER_PAGE,
        take: CHAPTERS_PER_PAGE,
        include: {
          _count: {
            select: {
              reads: true,
              favorites: true,
              comments: true,
            },
          },
          author: { select: { name: true, slug: true } },
          reads: { select: { createdAt: true }, orderBy: { createdAt: 'desc' } },
          favorites: { select: { createdAt: true }, orderBy: { createdAt: 'desc' } },
          comments: {
            select: {
              _count: { select: { replies: true } },
              slug: true,
              content: true,
              user: { select: { name: true, slug: true } },
              createdAt: true,
              updatedAt: true,
              depth: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
    ]);

    const pagination = {
      total: totalCount,
      page,
      limit: CHAPTERS_PER_PAGE,
      hasNextPage: totalCount > page * CHAPTERS_PER_PAGE,
      hasPreviousPage: page > 1,
      totalPages: Math.ceil(totalCount / CHAPTERS_PER_PAGE),
      nextPage: totalCount > page * CHAPTERS_PER_PAGE ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
    };

    return {
      chapters: chaptersData,
      pagination,
    };
  }
);

function getDateRangeFilter(range: string) {
  const now = new Date();
  switch (range) {
    case 'today':
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { gte: startOfToday };
    case 'this-week':
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return { gte: startOfWeek };
    case 'this-month':
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return { gte: startOfMonth };
    case 'this-year':
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return { gte: startOfYear };
    case 'all-time':
    default:
      return undefined;
  }
}

export const getChapters = cache(async (params: TChapterSearch, dashboard?: boolean) => {
  const { page, q, order, dateRange, status } = params;

  // Single source of truth for pagination limit
  const CHAPTERS_PER_PAGE = 10;

  // Build date range filter

  // For "rising" order, ignore date range as it has its own recency logic
  const effectiveDateRange = order === 'rising' ? 'all-time' : dateRange || 'all-time';
  const dateFilter = getDateRangeFilter(effectiveDateRange);

  const where: Prisma.ChapterWhereInput = {
    // Status filter
    status: dashboard
      ? status && status.length > 0
        ? { in: status }
        : { in: ['PUBLISHED', 'DRAFT', 'ARCHIVED'] }
      : 'PUBLISHED',

    // Text search
    ...(q && q.length > 0
      ? {
          OR: [{ title: { contains: q, mode: 'insensitive' } }, { synopsis: { contains: q, mode: 'insensitive' } }],
        }
      : {}),

    // Date range filter (disabled for "rising" order)
    ...(dateFilter ? { publishedAt: dateFilter } : {}),
  };

  let orderBy: Prisma.ChapterOrderByWithRelationInput[] = [];
  let useRawQuery = false;

  switch (order) {
    case 'newest':
      orderBy = [{ order: 'desc' }, { publishedAt: 'desc' }];
      break;
    case 'oldest':
      orderBy = [{ order: 'asc' }, { publishedAt: 'asc' }];
      break;
    case 'alphabetical-asc':
      orderBy = [{ title: 'asc' }, { order: 'desc' }];
      break;
    case 'alphabetical-desc':
      orderBy = [{ title: 'desc' }, { order: 'desc' }];
      break;
    case 'most-comments':
      orderBy = [{ comments: { _count: 'desc' } }, { order: 'desc' }];
      break;
    case 'most-read':
      orderBy = [{ reads: { _count: 'desc' } }, { order: 'desc' }];
      break;
    case 'most-favorited':
      orderBy = [{ favorites: { _count: 'desc' } }, { order: 'desc' }];
      break;
    case 'longest':
      orderBy = [{ wordCount: 'desc' }, { order: 'desc' }];
      break;
    case 'shortest':
      orderBy = [{ wordCount: 'asc' }, { order: 'desc' }];
      break;
    case 'popular':
    case 'rising':
      useRawQuery = true;
      break;
    default:
      orderBy = [{ order: 'desc' }, { publishedAt: 'desc' }];
  }

  let total: number;
  let chapters: any[];

  if (useRawQuery && (order === 'popular' || order === 'rising')) {
    // For popular and rising, we need custom scoring
    const limit = CHAPTERS_PER_PAGE;
    const offset = (page - 1) * limit;

    // Build WHERE clause for raw query
    let whereClause = '';
    const whereParams: any[] = [];
    let paramIndex = 1;

    // Status filter
    if (dashboard) {
      if (status && status.length > 0) {
        whereClause += ` AND c.status::text IN (${status.map(() => `$${paramIndex++}`).join(',')})`;
        whereParams.push(...status);
      } else {
        whereClause += ` AND c.status::text IN ($${paramIndex++}, $${paramIndex++}, $${paramIndex++})`;
        whereParams.push('PUBLISHED', 'DRAFT', 'ARCHIVED');
      }
    } else {
      whereClause += ` AND c.status::text = $${paramIndex++}`;
      whereParams.push('PUBLISHED');
    }

    // Text search
    if (q && q.length > 0) {
      whereClause += ` AND (c.title ILIKE $${paramIndex++} OR c.synopsis ILIKE $${paramIndex++})`;
      whereParams.push(`%${q}%`, `%${q}%`);
    }

    // Date range (automatically disabled for "rising" order)
    if (dateFilter) {
      whereClause += ` AND c."publishedAt" >= $${paramIndex++}`;
      whereParams.push(dateFilter.gte);
    }

    // Calculate score based on order type
    let scoreFormula = '';
    if (order === 'popular') {
      // Popular: pure engagement score
      scoreFormula = `(
        COALESCE(reads_count, 0) * 1.0 + 
        COALESCE(favorites_count, 0) * 2.0 + 
        COALESCE(comments_count, 0) * 3.0
      )`;
    } else if (order === 'rising') {
      // Rising: engagement score with recency boost
      scoreFormula = `(
        COALESCE(reads_count, 0) * 1.0 + 
        COALESCE(favorites_count, 0) * 2.0 + 
        COALESCE(comments_count, 0) * 3.0
      ) * (
        1 + EXP(-EXTRACT(EPOCH FROM (NOW() - c."publishedAt")) / 86400.0 / 7.0)
      )`;
    }

    const countQuery = `
      SELECT COUNT(*)::int as total
      FROM chapters c
      WHERE 1=1 ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        c.*,
        u.name as author_name,
        u.slug as author_slug,
        COALESCE(rc.reads_count, 0) as reads_count,
        COALESCE(fc.favorites_count, 0) as favorites_count,
        COALESCE(cc.comments_count, 0) as comments_count,
        ${scoreFormula} as score
      FROM chapters c
      LEFT JOIN users u ON c."authorId" = u.id
      LEFT JOIN (SELECT "chapterId", COUNT(*) as reads_count FROM chapter_reads GROUP BY "chapterId") rc ON c.id = rc."chapterId"
      LEFT JOIN (SELECT "chapterId", COUNT(*) as favorites_count FROM favorite_chapters GROUP BY "chapterId") fc ON c.id = fc."chapterId"
      LEFT JOIN (SELECT "chapterId", COUNT(*) as comments_count FROM comments GROUP BY "chapterId") cc ON c.id = cc."chapterId"
      WHERE 1=1 ${whereClause}
      ORDER BY score DESC, c."order" DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    whereParams.push(limit, offset);

    const countResult = (await prisma.$queryRawUnsafe(countQuery, ...whereParams.slice(0, -2))) as [{ total: number }];
    const chaptersResult = (await prisma.$queryRawUnsafe(dataQuery, ...whereParams)) as any[];

    total = countResult[0].total;
    chapters = chaptersResult.map((chapter: any) => ({
      ...chapter,
      author: {
        name: chapter.author_name,
        slug: chapter.author_slug,
      },
      _count: {
        reads: parseInt(chapter.reads_count) || 0,
        favorites: parseInt(chapter.favorites_count) || 0,
        comments: parseInt(chapter.comments_count) || 0,
      },
    }));
  } else {
    // Standard Prisma query for other orderings
    const [totalCount, chaptersData] = await prisma.$transaction(async (tx) => [
      await tx.chapter.count({
        where,
      }),
      await tx.chapter.findMany({
        where,
        orderBy,
        skip: (page - 1) * CHAPTERS_PER_PAGE,
        take: CHAPTERS_PER_PAGE,
        include: {
          author: {
            select: {
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              reads: true,
              favorites: true,
              comments: true,
            },
          },
        },
      }),
    ]);

    total = totalCount;
    chapters = chaptersData;
  }

  const pagination = {
    total,
    page,
    limit: CHAPTERS_PER_PAGE,
    hasNextPage: total > page * CHAPTERS_PER_PAGE,
    hasPreviousPage: page > 1,
    totalPages: Math.ceil(total / CHAPTERS_PER_PAGE),
    nextPage: total > page * CHAPTERS_PER_PAGE ? page + 1 : null,
    previousPage: page > 1 ? page - 1 : null,
  };

  return {
    chapters,
    pagination,
  };
});

export const getChapter = cache(async (chapterSlug: string, onlyPublished: boolean = false) => {
  return await prisma.chapter.findUnique({
    where: {
      slug: chapterSlug,
      ...(onlyPublished && { status: 'PUBLISHED' }),
    },
    include: {
      _count: {
        select: {
          reads: true,
          favorites: true,
          comments: true,
        },
      },
      author: {
        select: {
          name: true,
          slug: true,
        },
      },
      characters: {
        include: {
          character: {
            select: {
              id: true,
              name: true,
              slug: true,
              gender: true,
            },
          },
        },
      },
    },
  });
});

export const getInitialComments = cache(async (chapterId: string) => {
  return await prisma.comment.findMany({
    where: {
      chapterId,
      parentId: null, // Only get top-level comments
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
      replies: {
        include: {
          replies: {
            include: {
              replies: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                    },
                  },
                  _count: {
                    select: {
                      replies: true,
                    },
                  },
                },
              },
              user: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
              _count: {
                select: {
                  replies: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
});

export type TPagination = {
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalPages: number;
  nextPage: number | null;
  previousPage: number | null;
};

export const getProfileUser = cache(async (slug: string) => {
  return await prisma.user.findUnique({
    where: { slug },
    omit: { password: true },
  });
});

export const getUsers = cache(async () => {
  return await prisma.user.findMany({
    select: {
      slug: true,
      name: true,
      email: true,
      admin: true,
      isVerified: true,
      createdAt: true,
      _count: {
        select: {
          comments: true,
          characterViews: true,
          favoriteChapters: true,
          favoriteCharacters: true,
          reads: true,
        },
      },
    },
  });
});

export const getAllCharacters = cache(async (type: 'published' | 'unpublished' | 'all' = 'all') => {
  return await prisma.character.findMany({
    where: {
      published: type === 'published' ? true : type === 'unpublished' ? false : undefined,
    },
    orderBy: {
      name: 'asc',
    },
    include: {
      chapters: {
        select: {
          appearanceType: true,
          chapter: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
      },
      _count: {
        select: {
          chapters: true,
          favorites: true,
          views: true,
        },
      },
    },
  });
});

export const getAuthorId = cache(async () => {
  // all chapters have only one author, so we can just get the first one
  const chapter = await prisma.chapter.findFirst({
    select: {
      authorId: true,
    },
  });

  if (!chapter) {
    return null;
  }

  return chapter.authorId;
});

export const getCharacter = cache(async (characterSlug: string) => {
  return await prisma.character.findUnique({
    where: {
      slug: characterSlug,
    },
    include: {
      _count: {
        select: {
          views: true,
          favorites: true,
          chapters: true,
        },
      },
      chapters: {
        select: {
          appearanceType: true,
          note: true,
          quotesAndThoughts: true,
          chapter: {
            select: {
              id: true,
              slug: true,
              title: true,
              order: true,
              publishedAt: true,
            },
          },
        },
        orderBy: {
          chapter: {
            order: 'asc',
          },
        },
      },
    },
  });
});

export const getCharacters = cache(async (params: TCharacterSearch, dashboard?: boolean) => {
  const { page, q } = params;
  const CHARACTERS_PER_PAGE = 20;

  const where: Prisma.CharacterWhereInput = {
    published: dashboard ? undefined : true,
    ...(q && q.length > 0
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { nameDescription: { contains: q, mode: 'insensitive' } },
            { aliases: { hasSome: [q] } },
          ],
        }
      : {}),
  };

  const [total, characters] = await prisma.$transaction(async (tx) => [
    await tx.character.count({ where }),
    await tx.character.findMany({
      where,
      skip: (page - 1) * CHARACTERS_PER_PAGE,
      take: CHARACTERS_PER_PAGE,
      orderBy: {
        name: 'asc', // Default alphabetical order
      },
      include: {
        _count: {
          select: {
            chapters: true,
            favorites: true,
            views: true,
          },
        },
        chapters: {
          select: {
            appearanceType: true,
            note: true,
            chapter: true,
            quotesAndThoughts: true,
          },
        },
      },
    }),
  ]);

  const pagination = {
    total,
    page,
    limit: CHARACTERS_PER_PAGE,
    hasNextPage: total > page * CHARACTERS_PER_PAGE,
    hasPreviousPage: page > 1,
    totalPages: Math.ceil(total / CHARACTERS_PER_PAGE),
    nextPage: total > page * CHARACTERS_PER_PAGE ? page + 1 : null,
    previousPage: page > 1 ? page - 1 : null,
  };

  return {
    characters,
    pagination,
  };
});

export const searchCharacters = cache(async (q: string, dashboard?: boolean) => {
  const trimmedQ = q.trim();

  if (!trimmedQ) {
    return [];
  }

  const characters = await prisma.character.findMany({
    take: 10,

    where: {
      published: dashboard ? undefined : true,
      OR: [
        { name: { contains: trimmedQ, mode: 'insensitive' } },
        { nameDescription: { contains: trimmedQ, mode: 'insensitive' } },
        { aliases: { hasSome: [trimmedQ] } },
      ],
    },

    select: {
      slug: true,
      name: true,
      nameDescription: true,
      description: true,
      profileImageUrl: true,
    },
  });

  return characters;
});

export const getRecommendedCharacters = cache(async (currentCharacterSlug: string) => {
  const currentCharacter = await prisma.character.findUnique({
    where: { slug: currentCharacterSlug },
  });

  if (!currentCharacter) {
    return [];
  }

  // recommendation scoring rules:
  // 1. if characters has appearance in the same chapter, give a score of 10
  // 2. if characters has appearance in the same chapter, give a score of 5
  // 3. if characters has appearance in the same chapter, give a score of 1
});

export const getLatestUpdatedCharacters = cache(async () => {
  return await prisma.character.findMany({
    where: { published: true },
    orderBy: { updatedAt: 'desc' },
    take: 2,
    include: {
      _count: {
        select: {
          chapters: true,
          favorites: true,
          views: true,
        },
      },
      chapters: {
        select: {
          appearanceType: true,
          note: true,
          chapter: true,
          quotesAndThoughts: true,
        },
      },
    },
  });
});

export const getMostFavoritedCharacters = cache(async () => {
  const characters = await prisma.character.findMany({
    where: { published: true },
    orderBy: { favorites: { _count: 'desc' } },
    take: 2,
    include: {
      chapters: {
        select: {
          appearanceType: true,
          note: true,
          chapter: true,
          quotesAndThoughts: true,
        },
      },
      _count: {
        select: {
          chapters: true,
          favorites: true,
          views: true,
        },
      },
    },
  });

  return characters.filter((ch) => ch._count.favorites > 0);
});

export const getMostViewedCharacters = cache(async () => {
  const characters = await prisma.character.findMany({
    where: { published: true },
    orderBy: { views: { _count: 'desc' } },
    take: 2,
    include: {
      chapters: {
        select: {
          appearanceType: true,
          note: true,
          chapter: true,
          quotesAndThoughts: true,
        },
      },
      _count: {
        select: {
          chapters: true,
          favorites: true,
          views: true,
        },
      },
    },
  });

  return characters.filter((ch) => ch._count.views > 0);
});

export const getMostAppearedCharacters = cache(async () => {
  const characters = await prisma.character.findMany({
    where: { published: true },
    orderBy: { chapters: { _count: 'desc' } },
    take: 2,
    include: {
      chapters: {
        select: {
          appearanceType: true,
          note: true,
          chapter: true,
          quotesAndThoughts: true,
        },
      },
      _count: {
        select: {
          chapters: true,
          favorites: true,
          views: true,
        },
      },
    },
  });

  return characters.filter((ch) => ch._count.chapters > 0);
});

export const getWikiCharacters = cache(async () => {
  const [mostFavoritedCharacters, latestUpdatedCharacters, mostViewedCharacters, mostAppearedCharacters] =
    await Promise.all([
      getMostFavoritedCharacters(),
      getLatestUpdatedCharacters(),
      getMostViewedCharacters(),
      getMostAppearedCharacters(),
    ]);

  return {
    mostFavoritedCharacters,
    latestUpdatedCharacters,
    mostViewedCharacters,
    mostAppearedCharacters,
  };
});

export const getReadersOfChapter = cache(async (chapterSlug: string) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      slug: chapterSlug,
    },
    select: {
      title: true,
      slug: true,
    },
  });

  if (!chapter) {
    return null;
  }

  const readers = await prisma.chapterRead.findMany({
    orderBy: { createdAt: 'desc' },
    where: {
      chapter: {
        slug: chapter.slug,
      },
    },
    select: {
      createdAt: true,
      user: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  return {
    chapter,
    readers,
  };
});

export const getFavoritesOfChapter = cache(async (chapterSlug: string) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      slug: chapterSlug,
    },
    select: {
      title: true,
      slug: true,
    },
  });

  if (!chapter) {
    return null;
  }

  const favorites = await prisma.favoriteChapter.findMany({
    orderBy: { createdAt: 'desc' },
    where: {
      chapter: { slug: chapter.slug },
    },
    select: {
      createdAt: true,
      user: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  return {
    chapter,
    favorites,
  };
});

export const getViewsOfCharacter = cache(async (characterSlug: string) => {
  const character = await prisma.character.findUnique({
    where: {
      slug: characterSlug,
    },
    select: {
      name: true,
      slug: true,
    },
  });

  if (!character) {
    return null;
  }

  const views = await prisma.characterView.findMany({
    orderBy: { createdAt: 'desc' },
    where: {
      character: { slug: character.slug },
    },
    select: {
      createdAt: true,
      user: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  return {
    character,
    views,
  };
});

export const getFavoritesOfCharacter = cache(async (characterSlug: string) => {
  const character = await prisma.character.findUnique({
    where: {
      slug: characterSlug,
    },
    select: {
      name: true,
      slug: true,
    },
  });

  if (!character) {
    return null;
  }

  const favorites = await prisma.favoriteCharacter.findMany({
    orderBy: { createdAt: 'desc' },
    where: { character: { slug: character.slug } },
    select: {
      createdAt: true,
      user: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  return {
    character,
    favorites,
  };
});

export const getNotifications = cache(async (userId: string, readType: 'read' | 'unread' | 'all' = 'all') => {
  return await prisma.notification.findMany({
    where: { userId, ...(readType === 'read' && { read: true }), ...(readType === 'unread' && { read: false }) },
    orderBy: { createdAt: 'desc' },
  });
});

export const getNotificationsCount = cache(async (userId: string, readType: 'read' | 'unread' | 'all' = 'all') => {
  return await prisma.notification.count({
    where: { userId, ...(readType === 'read' && { read: true }), ...(readType === 'unread' && { read: false }) },
  });
});
