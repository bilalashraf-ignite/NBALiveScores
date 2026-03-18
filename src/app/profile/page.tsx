'use client';

import Link from 'next/link';
import { useProfile } from '@/hooks/use-profile';
import { DashboardHeader } from '@/components/header/dashboard-header';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { LeftSidebar } from '@/components/sidebar/left-sidebar';
import { ProfileHeader } from '@/components/profile/profile-header';
import { DigitalAssets, PortfolioDiversity } from '@/components/wallet/wallet-display';
import { CryptoTransactions } from '@/components/wallet/crypto-transactions';
import { WalletConnector } from '@/components/wallet/wallet-connector';
import { ProfileForm } from '@/components/profile-form';
import { LinkedAccounts } from '@/components/linked-accounts';
import { PasswordSection } from '@/components/password-section';
import { useState } from 'react';

// Sidebar items for profile page
const profileNavItems = [
  { id: 'dashboard', name: 'Dashboard', icon: '📊' },
  { id: 'market', name: 'Market', icon: '📈' },
  { id: 'wallet', name: 'Wallet', icon: '💳' },
  { id: 'settings', name: 'Settings', icon: '⚙️' },
];

const supportItems = [
  { id: 'help', name: 'Help Center', icon: '❓' },
  { id: 'chat', name: 'Live Chat', icon: '💬' },
];

export default function ProfilePage() {
  const { profile, isLoading, error, updateProfile, refreshProfile } = useProfile();
  const [activeTab, setActiveTab] = useState('wallet');
  const [activeSection, setActiveSection] = useState<'overview' | 'settings'>('overview');

  if (isLoading) {
    return (
      <>
        <DashboardHeader activeTab="wallet" onTabChange={() => {}} />
        <DashboardLayout>
          <div className="animate-pulse space-y-6 p-6">
            <div className="h-32 bg-[#1a1a2e] rounded-2xl" />
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-[#1a1a2e] rounded-xl" />
              ))}
            </div>
            <div className="h-64 bg-[#1a1a2e] rounded-xl" />
          </div>
        </DashboardLayout>
      </>
    );
  }

  if (error) {
    return (
      <>
        <DashboardHeader activeTab="wallet" onTabChange={() => {}} />
        <DashboardLayout>
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">Error loading profile</h3>
            <p className="text-gray-400 mt-2">{error}</p>
            <Link
              href="/signin"
              className="inline-block mt-4 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium"
            >
              Sign in
            </Link>
          </div>
        </DashboardLayout>
      </>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <>
      <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <DashboardLayout
        leftSidebar={
          <div className="h-full flex flex-col">
            {/* Navigation */}
            <div className="p-4 space-y-2">
              {profileNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id === 'settings' ? 'settings' : 'overview')}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl
                    text-left text-sm font-medium transition-all duration-200
                    ${item.id === 'wallet'
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-[#1a1a2e]'
                    }
                  `}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="mx-4 my-2 border-t border-purple-500/10" />

            {/* Support */}
            <div className="p-4 space-y-2">
              <p className="px-4 text-xs text-gray-500 uppercase tracking-wider">Support</p>
              {supportItems.map((item) => (
                <button
                  key={item.id}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium text-gray-400 hover:text-white hover:bg-[#1a1a2e] transition-all duration-200"
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        }
        rightSidebar={
          <div className="p-4 space-y-4">
            <WalletConnector />
            <PortfolioDiversity />
          </div>
        }
      >
        {activeSection === 'overview' ? (
          <div className="space-y-6">
            {/* Profile Header */}
            <ProfileHeader
              name={profile.name || 'User'}
              username={profile.email?.split('@')[0]}
              avatarUrl={profile.image}
            />

            {/* Digital Assets */}
            <DigitalAssets />

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Transactions */}
              <CryptoTransactions />

              {/* Linked Accounts */}
              <div className="p-4 rounded-xl bg-[#16162a] border border-purple-500/10">
                <h3 className="text-lg font-semibold text-white mb-4">Linked Accounts</h3>
                <LinkedAccounts />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Settings View */}
            <div className="p-6 rounded-xl bg-[#16162a] border border-purple-500/10">
              <h3 className="text-lg font-semibold text-white mb-6">Personal Information</h3>
              <ProfileForm profile={profile} onSave={updateProfile} />
            </div>

            <div className="p-6 rounded-xl bg-[#16162a] border border-purple-500/10">
              <h3 className="text-lg font-semibold text-white mb-6">Security</h3>
              <PasswordSection />
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}
