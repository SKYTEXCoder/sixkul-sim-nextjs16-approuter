/**
 * Unauthorized Page
 * 
 * Displayed when a user tries to access a route they don't have permission for.
 */

import Link from 'next/link';

export default function UnauthorizedPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  const message = searchParams.message || 'Anda tidak memiliki akses ke halaman ini.';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl text-center">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Akses Ditolak
        </h1>

        {/* Error Code */}
        <p className="text-5xl font-bold text-red-500 mb-4">401 Unauthorized</p>

        {/* Message */}
        <p className="text-gray-600 mb-8">{message}</p>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Kembali ke Dashboard
          </Link>
          <Link
            href="/login"
            className="block w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Login dengan Akun Lain
          </Link>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-sm text-gray-500">
          Jika Anda merasa ini adalah kesalahan, <br /> silakan hubungi administrator.
        </p>
      </div>
    </div>
  );
}
