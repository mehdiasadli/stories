'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeading, CardHeader, CardToolbar, CardTable, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { TChapter } from '@/lib/schemas/chapter.schema';
import { ContentStatus } from '@prisma/client';
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
import { Ellipsis, Filter, Search, BookPlus, X, MessageCircleIcon, HeartIcon, BookOpenIcon } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface IData extends TChapter {
  _count: {
    reads: number;
    favorites: number;
    comments: number;
  };
}

type IRow = Row<IData>;

function ActionsCell({ row }: { row: IRow }) {
  const { copy } = useCopyToClipboard();

  const handleCopySlug = () => {
    copy(row.original.slug);
    toast.message(`Chapter slug successfully copied: ${row.original.slug}`);
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
          <Link href={`/chapters/${row.original.slug}`}>Go to Chapter</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/preview/og/chapters/${row.original.slug}`}>Preview OG</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/chapters/${row.original.slug}/edit`}>Edit Chapter</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/chapters/${row.original.slug}/edit/content`}>Edit Content</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/chapters/${row.original.slug}/edit/characters`}>Edit Characters</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/chapters/${row.original.slug}/delete`}>Delete Chapter</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DashboardChaptersTable({ chapters }: { chapters: TChapter[] }) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<SortingState>([{ id: 'order', desc: false }]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<ContentStatus[]>([]);

  const filteredData = useMemo(() => {
    return chapters.filter((item) => {
      // Filter by status
      const matchesStatus = !selectedStatuses?.length || selectedStatuses.includes(item.status);
      // Filter by search query (case-insensitive)
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchLower) ||
        item.synopsis?.toLowerCase().includes(searchLower);
      return matchesStatus && matchesSearch;
    });
  }, [chapters, searchQuery, selectedStatuses]);

  const statusCounts = useMemo(() => {
    return chapters.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      },
      {} as Record<ContentStatus, number>
    );
  }, [chapters]);

  const handleStatusChange = (checked: boolean, value: ContentStatus) => {
    setSelectedStatuses(
      (
        prev = [] // Default to an empty array
      ) => (checked ? [...prev, value] : prev.filter((v) => v !== value))
    );
  };

  const columns = useMemo<ColumnDef<IData>[]>(
    () => [
      {
        accessorKey: 'title',
        id: 'title',
        header: ({ column }) => <DataGridColumnHeader title='Title' visibility={true} column={column} />,
        cell: ({ row }) => <div className='font-medium text-foreground'>{row.original.title}</div>,
        size: 150,
        enableSorting: true,
        enableHiding: false,
        enableResizing: true,
      },
      {
        accessorKey: 'order',
        id: 'order',
        header: ({ column }) => <DataGridColumnHeader title='Order' visibility={true} column={column} />,
        cell: ({ row }) => <div className='font-medium text-foreground'>{row.original.order}</div>,
        size: 50,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'publishedAt',
        id: 'publishedAt',
        header: ({ column }) => <DataGridColumnHeader title='Published At' visibility={true} column={column} />,
        cell: ({ row }) => (
          <div className='font-medium text-foreground'>
            {!row.original.publishedAt ? '-' : format(row.original.publishedAt, 'dd.MM.yyyy, HH:mm')}
          </div>
        ),
        size: 100,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'status',
        id: 'status',
        header: ({ column }) => <DataGridColumnHeader title='Status' visibility={true} column={column} />,
        cell: ({ row }) => (
          <div className='font-medium text-foreground'>
            {row.original.status === 'PUBLISHED' ? (
              <Badge variant='primary' appearance='outline'>
                Published
              </Badge>
            ) : row.original.status === 'DRAFT' ? (
              <Badge variant='secondary' appearance='outline'>
                Draft
              </Badge>
            ) : (
              <Badge variant='destructive' appearance='outline'>
                Archived
              </Badge>
            )}
          </div>
        ),
        size: 100,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorFn: (row) => `${row._count.comments} c. ${row._count.reads} r. ${row._count.favorites} f.`,
        id: 'stats',
        header: ({ column }) => <DataGridColumnHeader title='Stats' visibility={true} column={column} />,
        sortingFn: (rowA, rowB) => {
          const totalA = rowA.original._count.comments + rowA.original._count.favorites + rowA.original._count.reads;
          const totalB = rowB.original._count.comments + rowB.original._count.favorites + rowB.original._count.reads;
          return totalA - totalB;
        },
        cell: ({ row }) => {
          return (
            <div className='font-medium text-foreground grid grid-cols-2 md:grid-cols-3 gap-1'>
              <span className='flex items-center gap-1' title='Comments'>
                {row.original._count.comments} <MessageCircleIcon className='size-3' />
              </span>
              <span className='flex items-center gap-1' title='Reads'>
                {row.original._count.reads} <BookOpenIcon className='size-3' />
              </span>
              <span className='flex items-center gap-1' title='Favorites'>
                {row.original._count.favorites} <HeartIcon className='size-3' />
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='outline'>
                    <Filter />
                    Status
                    {selectedStatuses.length > 0 && (
                      <Badge size='sm' appearance='outline'>
                        {selectedStatuses.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-40 p-3' align='start'>
                  <div className='space-y-3'>
                    <div className='text-xs font-medium text-muted-foreground'>Filters</div>
                    <div className='space-y-3'>
                      {Object.keys(statusCounts).map((status) => (
                        <div key={status} className='flex items-center gap-2.5'>
                          <Checkbox
                            id={status}
                            checked={selectedStatuses.includes(status as ContentStatus)}
                            onCheckedChange={(checked) => handleStatusChange(checked === true, status as ContentStatus)}
                          />
                          <Label
                            htmlFor={status}
                            className='grow flex items-center justify-between font-normal gap-1.5'
                          >
                            {status}
                            <span className='text-muted-foreground'>{statusCounts[status as ContentStatus]}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardHeading>
          <CardToolbar>
            <Button asChild>
              <Link href='/dashboard/chapters/create'>
                <BookPlus />
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
