import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    // Fetch chapter with book and author information
    const chapter = await prisma.chapter.findUnique({
      where: { slug },
      include: { author: { select: { name: true } } },
    });

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // Check if user is author or chapter is published
    if (chapter.authorId !== session.user.id && chapter.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create HTML content with proper styling for PDF printing
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(chapter.title)}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman:ital,wght@0,400;0,700;1,400&display=swap');
          
          body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.6;
            margin: 0;
            padding: 40px;
            color: #000;
            background: white;
            max-width: 800px;
            margin: 0 auto;
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          
          .title {
            font-size: 24pt;
            font-weight: bold;
            margin-bottom: 10px;
            color: #000;
          }
          
          .description {
            font-size: 14pt;
            color: #666;
            margin-bottom: 20px;
          }
          
          .content {
            text-align: justify;
            font-size: 12pt;
            line-height: 1.8;
          }
          
          .content h1 {
            font-size: 18pt;
            font-weight: bold;
            margin: 30px 0 15px 0;
            color: #000;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
          }
          
          .content h2 {
            font-size: 16pt;
            font-weight: bold;
            margin: 25px 0 12px 0;
            color: #000;
          }
          
          .content h3 {
            font-size: 14pt;
            font-weight: bold;
            margin: 20px 0 10px 0;
            color: #000;
          }
          
          .content h4, .content h5, .content h6 {
            font-size: 12pt;
            font-weight: bold;
            margin: 15px 0 8px 0;
            color: #000;
          }
          
          .content p {
            margin: 0 0 15px 0;
            text-align: justify;
          }
          
          .content ul, .content ol {
            margin: 15px 0;
            padding-left: 25px;
          }
          
          .content li {
            margin: 6px 0;
          }
          
          .content blockquote {
            margin: 15px 0;
            padding: 15px 25px;
            border-left: 4px solid #ccc;
            background-color: #f9f9f9;
            font-style: italic;
          }
          
          .content strong {
            font-weight: bold;
          }
          
          .content em {
            font-style: italic;
          }
          
          .download-instructions {
            margin-top: 40px;
            padding: 20px;
            background-color: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 5px;
            text-align: center;
          }
          
          @media print {
            body {
              padding: 20px;
              font-size: 11pt;
            }
            
            .header {
              margin-bottom: 30px;
            }
            
            .download-instructions {
              display: none;
            }
          }
        </style>
        <script>
          // Auto-trigger print dialog when page loads
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 1000);
          };
        </script>
      </head>
      <body>
        <div class="header">
          <div class="title">${escapeHtml(chapter.title)}</div>
          <div class="description">Chapter ${chapter.order} • mahmud • ${escapeHtml(chapter.author.name)}</div>
        </div>
        
        <div class="content">
          ${chapter.content}
        </div>
        
        <div class="download-instructions">
          <p><strong>To save as PDF:</strong> Use your browser's print function (Ctrl+P / Cmd+P) and select "Save as PDF" as the destination.</p>
        </div>
      </body>
      </html>
    `;

    // Return HTML that can be printed to PDF by the browser
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="${chapter.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

// Helper function to escape HTML
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
