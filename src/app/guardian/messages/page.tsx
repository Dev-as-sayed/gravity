"use client";

import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";

interface Message {
  id: string;
  subject: string;
  content: string;
  sender: string;
  senderName?: string;
  createdAt: string;
  read: boolean;
}

const MessagesPage = () => {
  const { data: session } = useSession();
  const { user, isLoading: userLoading } = useUser();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/messages?recipientId=${user?.id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setMessages(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (userLoading || loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <p className="text-gray-400 text-center">Please login to view messages.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Messages</h1>

      {messages.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-center">No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-gray-800/50 rounded-xl p-6 border ${
                msg.read
                  ? "border-gray-700/50"
                  : "border-blue-500/30"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {!msg.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                  )}
                  <h3 className="text-white font-semibold">{msg.subject}</h3>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(msg.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-2">
                From: {msg.senderName || msg.sender}
              </p>
              <p className="text-gray-300 text-sm">{msg.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
