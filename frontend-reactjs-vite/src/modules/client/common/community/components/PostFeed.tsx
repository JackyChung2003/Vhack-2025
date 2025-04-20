import React, { useState, useRef, useEffect } from "react";
import { FaHeart, FaRegHeart, FaComment, FaShare, FaUserCircle, FaPaperPlane, FaImage, FaTimes, FaEllipsisH } from "react-icons/fa";
import { toast } from "react-toastify";

interface PostFeedProps {
  communityId: string | number;
  communityType: string;
}

interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  authorRole?: string;
  authorAvatar?: string;
}

interface Post {
  id: number;
  author: string;
  authorRole: string;
  authorAvatar?: string;
  content: string;
  image: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  liked: boolean;
  campaignId: number;
  communityType: string;
}

const PostFeed: React.FC<PostFeedProps> = ({ communityId, communityType }) => {
  const [newPostText, setNewPostText] = useState("");
  const [newCommentText, setNewCommentText] = useState<{[key: number]: string}>({});
  const [showComments, setShowComments] = useState<{[key: number]: boolean}>({});
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState<{[key: number]: boolean}>({});
  const [showPostOptions, setShowPostOptions] = useState<{[key: number]: boolean}>({});
  
  // Initial mock posts data with campaign-specific content
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: "Jane Smith",
      authorRole: "Campaign Manager",
      authorAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
      content: "We're excited to announce that we've reached 50% of our funding goal for the Clean Water Initiative! Thank you to all our generous donors who have contributed so far. Your support is making a real difference in providing clean water to communities in need.",
      image: "https://images.unsplash.com/photo-1541911087797-f13abee6d08b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      timestamp: "2025-03-15T14:30:00",
      likes: 24,
      comments: [
        { id: 1, author: "Michael Brown", authorRole: "Donor", content: "This is fantastic news! Keep up the great work!", timestamp: "2025-03-15T15:10:00" },
        { id: 2, author: "Sarah Johnson", authorRole: "Volunteer", content: "So happy to be part of this initiative!", timestamp: "2025-03-15T16:45:00" }
      ],
      liked: false,
      campaignId: 1,
      communityType: "campaign"
    },
    {
      id: 2,
      author: "Robert Chen",
      authorRole: "Volunteer",
      authorAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
      content: "Just got back from installing water filters in the village. The gratitude on people's faces was incredible. Here are some photos from today's work. Each filter can provide clean water for a family for up to 2 years!",
      image: "https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      timestamp: "2025-03-14T10:15:00",
      likes: 42,
      comments: [
        { id: 1, author: "Lisa Wong", authorRole: "Donor", content: "Thank you for sharing these powerful images! It's amazing to see the direct impact.", timestamp: "2025-03-14T11:20:00" }
      ],
      liked: true,
      campaignId: 1,
      communityType: "campaign"
    },
    {
      id: 3,
      author: "Emily Davis",
      authorRole: "Donor",
      authorAvatar: "https://randomuser.me/api/portraits/women/65.jpg",
      content: "I'm proud to support this cause. My family has been personally affected by water-borne illnesses during our travels, and it means so much to see the community coming together to solve this critical issue.",
      image: "",
      timestamp: "2025-03-13T09:45:00",
      likes: 18,
      comments: [],
      liked: false,
      campaignId: 1,
      communityType: "campaign"
    },
    {
      id: 4,
      author: "David Wilson",
      authorRole: "Technical Advisor",
      authorAvatar: "https://randomuser.me/api/portraits/men/45.jpg",
      content: "We've completed the technical assessment for the next phase of the Clean Water Initiative. The new purification system will be able to process 5,000 gallons of water per day, serving approximately 1,200 people in the community.",
      image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      timestamp: "2025-03-12T16:20:00",
      likes: 31,
      comments: [
        { id: 1, author: "Maria Rodriguez", authorRole: "Community Leader", content: "This is exactly what our community needs. Thank you for your expertise!", timestamp: "2025-03-12T17:05:00" },
        { id: 2, author: "James Taylor", authorRole: "Donor", content: "Impressive technology! How long will the installation take?", timestamp: "2025-03-12T18:30:00" },
        { id: 3, author: "David Wilson", authorRole: "Technical Advisor", content: "We estimate about 3 weeks for the full installation and testing.", timestamp: "2025-03-12T19:15:00" }
      ],
      liked: false,
      campaignId: 1,
      communityType: "campaign"
    },
    {
      id: 5,
      author: "Global Relief",
      authorRole: "Organization",
      authorAvatar: "https://placehold.co/100x100/4A90E2/FFFFFF?text=GR",
      content: "We're hosting a virtual fundraiser for the Clean Water Initiative next Friday at 7 PM EST. Join us to learn more about the project, hear from community members, and find out how you can get involved beyond donations.",
      image: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      timestamp: "2025-03-11T11:00:00",
      likes: 56,
      comments: [
        { id: 1, author: "Thomas Lee", authorRole: "Donor", content: "I've registered! Looking forward to it.", timestamp: "2025-03-11T12:10:00" },
        { id: 2, author: "Anna Kim", authorRole: "Volunteer", content: "Will the event be recorded for those who can't attend live?", timestamp: "2025-03-11T13:25:00" },
        { id: 3, author: "Global Relief", authorRole: "Organization", content: "Yes, we'll share the recording afterward with all registered participants!", timestamp: "2025-03-11T14:00:00" }
      ],
      liked: false,
      campaignId: 1,
      communityType: "campaign"
    }
  ]);

  // Filter posts based on communityId and communityType
  const filteredPosts = posts.filter(post => {
    // Handle both string and number communityIds
    const postCommunityId = post.campaignId;
    const propsId = typeof communityId === 'string' ? parseInt(communityId) || post.campaignId : communityId;
    
    return postCommunityId === propsId && post.communityType === communityType;
  });

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostText.trim() === "" && !selectedFile) return;
    
    setIsSubmitting(true);
    
    // Simulate network delay
    setTimeout(() => {
      // Convert communityId to number for new posts
      const numericCommunityId = typeof communityId === 'string' ? parseInt(communityId) || 0 : communityId;
      
      const newPost = {
        id: posts.length + 1,
        author: "You",
        authorRole: "Donor",
        authorAvatar: "",
        content: newPostText,
        image: previewImage || "",
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: [],
        liked: false,
        campaignId: numericCommunityId,
        communityType: communityType
      };
      
      setPosts([newPost, ...posts]);
      setNewPostText("");
      setPreviewImage(null);
      setSelectedFile(null);
      setIsSubmitting(false);
      toast.success("Post published successfully!");
    }, 1000);
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

  const toggleShareOptions = (postId: number) => {
    setShowShareOptions({
      ...showShareOptions,
      [postId]: !showShareOptions[postId]
    });
  };

  const togglePostOptions = (postId: number) => {
    setShowPostOptions({
      ...showPostOptions,
      [postId]: !showPostOptions[postId]
    });
  };

  const handleCommentSubmit = (postId: number) => {
    if (!newCommentText[postId] || newCommentText[postId].trim() === "") return;
    
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newComment = {
          id: post.comments.length + 1,
          author: "You",
          authorRole: "Donor",
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

    toast.success("Comment added!");
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setSelectedFile(file);

    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sharePost = (postId: number, platform: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    // In a real app, this would use the Web Share API or platform-specific sharing
    toast.info(`Sharing post to ${platform}...`);
    toggleShareOptions(postId);
  };

  const deletePost = (postId: number) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      setPosts(posts.filter(post => post.id !== postId));
      toast.success("Post deleted successfully");
    }
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
      <div className="bg-[var(--main)] rounded-xl p-6 shadow-md border border-[var(--stroke)] mb-6">
        <form onSubmit={handlePostSubmit}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--tertiary)] flex items-center justify-center text-white shrink-0 shadow-sm">
              <FaUserCircle size={24} />
            </div>
            <div className="flex-1">
              <textarea
                placeholder="Share an update with the community..."
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                className="w-full p-3 bg-[var(--background)] border border-[var(--stroke)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] text-[var(--paragraph)] min-h-[100px]"
              />
              
              {previewImage && (
                <div className="mt-3 relative rounded-lg overflow-hidden border border-[var(--stroke)]">
                  <img src={previewImage} alt="Preview" className="max-h-[300px] w-auto mx-auto" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-[var(--main)] bg-opacity-70 rounded-full p-1.5 text-[var(--paragraph)] hover:text-red-500 transition-colors"
                    aria-label="Remove image"
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--paragraph)] hover:text-[var(--highlight)] transition-colors rounded-lg hover:bg-[var(--highlight)] hover:bg-opacity-5"
                    disabled={isUploading}
                    aria-label="Upload image"
                  >
                    <FaImage size={18} />
                    <span>{isUploading ? "Uploading..." : "Add Image"}</span>
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting || (newPostText.trim() === "" && !selectedFile)}
                  className={`px-4 py-2 bg-[var(--highlight)] text-white rounded-lg transition-all ${
                    isSubmitting || (newPostText.trim() === "" && !selectedFile) 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-opacity-90 hover:shadow-md transform hover:-translate-y-0.5'
                  }`}
                  aria-label="Post"
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      
      {/* Posts feed */}
      {filteredPosts.length > 0 ? (
        filteredPosts.map((post) => (
          <div 
            key={post.id} 
            className="bg-[var(--background)] rounded-xl p-6 shadow-md border border-[var(--stroke)] transition-all hover:shadow-lg mb-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--tertiary)] flex items-center justify-center text-white shrink-0 overflow-hidden shadow-sm border border-[var(--stroke)] border-opacity-30">
                {post.authorAvatar ? (
                  <img src={post.authorAvatar} alt={post.author} className="w-full h-full object-cover" />
                ) : (
                  <FaUserCircle size={28} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[var(--headline)]">{post.author}</h3>
                    <span className="text-sm text-white bg-[var(--tertiary)] bg-opacity-10 px-2 py-0.5 rounded-full">{post.authorRole}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[var(--paragraph)] italic">{formatTimestamp(post.timestamp)}</span>
                    {post.author === "You" && (
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePostOptions(post.id);
                          }}
                          className="p-1.5 text-[var(--paragraph)] hover:text-[var(--highlight)] transition-colors rounded-full hover:bg-[var(--highlight)] hover:bg-opacity-5"
                          aria-label="Post options"
                        >
                          <FaEllipsisH size={16} />
                        </button>
                        {showPostOptions[post.id] && (
                          <div className="absolute right-0 mt-1 w-40 bg-[var(--main)] border border-[var(--stroke)] rounded-lg shadow-lg z-10 overflow-hidden">
                            <button 
                              onClick={() => deletePost(post.id)}
                              className="w-full text-left px-4 py-2.5 text-red-500 hover:bg-[var(--background)] transition-colors flex items-center gap-2"
                            >
                              <FaTimes size={14} />
                              Delete post
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[var(--paragraph)] mt-3 leading-relaxed">{post.content}</p>
                {post.image && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-[var(--stroke)] bg-[var(--main)] shadow-sm">
                    <img 
                      src={post.image} 
                      alt="" 
                      className="w-full h-auto object-cover max-h-[500px]" 
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="mt-5 flex items-center gap-6 text-sm border-t border-[var(--stroke)] border-opacity-50 pt-4">
                  <button 
                    className="flex items-center gap-2 hover:text-[var(--highlight)] transition-all px-3 py-1.5 rounded-lg hover:bg-[var(--highlight)] hover:bg-opacity-5"
                    onClick={() => toggleLike(post.id)}
                    aria-label={post.liked ? "Unlike" : "Like"}
                  >
                    {post.liked ? 
                      <FaHeart className="text-[var(--highlight)]" size={18} /> : 
                      <FaRegHeart size={18} />
                    }
                    <span className={post.liked ? "font-medium text-[var(--highlight)]" : ""}>
                      {post.likes}
                    </span>
                  </button>
                  <button 
                    className="flex items-center gap-2 hover:text-[var(--highlight)] transition-all px-3 py-1.5 rounded-lg hover:bg-[var(--highlight)] hover:bg-opacity-5"
                    onClick={() => toggleComments(post.id)}
                    aria-label="Comments"
                  >
                    <FaComment size={18} />
                    <span>{post.comments.length}</span>
                  </button>
                  <div className="relative">
                    <button 
                      className="flex items-center gap-2 hover:text-[var(--highlight)] transition-all px-3 py-1.5 rounded-lg hover:bg-[var(--highlight)] hover:bg-opacity-5"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleShareOptions(post.id);
                      }}
                      aria-label="Share"
                    >
                      <FaShare size={18} />
                      <span>Share</span>
                    </button>
                    {showShareOptions[post.id] && (
                      <div className="absolute left-0 mt-1 w-48 bg-[var(--main)] border border-[var(--stroke)] rounded-lg shadow-lg z-10 overflow-hidden">
                        <button 
                          onClick={() => sharePost(post.id, 'Twitter')}
                          className="w-full text-left px-4 py-2.5 hover:bg-[var(--background)] transition-colors flex items-center gap-2"
                        >
                          <svg className="w-5 h-5 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                          </svg>
                          Twitter
                        </button>
                        <button 
                          onClick={() => sharePost(post.id, 'Facebook')}
                          className="w-full text-left px-4 py-2.5 hover:bg-[var(--background)] transition-colors flex items-center gap-2"
                        >
                          <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                          </svg>
                          Facebook
                        </button>
                        <button 
                          onClick={() => sharePost(post.id, 'Email')}
                          className="w-full text-left px-4 py-2.5 hover:bg-[var(--background)] transition-colors flex items-center gap-2"
                        >
                          <svg className="w-5 h-5 text-[var(--paragraph)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                          Email
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Comments section */}
            {(showComments[post.id] || post.comments.length < 3) && post.comments.length > 0 && (
              <div className="mt-5 space-y-3 ml-16 border-l-2 border-[var(--stroke)] border-opacity-30 pl-4">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="bg-[var(--main)] p-4 rounded-lg border border-[var(--stroke)] border-opacity-50 transition-all hover:shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-[var(--headline)]">{comment.author}</span>
                      {comment.authorRole && (
                        <span className="text-xs text-white bg-[var(--tertiary)] bg-opacity-10 px-2 py-0.5 rounded-full">{comment.authorRole}</span>
                      )}
                      <span className="text-xs text-[var(--paragraph)] ml-auto italic">{formatTimestamp(comment.timestamp)}</span>
                    </div>
                    <p className="text-sm text-[var(--paragraph)] leading-relaxed">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
            
            {post.comments.length > 2 && !showComments[post.id] && (
              <button 
                onClick={() => toggleComments(post.id)}
                className="ml-16 mt-3 text-sm text-[var(--highlight)] hover:underline flex items-center gap-1"
              >
                <FaComment size={14} />
                View all {post.comments.length} comments
              </button>
            )}
            
            {/* Add comment form */}
            <div className="flex items-center gap-2 mt-4 ml-16">
              <div className="w-8 h-8 rounded-full bg-[var(--tertiary)] flex items-center justify-center text-white shrink-0 shadow-sm">
                <FaUserCircle size={18} />
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  className="w-full p-2.5 bg-[var(--main)] border border-[var(--stroke)] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] text-[var(--paragraph)] pr-10"
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
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full ${
                    !newCommentText[post.id] || newCommentText[post.id].trim() === "" 
                      ? 'text-[var(--paragraph)] opacity-50 cursor-not-allowed' 
                      : 'text-[var(--highlight)] hover:bg-[var(--highlight)] hover:bg-opacity-10'
                  }`}
                  onClick={() => handleCommentSubmit(post.id)}
                  disabled={!newCommentText[post.id] || newCommentText[post.id].trim() === ""}
                  aria-label="Submit comment"
                >
                  <FaPaperPlane size={14} />
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-[var(--background)] rounded-xl p-8 text-center border border-[var(--stroke)] shadow-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--highlight)] bg-opacity-10 flex items-center justify-center">
            <FaComment className="text-[var(--highlight)] text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--headline)] mb-2">No posts yet</h3>
          <p className="text-[var(--paragraph)] mb-4">Be the first to share something with this community!</p>
          <button 
            onClick={() => document.querySelector('textarea')?.focus()}
            className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Create a post
          </button>
        </div>
      )}
    </div>
  );
};

export default PostFeed; 