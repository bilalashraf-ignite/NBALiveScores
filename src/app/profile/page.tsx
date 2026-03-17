"use client";

import Link from "next/link";
import { useProfile } from "@/hooks/use-profile";
import { ProfileForm } from "@/components/profile-form";
import { AvatarUpload } from "@/components/avatar-upload";
import { LinkedAccounts } from "@/components/linked-accounts";
import { PasswordSection } from "@/components/password-section";
import { EmailVerification } from "@/components/email-verification";
import { WalletSection } from "@/components/wallet-section";

export default function ProfilePage() {
  const { profile, isLoading, error, updateProfile, refreshProfile } = useProfile();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
          <svg
            className="h-6 w-6 text-red-600 dark:text-red-400"
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
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          Error loading profile
        </h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{error}</p>
        <Link
          href="/signin"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile Settings
        </h1>
        <Link
          href="/"
          className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
        >
          Back to home
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {/* Avatar Section */}
        <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Profile Picture
          </h3>
          <AvatarUpload
            currentImage={profile.image}
            name={profile.name}
            email={profile.email}
            onUploadComplete={refreshProfile}
          />
        </div>

        {/* Profile Form */}
        <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            Personal Information
          </h3>
          <ProfileForm profile={profile} onSave={updateProfile} />
        </div>

        {/* Email Verification */}
        {!profile.emailVerified && (
          <div className="px-6 py-4">
            <EmailVerification
              email={profile.email}
              emailVerified={profile.emailVerified}
            />
          </div>
        )}

        {/* Linked Accounts */}
        <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700">
          <LinkedAccounts />
        </div>

        {/* Wallet Section */}
        <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700">
          <WalletSection />
        </div>

        {/* Password Section */}
        <div className="px-6 py-8">
          <PasswordSection />
        </div>
      </div>
    </>
  );
}
