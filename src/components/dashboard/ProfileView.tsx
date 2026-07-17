import React from 'react';
import { User, Building2, Mail, Phone, Hash } from 'lucide-react';

interface Props {
  userType: 'EMPLOYER' | 'WORKER';
  profileData: any;
}

export default function ProfileView({ userType, profileData }: Props) {
  if (!profileData) return <div className="p-6 font-bold">Loading profile...</div>;

  return (
    <div className="bg-white border-4 border-[var(--color-charcoal)] hard-shadow p-8 relative">
      <div className="absolute -top-4 -left-4 bg-[var(--color-charcoal)] text-white font-bold px-4 py-1 border-2 border-[var(--color-charcoal)] uppercase tracking-widest text-sm">
        {userType === 'EMPLOYER' ? 'Enterprise Profile' : 'Worker Profile'}
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Basic Info */}
        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Name</p>
            <div className="flex items-center gap-3 bg-gray-50 border-2 border-[var(--color-charcoal)] p-3">
              <User className="text-gray-400" size={20} />
              <span className="font-bold text-lg">{userType === 'EMPLOYER' ? profileData.company_name : profileData.name}</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Contact Phone</p>
            <div className="flex items-center gap-3 bg-gray-50 border-2 border-[var(--color-charcoal)] p-3">
              <Phone className="text-gray-400" size={20} />
              <span className="font-bold text-lg font-mono">{profileData.phone}</span>
            </div>
          </div>
          
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Email Address</p>
            <div className="flex items-center gap-3 bg-gray-50 border-2 border-[var(--color-charcoal)] p-3">
              <Mail className="text-gray-400" size={20} />
              <span className="font-bold text-lg">{profileData.email || 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Account Specific Info */}
        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Account Type</p>
            <div className="flex items-center gap-3 bg-gray-50 border-2 border-[var(--color-charcoal)] p-3">
              <Building2 className="text-[var(--color-saffron)]" size={20} />
              <span className="font-[var(--font-anton)] text-xl uppercase tracking-wider">{profileData.account_type || userType}</span>
            </div>
          </div>
          
          {userType === 'EMPLOYER' && profileData.pan_number && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">PAN Number</p>
              <div className="flex items-center gap-3 bg-gray-50 border-2 border-[var(--color-charcoal)] p-3">
                <Hash className="text-gray-400" size={20} />
                <span className="font-bold text-lg font-mono uppercase">{profileData.pan_number}</span>
              </div>
            </div>
          )}

          {userType === 'EMPLOYER' && profileData.cin_number && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">CIN Number</p>
              <div className="flex items-center gap-3 bg-gray-50 border-2 border-[var(--color-charcoal)] p-3">
                <Hash className="text-gray-400" size={20} />
                <span className="font-bold text-lg font-mono uppercase">{profileData.cin_number}</span>
              </div>
            </div>
          )}

          {userType === 'EMPLOYER' && profileData.gstin && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">GSTIN</p>
              <div className="flex items-center gap-3 bg-gray-50 border-2 border-[var(--color-charcoal)] p-3">
                <Hash className="text-gray-400" size={20} />
                <span className="font-bold text-lg font-mono uppercase">{profileData.gstin}</span>
              </div>
            </div>
          )}

          {userType === 'EMPLOYER' && profileData.udyam_number && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Udyam Registration</p>
              <div className="flex items-center gap-3 bg-gray-50 border-2 border-[var(--color-charcoal)] p-3">
                <Hash className="text-gray-400" size={20} />
                <span className="font-bold text-lg font-mono uppercase">{profileData.udyam_number}</span>
              </div>
            </div>
          )}
          
          {userType === 'EMPLOYER' && (profileData.account_type === 'REGISTERED_BUSINESS' || profileData.account_type === 'REGISTERED_INDUSTRY') && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Director Name</p>
              <div className="flex items-center gap-3 bg-gray-50 border-2 border-[var(--color-charcoal)] p-3">
                <User className="text-gray-400" size={20} />
                <span className="font-bold text-lg">
                  {profileData.director_data && profileData.director_data.length > 0 ? profileData.director_data[0].name : 'Not available'}
                </span>
              </div>
            </div>
          )}

          {userType === 'EMPLOYER' && profileData.account_type === 'UNREGISTERED_BUSINESS' && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Proprietor Name</p>
              <div className="flex items-center gap-3 bg-gray-50 border-2 border-[var(--color-charcoal)] p-3">
                <User className="text-gray-400" size={20} />
                <span className="font-bold text-lg">
                  {profileData.proprietor_name || 'Not available'}
                </span>
              </div>
            </div>
          )}

          <div className="bg-[var(--color-paper)] p-4 border-2 border-[var(--color-charcoal)] mt-6">
             <p className="text-sm font-bold text-gray-600">
               Note: To maintain KYC integrity, your core profile details are locked. If you need to update legal information, please contact support.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}
