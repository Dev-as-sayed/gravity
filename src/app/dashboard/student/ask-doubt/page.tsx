"use client";

import { useUser } from "@/hooks/useUser";
import { useCreateDoubtMutation } from "@/store/api/doubtApi";
import { useState, FormEvent } from "react";

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();
  const [createDoubt, { isLoading: creating, isSuccess }] = useCreateDoubtMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await createDoubt({ title, description, subject: subject || undefined, topic: topic || undefined }).unwrap();
      setTitle("");
      setDescription("");
      setSubject("");
      setTopic("");
    } catch {}
  };

  if (isLoading) return null;
  if (!isAuthenticated) return <div>Please login</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Ask a Doubt</h1>

      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 max-w-2xl">
        {isSuccess && (
          <div className="mb-4 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm">Doubt submitted successfully!</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your doubt title"
              className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your doubt in detail"
              rows={4}
              className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Mathematics"
                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Algebra"
                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={creating || !title.trim()}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {creating ? "Submitting..." : "Submit Doubt"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;
