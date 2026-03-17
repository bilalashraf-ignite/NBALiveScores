"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type { Session } from "next-auth";

interface UserMenuProps {
  session: Session;
}

export function UserMenu({ session }: UserMenuProps) {
  const user = session.user;
  const initials =
    user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-shadow"
          aria-label="User menu"
        >
          {user?.image ? (
            <img
              src={user.image}
              alt={user.name || "Profile"}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {initials}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[200px] rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800 animate-in fade-in-0 zoom-in-95"
          sideOffset={8}
          align="end"
        >
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>

          <div className="py-1">
            <DropdownMenu.Item asChild>
              <Link
                href="/profile"
                className="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 cursor-pointer outline-none"
              >
                <ProfileIcon className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenu.Item>

            <DropdownMenu.Item asChild>
              <Link
                href="/profile#wallet"
                className="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 cursor-pointer outline-none"
              >
                <WalletIcon className="mr-2 h-4 w-4" />
                Wallet
              </Link>
            </DropdownMenu.Item>
          </div>

          <DropdownMenu.Separator className="my-1 h-px bg-gray-200 dark:bg-gray-700" />

          <DropdownMenu.Item
            className="flex w-full items-center rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 cursor-pointer outline-none"
            onSelect={() => signOut({ callbackUrl: "/" })}
          >
            <LogoutIcon className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  );
}
