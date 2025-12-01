import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Template from '@/models/Template';
import User from '@/models/User';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export default async function DashboardPage() {
  // For server components, we can't pass a real NextRequest, so we'll handle auth differently
  // We'll check for the auth token in cookies directly
  
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    redirect('/login');
  }

  // Verify token using the shared function
  const payload = await verifyToken(token);
  
  if (!payload) {
    redirect('/login');
  }

  await dbConnect();
  
  // Get statistics
  const templateCount = await Template.countDocuments();
  const userCount = await User.countDocuments();

  return (
    <div className="py-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
          </h2>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Total Templates</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{templateCount}</dd>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Admin Users</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{userCount}</dd>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Bot Status</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-green-500">Active</dd>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Getting Started</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage your Telegram bot auto-replies and settings.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Create Templates</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  <a href="/dashboard/templates" className="text-indigo-600 hover:text-indigo-900">
                    Go to Templates
                  </a>
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Setup Instructions</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Create auto-reply templates in the Templates section</li>
                    <li>Set up your Telegram bot with BotFather</li>
                    <li>Add your bot token to the .env.local file</li>
                    <li>Deploy your application and set the webhook</li>
                  </ol>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}