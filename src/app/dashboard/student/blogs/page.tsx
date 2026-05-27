"use client";

import { useUser } from "@/hooks/useUser";
import { useGetBlogsQuery } from "@/store/api/blogApi";

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();

  const { data: blogsData, isLoading: bLoading } = useGetBlogsQuery({});

  if (isLoading) return null;
  if (!isAuthenticated) return <div>Please login</div>;

  const blogs = Array.isArray(blogsData) ? blogsData : (blogsData as any)?.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Blogs</h1>

      {bLoading ? (
        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      ) : blogs.length === 0 ? (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400">No blogs available.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog: any) => (
            <div key={blog.id} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
              {blog.featuredImage && (
                <img src={blog.featuredImage} alt={blog.title} className="w-full h-40 object-cover rounded-lg mb-3" />
              )}
              <h3 className="text-white font-medium">{blog.title}</h3>
              {blog.excerpt && <p className="text-gray-400 text-sm mt-1 line-clamp-2">{blog.excerpt}</p>}
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                {blog.readTime && <span>{blog.readTime} min read</span>}
                <span>{blog.views} views</span>
                <span>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}</span>
              </div>
              {blog.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {blog.tags.map((tag: string, i: number) => (
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
