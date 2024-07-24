"use client"

import UserList from '@/components/UserList';
import { withAuth } from '@/components/WithAuth';


const ManageUsers = () => {
  return (
    <div className='bg-slate-700 mt-24 py-10'>
      <UserList />
    </div>
  );
}

export default withAuth(ManageUsers, ['Admin']);