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
      <h1 className="text-2xl font-bold text-white">Discussion Forum</h1>

      {pLoading ? (
        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      ) : posts.length === 0 ? (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400">No discussions yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post: any) => (
            <div key={post.id} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
              {post.title && <h3 className="text-white font-medium">{post.title}</h3>}
              {post.content && <p className="text-gray-400 text-sm mt-1 line-clamp-3">{post.content}</p>}
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                {post.teacher?.name && <span>By {post.teacher.name}</span>}
                {post._count?.reactions !== undefined && <span>{post._count.reactions} reactions</span>}
                {post._count?.comments !== undefined && <span>{post._count.comments} comments</span>}
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {post.tags.map((tag: string, i: number) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
