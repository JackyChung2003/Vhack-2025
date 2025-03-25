import React, { useState, useEffect } from "react";
import { FaSearch, FaUserPlus, FaUserMinus, FaEnvelope, FaCheck, FaTimes, FaSort, FaFilter } from "react-icons/fa";

interface Member {
  id: number;
  name: string;
  joinDate: string;
  contributions: number;
  posts: number;
  status: 'active' | 'pending' | 'inactive';
  lastActive: string;
}

interface MembersListProps {
  communityId: number;
  onMemberAction: (action: 'approve' | 'remove' | 'message', memberId: number) => void;
}

const MembersList: React.FC<MembersListProps> = ({ communityId, onMemberAction }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'joinDate' | 'contributions' | 'lastActive'>('joinDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Mock members data - In a real app, fetch from your backend
  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: "John Doe", joinDate: "2024-01-15", contributions: 500, posts: 12, status: 'active', lastActive: "2h ago" },
    { id: 2, name: "Jane Smith", joinDate: "2024-02-20", contributions: 750, posts: 8, status: 'active', lastActive: "1d ago" },
    { id: 3, name: "Robert Johnson", joinDate: "2024-03-05", contributions: 250, posts: 5, status: 'active', lastActive: "5h ago" },
    { id: 4, name: "Emily Davis", joinDate: "2024-03-10", contributions: 0, posts: 0, status: 'pending', lastActive: "N/A" },
    { id: 5, name: "Michael Wilson", joinDate: "2024-02-28", contributions: 100, posts: 3, status: 'inactive', lastActive: "2w ago" },
    { id: 6, name: "Sarah Brown", joinDate: "2024-01-30", contributions: 300, posts: 15, status: 'active', lastActive: "3h ago" },
    { id: 7, name: "David Miller", joinDate: "2024-03-12", contributions: 0, posts: 0, status: 'pending', lastActive: "N/A" },
  ]);

  // Filter and sort members
  const filteredMembers = members
    .filter(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
      (filterStatus === 'all' || member.status === filterStatus)
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'joinDate') {
        return sortOrder === 'asc' 
          ? new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime() 
          : new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
      } else if (sortBy === 'contributions') {
        return sortOrder === 'asc' 
          ? a.contributions - b.contributions 
          : b.contributions - a.contributions;
      } else {
        // lastActive - this is a simplification, in a real app you'd parse the time strings properly
        return sortOrder === 'asc' 
          ? a.lastActive.localeCompare(b.lastActive) 
          : b.lastActive.localeCompare(a.lastActive);
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search members..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--stroke)] focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--paragraph)]" />
        </div>
        
        {/* Filters */}
        <div className="flex gap-2">
          <select
            className="px-3 py-2 rounded-lg border border-[var(--stroke)] focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] bg-[var(--main)]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">All Members</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <select
            className="px-3 py-2 rounded-lg border border-[var(--stroke)] focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] bg-[var(--main)]"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy as any);
              setSortOrder(newSortOrder as any);
            }}
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="joinDate-desc">Newest First</option>
            <option value="joinDate-asc">Oldest First</option>
            <option value="contributions-desc">Highest Contributions</option>
            <option value="contributions-asc">Lowest Contributions</option>
            <option value="lastActive-desc">Recently Active</option>
            <option value="lastActive-asc">Least Recently Active</option>
          </select>
        </div>
      </div>
      
      {/* Members Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--background)] text-[var(--paragraph)]">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Join Date</th>
              <th className="px-4 py-3 text-left">Contributions</th>
              <th className="px-4 py-3 text-left">Posts</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Last Active</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--stroke)]">
            {filteredMembers.map(member => (
              <tr key={member.id} className="hover:bg-[var(--background)] transition-colors">
                <td className="px-4 py-3">{member.name}</td>
                <td className="px-4 py-3">{new Date(member.joinDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">${member.contributions}</td>
                <td className="px-4 py-3">{member.posts}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    member.status === 'active' ? 'bg-green-100 text-green-800' :
                    member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3">{member.lastActive}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {member.status === 'pending' && (
                      <button 
                        onClick={() => onMemberAction('approve', member.id)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Approve"
                      >
                        <FaCheck />
                      </button>
                    )}
                    <button 
                      onClick={() => onMemberAction('message', member.id)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Message"
                    >
                      <FaEnvelope />
                    </button>
                    <button 
                      onClick={() => onMemberAction('remove', member.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Remove"
                    >
                      <FaUserMinus />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredMembers.length === 0 && (
          <div className="text-center py-8 text-[var(--paragraph)]">
            No members found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default MembersList; 