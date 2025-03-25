import React, { useState } from "react";
import { FaSave, FaTrash, FaLock, FaLockOpen, FaUsers, FaUserShield } from "react-icons/fa";
import { toast } from "react-toastify";

interface CommunitySettingsProps {
  communityId: number;
  communityData: {
    name: string;
    type: string;
    description: string;
  };
}

const CommunitySettings: React.FC<CommunitySettingsProps> = ({ communityId, communityData }) => {
  const [settings, setSettings] = useState({
    name: communityData.name,
    description: communityData.description,
    privacy: 'public',
    joinApproval: true,
    allowPosts: true,
    allowComments: true,
    notifyOnNewMembers: true,
    notifyOnDonations: true
  });

  const handleSaveSettings = () => {
    // In a real app, send these settings to your backend
    toast.success("Community settings saved successfully!");
  };

  const handleDeleteCommunity = () => {
    if (window.confirm("Are you sure you want to delete this community? This action cannot be undone.")) {
      // In a real app, send delete request to your backend
      toast.success("Community deleted successfully!");
      // Navigate back to communities list
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-[var(--headline)] mb-4">Community Settings</h3>
        <p className="text-[var(--paragraph)] mb-6">
          Manage your community settings and preferences.
        </p>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-[var(--headline)]">Basic Information</h4>
        <div>
          <label className="block text-sm font-medium text-[var(--paragraph)] mb-1">
            Community Name
          </label>
          <input
            type="text"
            value={settings.name}
            onChange={(e) => setSettings({...settings, name: e.target.value})}
            className="w-full px-3 py-2 border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--paragraph)] mb-1">
            Description
          </label>
          <textarea
            value={settings.description}
            onChange={(e) => setSettings({...settings, description: e.target.value})}
            className="w-full px-3 py-2 border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] min-h-[100px]"
          />
        </div>
      </div>

      {/* Privacy & Access */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-[var(--headline)]">Privacy & Access</h4>
        <div>
          <label className="block text-sm font-medium text-[var(--paragraph)] mb-1">
            Community Privacy
          </label>
          <select
            value={settings.privacy}
            onChange={(e) => setSettings({...settings, privacy: e.target.value})}
            className="w-full px-3 py-2 border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] bg-[var(--main)]"
          >
            <option value="public">Public - Anyone can see and join</option>
            <option value="restricted">Restricted - Anyone can see, approval required to join</option>
            <option value="private">Private - Only visible to members</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="joinApproval"
            checked={settings.joinApproval}
            onChange={(e) => setSettings({...settings, joinApproval: e.target.checked})}
            className="mr-2 h-4 w-4 text-[var(--highlight)] focus:ring-[var(--highlight)] rounded"
          />
          <label htmlFor="joinApproval" className="text-[var(--paragraph)]">
            Require approval for new members
          </label>
        </div>
      </div>

      {/* Content Settings */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-[var(--headline)]">Content Settings</h4>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="allowPosts"
            checked={settings.allowPosts}
            onChange={(e) => setSettings({...settings, allowPosts: e.target.checked})}
            className="mr-2 h-4 w-4 text-[var(--highlight)] focus:ring-[var(--highlight)] rounded"
          />
          <label htmlFor="allowPosts" className="text-[var(--paragraph)]">
            Allow members to create posts
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="allowComments"
            checked={settings.allowComments}
            onChange={(e) => setSettings({...settings, allowComments: e.target.checked})}
            className="mr-2 h-4 w-4 text-[var(--highlight)] focus:ring-[var(--highlight)] rounded"
          />
          <label htmlFor="allowComments" className="text-[var(--paragraph)]">
            Allow comments on posts
          </label>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-[var(--headline)]">Notification Settings</h4>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="notifyNewMembers"
            checked={settings.notifyOnNewMembers}
            onChange={(e) => setSettings({...settings, notifyOnNewMembers: e.target.checked})}
            className="mr-2 h-4 w-4 text-[var(--highlight)] focus:ring-[var(--highlight)] rounded"
          />
          <label htmlFor="notifyNewMembers" className="text-[var(--paragraph)]">
            Notify when new members join
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="notifyDonations"
            checked={settings.notifyOnDonations}
            onChange={(e) => setSettings({...settings, notifyOnDonations: e.target.checked})}
            className="mr-2 h-4 w-4 text-[var(--highlight)] focus:ring-[var(--highlight)] rounded"
          />
          <label htmlFor="notifyDonations" className="text-[var(--paragraph)]">
            Notify on new donations
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t border-[var(--stroke)]">
        <button
          onClick={handleDeleteCommunity}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <FaTrash /> Delete Community
        </button>
        <button
          onClick={handleSaveSettings}
          className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
        >
          <FaSave /> Save Settings
        </button>
      </div>
    </div>
  );
};

export default CommunitySettings; 