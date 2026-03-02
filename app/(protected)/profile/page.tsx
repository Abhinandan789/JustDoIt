import { ProfileForm } from "@/components/ProfileForm";
import { getRequiredUser } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await getRequiredUser();

  if (!user) {
    return null;
  }

  const fallbackInitial = user.username.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Profile</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage account details used for deadline and streak calculations.</p>
      </header>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 dark:border-[#2a2a2a] dark:bg-[#1a1a1a]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Username</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user.username}</p>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Email</p>
            <p className="text-gray-900 dark:text-gray-100">{user.email}</p>
          </div>

          <div className="flex sm:justify-end">
            {user.profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profileImage}
                alt={`${user.username} profile`}
                className="h-28 w-28 rounded-xl border border-gray-300 object-cover shadow-sm dark:border-[#303030]"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-gray-300 bg-gray-100 text-3xl font-bold text-gray-700 dark:border-[#303030] dark:bg-[#202020] dark:text-gray-100">
                {fallbackInitial}
              </div>
            )}
          </div>
        </div>
      </div>

      <ProfileForm timezone={user.timezone} profileImage={user.profileImage} />
    </div>
  );
}


