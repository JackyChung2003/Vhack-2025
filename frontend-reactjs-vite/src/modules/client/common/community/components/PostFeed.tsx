import React, { useState } from "react";
import { FaHeart, FaRegHeart, FaComment, FaShare, FaUserCircle, FaPaperPlane, FaImage } from "react-icons/fa";

interface PostFeedProps {
  communityId: number;
  communityType: string;
}

interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: string;
}

interface Post {
  id: number;
  author: string;
  authorRole: string;
  content: string;
  image: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  liked: boolean;
}

const PostFeed: React.FC<PostFeedProps> = ({ communityId, communityType }) => {
  const [newPostText, setNewPostText] = useState("");
  const [newCommentText, setNewCommentText] = useState<{[key: number]: string}>({});
  const [showComments, setShowComments] = useState<{[key: number]: boolean}>({});
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: "Jane Smith",
      authorRole: "Campaign Manager",
      content: "We're excited to announce that we've reached 50% of our funding goal! Thank you to all our generous donors who have contributed so far. Your support is making a real difference.",
      image: "",
      timestamp: "2025-03-15T14:30:00",
      likes: 24,
      comments: [
        { id: 1, author: "Michael Brown", content: "This is fantastic news! Keep up the great work!", timestamp: "2025-03-15T15:10:00" },
        { id: 2, author: "Sarah Johnson", content: "So happy to be part of this initiative!", timestamp: "2025-03-15T16:45:00" }
      ],
      liked: false
    },
    {
      id: 2,
      author: "Robert Chen",
      authorRole: "Volunteer",
      content: "Just got back from distributing supplies in the affected area. The gratitude on people's faces was incredible. Here are some photos from today's work.",
      image: "https://placehold.co/600x400/png",
      timestamp: "2025-03-14T10:15:00",
      likes: 42,
      comments: [
        { id: 1, author: "Lisa Wong", content: "Thank you for sharing these powerful images!", timestamp: "2025-03-14T11:20:00" }
      ],
      liked: true
    },
    {
      id: 3,
      author: "Emily Davis",
      authorRole: "Donor",
      content: "I'm proud to support this cause. My family has been personally affected by this issue, and it means so much to see the community coming together.",
      image: "",
      timestamp: "2025-03-13T09:45:00",
      likes: 18,
      comments: [],
      liked: false
    }
  ]);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostText.trim() === "") return;
    
    const newPost = {
      id: posts.length + 1,
      author: "You",
      authorRole: "Donor",
      content: newPostText,
      image: "",
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: [],
      liked: false
    };
    
    setPosts([newPost, ...posts]);
    setNewPostText("");
  };

  const toggleLike = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const toggleComments = (postId: number) => {
    setShowComments({
      ...showComments,
      [postId]: !showComments[postId]
    });
  };

  const handleCommentSubmit = (postId: number) => {
    if (!newCommentText[postId] || newCommentText[postId].trim() === "") return;
    
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newComment = {
          id: post.comments.length + 1,
          author: "You",
          content: newCommentText[postId],
          timestamp: new Date().toISOString()
        };
        
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));
    
    setNewCommentText({
      ...newCommentText,
      [postId]: ""
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Create post form */}
      <div className="bg-[var(--background)] rounded-xl p-4">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-[var(--tertiary)] flex items-center justify-center text-white">
            <FaUserCircle size={24} />
          </div>
          <div className="flex-1">
            <textarea
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder="Share your thoughts with the community..."
              className="w-full p-3 rounded-xl bg-[var(--main)] border border-[var(--stroke)] focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] text-[var(--paragraph)] resize-none"
              rows={3}
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={handlePostSubmit}
                className="px-4 py-2 bg-[var(--highlight)] text-[var(--button-text)] rounded-full font-medium hover:bg-opacity-90 transition-colors"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Posts feed */}
      {posts.map((post) => (
        <div key={post.id} className="bg-[var(--background)] rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--tertiary)] flex items-center justify-center text-white shrink-0">
              <FaUserCircle size={24} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[var(--headline)]">{post.author}</h3>
                <span className="text-sm text-[var(--paragraph)]">• {post.authorRole}</span>
              </div>
              <p className="text-[var(--paragraph)] mt-2">{post.content}</p>
              {post.image && (
                <div className="mt-4 rounded-xl overflow-hidden">
                  <img src={post.image} alt="" className="w-full h-auto" />
                </div>
              )}
              <div className="mt-4 flex items-center gap-6 text-sm text-[var(--paragraph)]">
                <button className="flex items-center gap-2 hover:text-[var(--highlight)] transition-colors">
                  {post.liked ? <FaHeart className="text-[var(--highlight)]" /> : <FaRegHeart />}
                  {post.likes}
                </button>
                <button className="flex items-center gap-2 hover:text-[var(--highlight)] transition-colors">
                  <FaComment />
                  {post.comments.length}
                </button>
                <button className="flex items-center gap-2 hover:text-[var(--highlight)] transition-colors">
                  <FaShare />
                  Share
                </button>
              </div>
            </div>
          </div>
          
          {/* Comments section */}
          {(showComments[post.id] || post.comments.length < 3) && post.comments.length > 0 && (
            <div className="pl-10 space-y-3 mt-4">
              {post.comments.map((comment) => (
                <div key={comment.id} className="bg-[var(--background)] p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{comment.author}</span>
                    <span className="text-xs text-gray-500">{formatTimestamp(comment.timestamp)}</span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
          
          {/* Add comment form */}
          <div className="flex items-center gap-2 pl-10 mt-4">
            <FaUserCircle className="text-2xl text-gray-400" />
            <input
              type="text"
              className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
              placeholder="Write a comment..."
              value={newCommentText[post.id] || ""}
              onChange={(e) => setNewCommentText({...newCommentText, [post.id]: e.target.value})}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCommentSubmit(post.id);
                }
              }}
            />
            <button
              className="p-2 text-[var(--tertiary)]"
              onClick={() => handleCommentSubmit(post.id)}
              disabled={!newCommentText[post.id] || newCommentText[post.id].trim() === ""}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostFeed; 