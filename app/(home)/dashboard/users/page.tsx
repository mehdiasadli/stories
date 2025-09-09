import { getUsers } from '@/lib/fetchers';
import { DashboardUsersTable } from './table';

export default async function DashboardUsersPage() {
  const users = await getUsers();

  return <DashboardUsersTable users={users} />;
}
