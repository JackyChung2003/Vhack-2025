import React, { useState } from "react";
import { FaBullhorn, FaTrash, FaEdit, FaPlus } from "react-icons/fa";

interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  type: 'campaign' | 'organization';
  status: 'draft' | 'published';
}

const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 1,
      title: "Milestone Reached: Clean Water Initiative",
      content: "We're excited to announce that we've reached 50% of our funding goal!",
      date: "2024-03-15",
      type: 'campaign',
      status: 'published'
    },
    {
      id: 2,
      title: "New Campaign Launch",
      content: "Stay tuned for our upcoming education campaign!",
      date: "2024-03-14",
      type: 'organization',
      status: 'draft'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "organization" as 'campaign' | 'organization'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAnnouncement: Announcement = {
      id: Date.now(),
      ...formData,
      date: new Date().toISOString().split('T')[0],
      status: 'draft'
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setShowForm(false);
    setFormData({ title: "", content: "", type: "organization" });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      setAnnouncements(announcements.filter(a => a.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden">
        <div className="p-6 border-b border-[var(--stroke)] flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-[var(--headline)]">Announcements</h2>
            <p className="text-[var(--paragraph)] text-sm mt-1">
              Create and manage announcements for your campaigns and organization
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-colors"
          >
            <FaPlus /> New Announcement
          </button>
        </div>

        {showForm && (
          <div className="p-6 border-b border-[var(--stroke)] bg-[var(--background)]">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--headline)] mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 border border-[var(--stroke)] rounded-lg bg-[var(--main)]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--headline)] mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full p-3 border border-[var(--stroke)] rounded-lg bg-[var(--main)]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--headline)] mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as 'campaign' | 'organization' })}
                  className="w-full p-3 border border-[var(--stroke)] rounded-lg bg-[var(--main)]"
                >
                  <option value="organization">Organization</option>
                  <option value="campaign">Campaign</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-[var(--stroke)] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg"
                >
                  Create Announcement
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="divide-y divide-[var(--stroke)]">
          {announcements.map(announcement => (
            <div key={announcement.id} className="p-6 hover:bg-[var(--background)] transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-[var(--headline)]">{announcement.title}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="p-2 text-[var(--paragraph)] hover:text-red-500 transition-colors"
                  >
                    <FaTrash />
                  </button>
                  <button
                    className="p-2 text-[var(--paragraph)] hover:text-[var(--highlight)] transition-colors"
                  >
                    <FaEdit />
                  </button>
                </div>
              </div>
              <p className="text-[var(--paragraph)] mb-3">{announcement.content}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-[var(--paragraph)]">{announcement.date}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  announcement.type === 'campaign' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {announcement.type}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  announcement.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {announcement.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Announcements; 