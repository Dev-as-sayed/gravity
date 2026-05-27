"use client";

import { useUser } from "@/hooks/useUser";
import { useGetPostsQuery } from "@/store/api/mediaApi";

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();

  const { data: postsData, isLoading: pLoading } = useGetPostsQuery({});

  if (isLoading) return null;
  if (!isAuthenticated) return <div>Please login</div>;

  const posts = Array.isArray(postsData) ? postsData : (postsData as any)?.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Media Library</h1>

      {pLoading ? (
        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      ) : posts.length === 0 ? (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400">No media available.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: any) => (
            <div key={post.id} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
              {post.media?.length > 0 && post.media[0]?.url && (
                <div className="mb-3">
                  {post.media[0].type?.startsWith("image/") ? (
                    <img src={post.media[0].url} alt={post.title || ""} className="w-full h-40 object-cover rounded-lg" />
                  ) : (
                    <div className="w-full h-40 bg-gray-700/50 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                      {post.media[0].type || "Media"}
                    </div>
                  )}
                </div>
              )}
              {post.title && <h3 className="text-white font-medium">{post.title}</h3>}
              {post.excerpt && <p className="text-gray-400 text-sm mt-1 line-clamp-2">{post.excerpt}</p>}
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                {post._count?.views !== undefined && <span>{post._count.views} views</span>}
                {post._count?.reactions !== undefined && <span>{post._count.reactions} reactions</span>}
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
