import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaComment, FaShare, FaUserCircle } from "react-icons/fa";

interface Post {
  id: number;
  communityId: number;
  communityType: string;
  communityName: string;
  content: string;
  image: string;
  timestamp: string;
  likes: number;
  comments: number;
  liked: boolean;
}

const UserPosts: React.FC = () => {
  const navigate = useNavigate();

  // Mock posts data - In real app, fetch from backend
  const posts: Post[] = [
    {
      id: 1,
      communityId: 1,
      communityType: 'campaign',
      communityName: 'Clean Water Initiative',
      content: "Just made my monthly contribution! Excited to see the progress we're making together.",
      image: "",
      timestamp: "2024-03-15T14:30:00",
      likes: 24,
      comments: 5,
      liked: true
    },
    {
      id: 2,
      communityId: 2,
      communityType: 'organization',
      communityName: 'Global Relief',
      content: "The impact report from last month's donations is incredible. Here's what we achieved together!",
      image: "https://placehold.co/600x400/png",
      timestamp: "2024-03-10T10:15:00",
      likes: 42,
      comments: 8,
      liked: false
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div key={post.id} className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--tertiary)] flex items-center justify-center text-white shrink-0">
              <FaUserCircle size={24} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <button
                    onClick={() => navigate(`/community/${post.communityType}/${post.communityId}`)}
                    className="text-sm font-medium text-[var(--highlight)] hover:underline"
                  >
                    {post.communityName}
                  </button>
                  <p className="text-sm text-[var(--paragraph)]">{formatDate(post.timestamp)}</p>
                </div>
              </div>
              <p className="text-[var(--paragraph)] mb-4">{post.content}</p>
              {post.image && (
                <div className="mb-4 rounded-xl overflow-hidden">
                  <img src={post.image} alt="" className="w-full h-auto" />
                </div>
              )}
              <div className="flex items-center gap-6 text-sm text-[var(--paragraph)]">
                <button className="flex items-center gap-2 hover:text-[var(--highlight)] transition-colors">
                  {post.liked ? <FaHeart className="text-[var(--highlight)]" /> : <FaHeart />}
                  {post.likes}
                </button>
                <button className="flex items-center gap-2 hover:text-[var(--highlight)] transition-colors">
                  <FaComment />
                  {post.comments}
                </button>
                <button className="flex items-center gap-2 hover:text-[var(--highlight)] transition-colors">
                  <FaShare />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserPosts; 