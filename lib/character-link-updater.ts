import { prisma } from './prisma';

/**
 * Updates character links in HTML content when a character's slug changes
 */
export async function updateCharacterLinksInWikis(oldSlug: string, newSlug: string): Promise<void> {
  if (oldSlug === newSlug) {
    return; // No change needed
  }

  try {
    // Find all characters that have wiki content containing links to the old slug
    const charactersWithLinks = await prisma.character.findMany({
      where: {
        wiki: {
          contains: `/characters/${oldSlug}`,
        },
      },
      select: {
        id: true,
        slug: true,
        wiki: true,
      },
    });

    // Update each character's wiki content
    for (const character of charactersWithLinks) {
      if (!character.wiki) continue;

      const updatedWiki = updateCharacterLinksInHtml(character.wiki, oldSlug, newSlug);

      if (updatedWiki !== character.wiki) {
        await prisma.character.update({
          where: { id: character.id },
          data: { wiki: updatedWiki },
        });

        console.log(`Updated character links in ${character.slug}'s wiki`);
      }
    }

    console.log(`Updated character links from ${oldSlug} to ${newSlug} in ${charactersWithLinks.length} wikis`);
  } catch (error) {
    console.error('Error updating character links in wikis:', error);
    throw error;
  }
}

/**
 * Updates character links in HTML content
 * Handles both absolute and relative URLs
 */
export function updateCharacterLinksInHtml(htmlContent: string, oldSlug: string, newSlug: string): string {
  if (!htmlContent || oldSlug === newSlug) {
    return htmlContent;
  }

  // Pattern to match character links in href attributes
  // Matches both absolute URLs (with domain) and relative URLs
  const patterns = [
    // Absolute URLs: href="https://domain.com/characters/old-slug"
    new RegExp(`href="([^"]*)/characters/${escapeRegExp(oldSlug)}"`, 'gi'),
    // Relative URLs: href="/characters/old-slug"
    new RegExp(`href="/characters/${escapeRegExp(oldSlug)}"`, 'gi'),
  ];

  let updatedContent = htmlContent;

  patterns.forEach((pattern) => {
    updatedContent = updatedContent.replace(pattern, (match, baseUrl) => {
      if (baseUrl) {
        // Absolute URL case
        return `href="${baseUrl}/characters/${newSlug}"`;
      } else {
        // Relative URL case
        return `href="/characters/${newSlug}"`;
      }
    });
  });

  return updatedContent;
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validates that a character link update is safe to perform
 */
export async function validateCharacterLinkUpdate(oldSlug: string, newSlug: string): Promise<boolean> {
  if (oldSlug === newSlug) {
    return true;
  }

  // Check if the new slug already exists (should be handled by character update validation)
  const existingCharacter = await prisma.character.findUnique({
    where: { slug: newSlug },
  });

  return !existingCharacter;
}
