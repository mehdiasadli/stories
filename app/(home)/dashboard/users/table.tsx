'use client';

import { User } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeading, CardHeader, CardTable, CardFooter } from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
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
import {
  Ellipsis,
  Search,
  X,
  MessageCircleIcon,
  EyeIcon,
  HeartIcon,
  BookmarkCheckIcon,
  BookOpenIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu';

interface TUser extends Omit<User, 'password' | 'updatedAt' | 'id'> {
  _count: {
    comments: number;
    characterViews: number;
    favoriteChapters: number;
    favoriteCharacters: number;
    reads: number;
  };
}

type IRow = Row<TUser>;

function ActionsCell({ row }: { row: IRow }) {
  const { copy } = useCopyToClipboard();

  const handleCopySlug = () => {
    copy(row.original.slug);
    toast.message(`User slug successfully copied: ${row.original.slug}`);
  };

  const handleVerifyUser = async () => {
    const response = await fetch(`/api/auth/admin-verify`, {
      method: 'POST',
      body: JSON.stringify({ slug: row.original.slug }),
    });

    if (response.ok) {
      toast.message('User verified successfully');
      window.location.reload();
    } else {
      toast.error('Failed to verify user');
    }
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
          <Link href={`/users/${row.original.slug}`}>Go to User</Link>
        </DropdownMenuItem>
        {row.original.hasAdminVerified ? null : (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleVerifyUser}>Verify User</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DashboardUsersTable({ users }: { users: TUser[] }) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    return users.filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery || item.name.toLowerCase().includes(searchLower) || item.email.toLowerCase().includes(searchLower);
      return matchesSearch;
    });
  }, [users, searchQuery]);

  const columns = useMemo<ColumnDef<TUser>[]>(
    () => [
      {
        accessorKey: 'name',
        id: 'name',
        header: ({ column }) => <DataGridColumnHeader title='Name' visibility={true} column={column} />,
        cell: ({ row }) => (
          <div className='font-medium text-foreground'>
            {row.original.name}
            {row.original.admin ? ' (Admin)' : ''}
          </div>
        ),
        size: 150,
        enableSorting: true,
        enableHiding: false,
        enableResizing: true,
      },
      {
        accessorKey: 'email',
        id: 'email',
        header: ({ column }) => <DataGridColumnHeader title='Email' visibility={true} column={column} />,
        cell: ({ row }) => <div className='font-medium text-foreground'>{row.original.email}</div>,
        size: 120,
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
        size: 100,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'isEmailVerified',
        id: 'isEmailVerified',
        header: ({ column }) => <DataGridColumnHeader title='Verified Email' visibility={true} column={column} />,
        cell: ({ row }) => (
          <div className='font-medium text-foreground'>
            {row.original.isEmailVerified ? (
              <Badge variant='success' appearance='outline'>
                Verified
              </Badge>
            ) : (
              <Badge variant='warning' appearance='outline'>
                Unverified
              </Badge>
            )}
          </div>
        ),
        size: 70,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'hasAdminVerified',
        id: 'hasAdminVerified',
        header: ({ column }) => <DataGridColumnHeader title='Verified Admin' visibility={true} column={column} />,
        cell: ({ row }) => (
          <div className='font-medium text-foreground'>
            {row.original.hasAdminVerified ? (
              <Badge variant='success' appearance='outline'>
                Verified
              </Badge>
            ) : (
              <Badge variant='warning' appearance='outline'>
                Unverified
              </Badge>
            )}
          </div>
        ),
        size: 70,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorFn: (row) =>
          `${row._count.comments} c. ${row._count.characterViews} v. ${row._count.favoriteChapters} f. ${row._count.favoriteCharacters} f. ${row._count.reads} r.`,
        id: 'stats',
        header: ({ column }) => <DataGridColumnHeader title='Stats' visibility={true} column={column} />,
        cell: ({ row }) => (
          <div className='font-medium text-foreground grid grid-cols-2 md:grid-cols-3 gap-1'>
            <span className='flex items-center gap-1'>
              {row.original._count.comments} <MessageCircleIcon className='size-3' />
            </span>
            <span className='flex items-center gap-1'>
              {row.original._count.characterViews} <EyeIcon className='size-3' />
            </span>
            <span className='flex items-center gap-1'>
              {row.original._count.favoriteChapters} <BookmarkCheckIcon className='size-3' />
            </span>
            <span className='flex items-center gap-1'>
              {row.original._count.favoriteCharacters} <HeartIcon className='size-3' />
            </span>
            <span className='flex items-center gap-1'>
              {row.original._count.reads} <BookOpenIcon className='size-3' />
            </span>
          </div>
        ),
        size: 100,
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
    data: filteredData as TUser[],
    pageCount: Math.ceil((filteredData?.length || 0) / pagination.pageSize),
    getRowId: (row: TUser) => row.slug,
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
