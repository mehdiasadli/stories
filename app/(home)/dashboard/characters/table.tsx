'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeading, CardHeader, CardToolbar, CardTable, CardFooter } from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { TCharacter } from '@/lib/schemas/character.schema';
import { CharacterAppearanceType } from '@prisma/client';
import {
  ColumnDef,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getCoreRowModel,
  PaginationState,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Ellipsis, Search, X, UserPlus, EyeIcon, UserIcon, AtSignIcon, BookOpenIcon } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface IData extends TCharacter {
  _count: {
    chapters: number;
    favorites: number;
    views: number;
  };
  chapters: {
    appearanceType: CharacterAppearanceType;
    chapter: {
      title: string;
      slug: string;
    };
  }[];
}

type IRow = Row<IData>;

function ActionsCell({ row }: { row: IRow }) {
  const { copy } = useCopyToClipboard();

  const handleCopySlug = () => {
    copy(row.original.slug);
    toast.message(`Character slug successfully copied: ${row.original.slug}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className='size-7' mode='icon' variant='ghost'>
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side='bottom' align='end'>
        <DropdownMenuItem onClick={handleCopySlug}>Copy Slug</DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/characters/${row.original.slug}`}>Go to Character</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/characters/${row.original.slug}/edit`}>Edit Character</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/characters/${row.original.slug}/edit/wiki`}>Edit Wiki</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/characters/${row.original.slug}/delete`}>Delete Character</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DashboardCharactersTable({ characters }: { characters: IData[] }) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    return characters.filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower);
      return matchesSearch;
    });
  }, [characters, searchQuery]);

  const columns = useMemo<ColumnDef<IData>[]>(
    () => [
      {
        accessorKey: 'name',
        id: 'name',
        header: ({ column }) => <DataGridColumnHeader title='Name' visibility={true} column={column} />,
        cell: ({ row }) => <div className='font-medium text-foreground'>{row.original.name}</div>,
        size: 100,
        enableSorting: true,
        enableHiding: false,
        enableResizing: true,
      },
      {
        accessorKey: 'published',
        id: 'published',
        header: ({ column }) => <DataGridColumnHeader title='Published' visibility={true} column={column} />,
        cell: ({ row }) => <div className='font-medium text-foreground'>{row.original.published ? 'Yes' : 'No'}</div>,
        size: 40,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'createdAt',
        id: 'createdAt',
        header: ({ column }) => <DataGridColumnHeader title='Created At' visibility={true} column={column} />,
        cell: ({ row }) => (
          <div className='font-medium text-foreground'>
            {!row.original.createdAt ? '-' : format(row.original.createdAt, 'dd.MM.yyyy, HH:mm')}
          </div>
        ),
        size: 80,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'aliases',
        id: 'aliases',
        header: ({ column }) => <DataGridColumnHeader title='Aliases' visibility={true} column={column} />,
        cell: ({ row }) => <div className='font-medium text-foreground'>{(row.original.aliases || []).join(', ')}</div>,
        size: 90,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorFn: (row) => `${row._count.chapters} p. ${row._count.favorites} f. ${row._count.views} v.`,
        id: 'stats',
        header: ({ column }) => <DataGridColumnHeader title='Stats' visibility={true} column={column} />,
        sortingFn: (rowA, rowB) => {
          const totalA = rowA.original._count.chapters;
          const totalB = rowB.original._count.chapters;
          return totalA - totalB;
        },
        cell: ({ row }) => {
          const pov = row.original.chapters.filter((c) => c.appearanceType === 'POV').length;
          const appearance = row.original.chapters.filter((c) => c.appearanceType === 'APPEARANCE').length;
          const mention = row.original.chapters.filter((c) => c.appearanceType === 'MENTION').length;

          return (
            <div className='font-medium text-foreground grid grid-cols-2 md:grid-cols-3 gap-1'>
              <span className='flex items-center gap-1' title='POV'>
                {pov} <EyeIcon className='size-3' />
              </span>
              <span className='flex items-center gap-1' title='Appearance'>
                {appearance} <UserIcon className='size-3' />
              </span>
              <span className='flex items-center gap-1' title='Mention'>
                {mention} <AtSignIcon className='size-3' />
              </span>
            </div>
          );
        },
        size: 60,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'actions',
        id: 'actions',
        header: '',
        cell: ({ row }) => <ActionsCell row={row} />,
        size: 60,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
      },
    ],
    []
  );

  const [columnOrder, setColumnOrder] = useState<string[]>(columns.map((column) => column.id as string));

  const table = useReactTable({
    columns,
    data: filteredData as IData[],
    pageCount: Math.ceil((filteredData?.length || 0) / pagination.pageSize),
    getRowId: (row: IData) => row.id,
    state: {
      pagination,
      sorting,
      columnOrder,
    },
    columnResizeMode: 'onChange',
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <DataGrid
      table={table}
      recordCount={filteredData?.length || 0}
      tableLayout={{
        columnsPinnable: true,
        columnsResizable: true,
        columnsMovable: true,
        columnsVisibility: true,
      }}
    >
      <Card>
        <CardHeader className='py-4'>
          <CardHeading>
            <div className='flex items-center gap-2.5'>
              <div className='relative'>
                <Search className='size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2' />
                <Input
                  placeholder='Search...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='ps-9 w-40'
                />
                {searchQuery.length > 0 && (
                  <Button
                    mode='icon'
                    variant='ghost'
                    className='absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6'
                    onClick={() => setSearchQuery('')}
                  >
                    <X />
                  </Button>
                )}
              </div>
            </div>
          </CardHeading>
          <CardToolbar>
            <Button asChild>
              <Link href='/dashboard/characters/create'>
                <UserPlus />
                Add new
              </Link>
            </Button>
          </CardToolbar>
        </CardHeader>
        <CardTable>
          <ScrollArea>
            <DataGridTable />
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
        </CardTable>
        <CardFooter>
          <DataGridPagination />
        </CardFooter>
      </Card>
    </DataGrid>
  );
}
