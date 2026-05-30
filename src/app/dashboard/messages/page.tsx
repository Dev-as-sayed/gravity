"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  useGetConversationsQuery,
  useGetConversationQuery,
  useSendMessageMutation,
} from "@/store/api/messageApi";

const MessagesPage = () => {
  const { data: session } = useSession();
  const [selectedConvOtherUserId, setSelectedConvOtherUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: convData, isLoading: convLoading } = useGetConversationsQuery({ page: 1, limit: 20 });
  const { data: msgData, isLoading: msgLoading } = useGetConversationQuery(
    { userId: session?.user?.id || "", otherUserId: selectedConvOtherUserId! },
    { skip: !selectedConvOtherUserId || !session?.user?.id },
  );
  const [sendMessage, { isLoading: sending }] = useSendMessageMutation();

  const conversations = convData?.data ?? [];
  const messages = msgData ?? [];
  const selectedConversation = conversations.find(
    (c) => c.otherUser.id === selectedConvOtherUserId
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConvOtherUserId || !newMessage.trim()) return;
    try {
      await sendMessage({ receiverId: selectedConvOtherUserId, content: newMessage }).unwrap();
      setNewMessage("");
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch { /* empty */ }
  };

  if (convLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex gap-0 h-[calc(100vh-8rem)]">
      <div className="w-80 flex-shrink-0 bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-700/50">
          <h2 className="text-white font-semibold">Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">No conversations yet.</div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConvOtherUserId(conv.otherUser.id)}
                className={`w-full text-left p-4 border-b border-gray-700/30 hover:bg-gray-700/30 transition ${
                  selectedConvOtherUserId === conv.otherUser.id ? "bg-gray-700/40" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium text-sm truncate">
                    {conv.otherUser.name}
                  </span>
                  {conv.unreadCount > 0 && selectedConvOtherUserId !== conv.otherUser.id && (
                    <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-xs">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                {conv.lastMessage && (
                  <p className="text-gray-400 text-xs mt-1 truncate">{conv.lastMessage.content}</p>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 ml-4 bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden flex flex-col">
        {!selectedConvOtherUserId ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a conversation to start messaging
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-700/50">
              <h3 className="text-white font-semibold">{selectedConversation?.otherUser.name}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-400 text-sm">No messages yet.</div>
              ) : (
                messages.map((msg: any) => {
                  const isMine = msg.senderId === session?.user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-xl text-sm ${
                          isMine
                            ? "bg-blue-600 text-white rounded-br-sm"
                            : "bg-gray-700 text-gray-200 rounded-bl-sm"
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMine ? "text-blue-200" : "text-gray-400"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="p-4 border-t border-gray-700/50 flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
