import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import {
  Brain,
  MessageSquare,
  Trash2,
  Edit2,
  Plus,
  Search,
  LogOut,
  User,
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Square,
  Mic,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const AIChat = () => {
  const { token, user, logout } = useAppContext();
  const navigate = useNavigate();

  // State Management
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [renamingId, setRenamingId] = useState(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [likedMessages, setLikedMessages] = useState({});
  const [dislikedMessages, setDislikedMessages] = useState({});
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Ref & abort controllers
  const recognitionRef = useRef(null);
  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom of the conversation area
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, isLoading]);

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      toast.info("Please log in to access Medicore AI Assistant.");
      navigate("/login");
    }
  }, [token, navigate]);

  // Load chat history on mount
  useEffect(() => {
    if (token) {
      fetchHistory();
    }
  }, [token]);

  useEffect(() => {
    if (activeChatId && token) {
      fetchChatDetails(activeChatId);
    } else {
      setActiveChat(null);
    }
  }, [activeChatId, token]);

  if (!token) {
    return (
      <div className="min-h-screen bg-(--bg-page) flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          <p className="text-sm font-semibold text-(--text-muted)">
            Redirecting to Login...
          </p>
        </div>
      </div>
    );
  }

  // Fetch all chats
  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/chat/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations);
        // Automatically select the most recent chat if none is active
        if (data.conversations.length > 0 && !activeChatId) {
          setActiveChatId(data.conversations[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching chat history", error);
      toast.error("Failed to load chat history.");
    }
  };

  // Fetch details of a single chat
  const fetchChatDetails = async (chatId) => {
    try {
      const res = await fetch(`/api/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setActiveChat(data.conversation);
      }
    } catch (error) {
      console.error("Error fetching chat details", error);
      toast.error("Failed to load conversation details.");
    }
  };

  // Start a new chat session
  const handleNewChat = async () => {
    try {
      const res = await fetch("/api/chat/new", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setConversations((prev) => [data.conversation, ...prev]);
        setActiveChatId(data.conversation._id);
        toast.success("New chat initialized.");
      }
    } catch (error) {
      console.error("Error starting new chat", error);
      toast.error("Failed to initialize new chat.");
    }
  };

  // Voice Typing Speech Recognition
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.warning(
        "Speech recognition is not supported in your browser. Please try Google Chrome or Microsoft Edge.",
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
        toast.info("Listening... Speak now.", { autoClose: 1500 });
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          toast.error(
            "Microphone access blocked. Please check browser permissions.",
          );
        } else {
          toast.error(`Speech recognition failed: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage((prev) => prev + (prev ? " " : "") + transcript);
          toast.success("Voice input added!");
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech initialization error:", err);
      toast.error("Failed to initialize microphone.");
      setIsListening(false);
    }
  };

  // Send message with streaming (ChatGPT-like word-by-word response)
  const handleSendMessage = async (e, textToSend = null) => {
    if (e) e.preventDefault();
    const finalMessage = textToSend || inputMessage;
    if (!finalMessage.trim() || isLoading) return;

    if (!activeChatId) {
      toast.error("No active chat session. Click New Chat.");
      return;
    }

    setInputMessage("");
    setIsLoading(true);

    // Optimistically add user message
    const tempUserMessage = {
      _id: "user-" + Date.now().toString(),
      role: "user",
      content: finalMessage,
      timestamp: new Date().toISOString(),
    };

    // Streaming placeholder message for AI
    const streamingMsgId = "streaming-" + Date.now();
    const streamingPlaceholder = {
      _id: streamingMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };

    setActiveChat((prev) => {
      if (!prev) return { messages: [tempUserMessage, streamingPlaceholder] };
      return {
        ...prev,
        messages: [...prev.messages, tempUserMessage, streamingPlaceholder],
      };
    });

    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: activeChatId,
          message: finalMessage,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        throw new Error("Stream request failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep incomplete line

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr) continue;

          try {
            const parsed = JSON.parse(jsonStr);

            if (parsed.error) {
              toast.error(parsed.error || "AI response failed.");
              setActiveChat((prev) => ({
                ...prev,
                messages: prev.messages.map((m) =>
                  m._id === streamingMsgId
                    ? { ...m, content: "⚠ Error: " + (parsed.error || "AI response failed."), isStreaming: false }
                    : m,
                ),
              }));
              break;
            }

            if (parsed.chunk) {
              // Append chunk to streaming message
              setActiveChat((prev) => ({
                ...prev,
                messages: prev.messages.map((m) =>
                  m._id === streamingMsgId
                    ? { ...m, content: m.content + parsed.chunk }
                    : m,
                ),
              }));
            }

            if (parsed.done) {
              // Mark streaming as complete and refresh history for title update
              setActiveChat((prev) => ({
                ...prev,
                messages: prev.messages.map((m) =>
                  m._id === streamingMsgId ? { ...m, isStreaming: false } : m,
                ),
              }));
              fetchHistory();
            }
          } catch {
            // skip malformed JSON chunks
          }
        }
      }
    } catch (error) {
      if (error.name === "AbortError") {
        // On stop: finalize whatever was streamed so far
        setActiveChat((prev) => ({
          ...prev,
          messages: prev.messages.map((m) =>
            m._id === streamingMsgId ? { ...m, isStreaming: false } : m,
          ),
        }));
        toast.info("AI response generation stopped.");
      } else {
        console.error("Error sending message", error);
        toast.error("Network or server failure.");
        setActiveChat((prev) => ({
          ...prev,
          messages: prev.messages.map((m) =>
            m._id === streamingMsgId
              ? { ...m, content: "⚠ Network or server failure. Please try again.", isStreaming: false }
              : m,
          ),
        }));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Stop response generation
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Regenerate last AI response
  const handleRegenerateResponse = () => {
    if (!activeChat || activeChat.messages.length < 2 || isLoading) return;

    // Find last user message
    const userMsgs = activeChat.messages.filter((m) => m.role === "user");
    if (userMsgs.length === 0) return;

    const lastUserMsg = userMsgs[userMsgs.length - 1];

    // Remove last assistant message locally to simulate regeneration
    setActiveChat((prev) => {
      const msgs = [...prev.messages];
      if (msgs[msgs.length - 1].role === "assistant") {
        msgs.pop();
      }
      return { ...prev, messages: msgs };
    });

    handleSendMessage(null, lastUserMsg.content);
  };

  // Rename conversation session
  const handleRenameChat = async (chatId) => {
    if (!renameTitle.trim()) return;
    try {
      const res = await fetch("/api/chat/rename", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: chatId,
          title: renameTitle.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConversations((prev) =>
          prev.map((c) =>
            c._id === chatId ? { ...c, title: data.conversation.title } : c,
          ),
        );
        if (activeChatId === chatId) {
          setActiveChat((prev) => ({
            ...prev,
            title: data.conversation.title,
          }));
        }
        setRenamingId(null);
        setRenameTitle("");
        toast.success("Chat renamed successfully.");
      }
    } catch (error) {
      console.error("Error renaming chat", error);
      toast.error("Failed to rename chat.");
    }
  };

  // Delete conversation session
  const handleDeleteChat = async (chatId) => {
    try {
      const res = await fetch(`/api/chat/${chatId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setConversations((prev) => prev.filter((c) => c._id !== chatId));
        if (activeChatId === chatId) {
          setActiveChatId(null);
          setActiveChat(null);
        }
        setDeletingId(null);
        toast.success("Chat deleted permanently.");
      }
    } catch (error) {
      console.error("Error deleting chat", error);
      toast.error("Failed to delete chat.");
    }
  };

  // Utility to format timestamp for message bubbles
  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Utility to format dates for the sidebar history
  const formatDateLabel = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "2-digit",
    });
  };

  // Filters chat history based on search query
  const filteredConversations = conversations.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Copy response content
  const handleCopyMessage = (text, messageId) => {
    navigator.clipboard.writeText(text);
    setCopiedId(messageId);
    toast.success("Message copied!", { autoClose: 1500 });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Feedback Likes/Dislikes
  const handleLikeMessage = (messageId) => {
    setLikedMessages((prev) => ({ ...prev, [messageId]: !prev[messageId] }));
    setDislikedMessages((prev) => ({ ...prev, [messageId]: false }));
  };

  const handleDislikeMessage = (messageId) => {
    setDislikedMessages((prev) => ({ ...prev, [messageId]: !prev[messageId] }));
    setLikedMessages((prev) => ({ ...prev, [messageId]: false }));
  };

  // Suggested prompt actions
  const suggestionPrompts = [
    {
      title: "Symptom Assessment",
      text: "I have a headache, high fever, and a sore throat.",
      desc: "Triages potential conditions",
    },
    {
      title: "Medicore Appointment",
      text: "How do I book an appointment with a specialist?",
      desc: "Guides platform booking",
    },
    {
      title: "Report Summarizer",
      text: "Explain my lab report showing Hemoglobin 10.2 g/dL.",
      desc: "Translates lab terms simply",
    },
    {
      title: "Medication Details",
      text: "What are the common side effects of Ibuprofen?",
      desc: "Provides drug safety details",
    },
  ];

  // Inline custom Markdown Renderer for React
  const renderInlineText = (text) => {
    const boldParts = text.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith("**") && bPart.endsWith("**")) {
        return (
          <strong key={bIdx} className="font-extrabold text-(--text-main)">
            {bPart.slice(2, -2)}
          </strong>
        );
      }
      return bPart;
    });
  };

  const renderContentMarkdown = (text) => {
    if (!text) return null;
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const language = match ? match[1] : "";
        const code = match ? match[2] : part.slice(3, -3);

        return (
          <div
            key={index}
            className="my-3.5 rounded-xl overflow-hidden border border-(--border-color) bg-slate-900 text-slate-100 text-xs font-mono"
          >
            <div className="flex justify-between items-center px-4 py-2 bg-slate-800 text-[10px] text-(--text-muted) font-bold uppercase tracking-wider select-none">
              <span>{language || "code"}</span>
              <button
                onClick={() => handleCopyMessage(code, index)}
                className="hover:text-white transition-colors cursor-pointer text-xs font-semibold"
              >
                Copy
              </button>
            </div>
            <pre className="p-4 overflow-x-auto select-text leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      const lines = part.split("\n");
      return (
        <div key={index} className="space-y-2 select-text">
          {lines.map((line, lineIdx) => {
            const cleanLine = line.trim();
            if (!cleanLine) return <div key={lineIdx} className="h-2" />;

            if (cleanLine.startsWith("### ")) {
              return (
                <h4
                  key={lineIdx}
                  className="text-sm font-bold text-primary-600 mt-4 mb-2 select-text"
                >
                  {cleanLine.substring(4)}
                </h4>
              );
            }
            if (cleanLine.startsWith("## ")) {
              return (
                <h3
                  key={lineIdx}
                  className="text-base font-extrabold text-primary-700 mt-5 mb-2.5 select-text"
                >
                  {cleanLine.substring(3)}
                </h3>
              );
            }
            if (cleanLine.startsWith("# ")) {
              return (
                <h2
                  key={lineIdx}
                  className="text-lg font-black text-primary-800 mt-6 mb-3 select-text"
                >
                  {cleanLine.substring(2)}
                </h2>
              );
            }

            if (cleanLine.startsWith("- ") || cleanLine.startsWith("* ")) {
              return (
                <li
                  key={lineIdx}
                  className="ml-4 list-disc text-sm text-slate-700 leading-relaxed pl-1.5 select-text"
                >
                  {renderInlineText(cleanLine.substring(2))}
                </li>
              );
            }

            const numMatch = cleanLine.match(/^(\d+)\.\s(.*)/);
            if (numMatch) {
              return (
                <li
                  key={lineIdx}
                  className="ml-4 list-decimal text-sm text-slate-700 leading-relaxed pl-1.5 select-text"
                >
                  {renderInlineText(numMatch[2])}
                </li>
              );
            }

            if (
              cleanLine.toLowerCase().includes("disclaimer:") ||
              cleanLine.toLowerCase().includes("*disclaimer:")
            ) {
              const displayVal = cleanLine.replace(/\*/g, "");
              return (
                <div
                  key={lineIdx}
                  className="my-4 p-3.5 bg-amber-50/70 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-start gap-2.5 shadow-2xs font-medium select-text"
                >
                  <span className="shrink-0 text-amber-500 font-bold select-none">
                    ⚠
                  </span>
                  <p className="leading-relaxed">{displayVal}</p>
                </div>
              );
            }

            if (
              cleanLine.toLowerCase().includes("emergency:") ||
              cleanLine.toLowerCase().includes("emergency warning")
            ) {
              return (
                <div
                  key={lineIdx}
                  className="my-4 p-3.5 bg-red-50/70 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2.5 shadow-2xs font-bold select-text"
                >
                  <span className="shrink-0 text-red-500 font-bold select-none">
                    🚨
                  </span>
                  <p className="leading-relaxed">{cleanLine}</p>
                </div>
              );
            }

            return (
              <p
                key={lineIdx}
                className="text-sm text-slate-700 leading-relaxed select-text"
              >
                {renderInlineText(cleanLine)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="h-screen max-h-screen bg-(--bg-page) flex overflow-hidden font-sans relative">
      {/* MOBILE SIDEBAR TOGGLE BUTTON */}
      <button
        onClick={() => setSidebarOpen((prev) => !prev)}
        className="absolute top-3 left-4 z-40 lg:hidden p-2.5 bg-primary-500 text-white rounded-xl shadow-md cursor-pointer hover:bg-primary-600 active:scale-95 transition-all"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* LEFT SIDEBAR */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } lg:relative absolute top-0 bottom-0 left-0 z-30 w-80 bg-(--bg-surface) border-r border-(--border-color) flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0`}
      >
        <div className="flex-1 flex flex-col min-h-0 p-4 gap-3 select-none">
          {/* Sidebar Header: Search & Panel Toggle */}
          <div className="flex items-center justify-between px-1.5 py-1 shrink-0">
            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              className="p-2 hover:bg-slate-100 text-(--text-muted) hover:text-(--text-main) rounded-lg transition-colors cursor-pointer"
              title="Search consultations"
            >
              <Search className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-slate-100 text-(--text-muted) hover:text-(--text-main) rounded-lg transition-colors cursor-pointer"
              title="Collapse sidebar"
            >
              <svg
                className="w-4.5 h-4.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 3v18" />
              </svg>
            </button>
          </div>

          {/* Search Chat Input (Toggled) */}
          {showSearchInput && (
            <div className="relative animate-in fade-in slide-in-from-top-1 duration-250 shrink-0">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-450" />
              </span>
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-(--bg-page) border border-(--border-color) rounded-xl text-xs text-(--text-main) placeholder:text-(--text-muted) focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 transition-colors"
                autoFocus
              />
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchInput(false);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-(--text-muted) hover:text-slate-655"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Standard Navigation Links (Library, Scheduled, etc.) */}
          {!showSearchInput && (
            <div className="flex flex-col gap-1 shrink-0 border-b border-slate-150 pb-3">
              <button
                onClick={handleNewChat}
                className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-(--text-muted) hover:text-primary-600 hover:bg-primary-50/50 rounded-xl transition-all cursor-pointer w-full text-left"
              >
                <Plus className="w-4 h-4 text-(--text-muted)" />
                <span>New chat</span>
              </button>

              <button
                onClick={() =>
                  toast.info(
                    "Your Library contains all saved medical files & reports.",
                    { autoClose: 2000 },
                  )
                }
                className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-(--text-muted) hover:text-primary-600 hover:bg-primary-50/50 rounded-xl transition-all cursor-pointer w-full text-left"
              >
                <svg
                  className="w-4 h-4 text-(--text-muted)"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                  <path d="M6 6h10" />
                  <path d="M6 10h10" />
                </svg>
                <span>Library</span>
              </button>

              <button
                onClick={() => {
                  navigate("/my-appointments");
                  toast.info("Navigating to My Appointments page.", {
                    autoClose: 2500,
                  });
                }}
                className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-(--text-muted) hover:text-primary-600 hover:bg-primary-50/50 rounded-xl transition-all cursor-pointer w-full text-left"
              >
                <svg
                  className="w-4 h-4 text-(--text-muted)"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Scheduled</span>
              </button>

              <button
                onClick={() =>
                  toast.info("Plugins are saved for future integrations.", {
                    autoClose: 2000,
                  })
                }
                className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-(--text-muted) hover:text-primary-600 hover:bg-primary-50/50 rounded-xl transition-all cursor-pointer w-full text-left"
              >
                <svg
                  className="w-4 h-4 text-(--text-muted)"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="16" height="16" x="4" y="4" rx="2" />
                  <rect width="6" height="6" x="9" y="9" rx="1" />
                  <path d="M9 1v3" />
                  <path d="M15 1v3" />
                  <path d="M9 20v3" />
                  <path d="M15 20v3" />
                  <path d="M20 9h3" />
                  <path d="M20 15h3" />
                  <path d="M1 9h3" />
                  <path d="M1 15h3" />
                </svg>
                <span>Plugins</span>
              </button>

              <button
                onClick={() =>
                  toast.info("Explore other sections in Medicore Portal.", {
                    autoClose: 2000,
                  })
                }
                className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-(--text-muted) hover:text-primary-600 hover:bg-primary-50/50 rounded-xl transition-all cursor-pointer w-full text-left"
              >
                <svg
                  className="w-4 h-4 text-(--text-muted)"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
                <span>More</span>
              </button>
            </div>
          )}

          {/* History Scroll List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-1">
            <div className="text-[10px] uppercase font-semibold tracking-widest text-(--text-muted) px-3 py-1 mt-1">
              Chats
            </div>

            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-xs text-(--text-muted)">
                {searchQuery
                  ? "No matching chats found"
                  : "No consultations yet"}
              </div>
            ) : (
              filteredConversations.map((chat) => {
                const isActive = activeChatId === chat._id;
                const isRenaming = renamingId === chat._id;

                return (
                  <div
                    key={chat._id}
                    className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 transition-all ${
                      isActive
                        ? "bg-primary-50 text-primary-600 font-semibold"
                        : "hover:bg-(--bg-page) text-(--text-muted) hover:text-(--text-main)"
                    }`}
                  >
                    <div
                      onClick={() => !isRenaming && setActiveChatId(chat._id)}
                      className="flex-1 flex items-start gap-2.5 overflow-hidden cursor-pointer select-none"
                    >
                      <MessageSquare
                        className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? "text-primary-500" : "text-(--text-muted)"}`}
                      />

                      {isRenaming ? (
                        <input
                          type="text"
                          value={renameTitle}
                          onChange={(e) => setRenameTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameChat(chat._id);
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                          autoFocus
                          className="flex-1 bg-(--bg-surface) border border-slate-350 rounded px-1.5 py-0.5 text-xs text-(--text-main) focus:outline-none focus:border-primary-400"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-xs truncate leading-tight select-none">
                            {chat.title}
                          </span>
                          <span className="text-[9px] text-(--text-muted) mt-1 select-none font-medium">
                            {formatDateLabel(chat.updatedAt)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons (Rename / Delete) */}
                    {!isRenaming && (
                      <div className="lg:opacity-0 group-hover:opacity-100 flex items-center gap-1.5 pl-2 z-10 select-none">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRenamingId(chat._id);
                            setRenameTitle(chat.title);
                          }}
                          className="text-slate-450 hover:text-primary-600 p-1"
                          title="Rename"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(chat._id);
                          }}
                          className="text-slate-450 hover:text-rose-500 p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* BOTTOM USER PROFILE & LOGOUT */}
        <div className="p-4 border-t border-(--border-color) bg-(--bg-page) select-none">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center shrink-0 overflow-hidden text-xs font-bold text-(--text-muted) uppercase">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt="User Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {user?.name
                      ? user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                      : "PR"}
                  </span>
                )}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-(--text-main) truncate">
                  {user?.name || "Patient Profile"}
                </span>
                <span className="text-[10px] text-(--text-muted) truncate">
                  {user?.email || "medicore@hms.com"}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                toast.success("Logged out successfully.");
              }}
              className="p-2 hover:bg-slate-100 rounded-lg text-(--text-muted) hover:text-rose-600 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT CHAT AREA */}
      <main className="flex-1 flex flex-col h-full bg-(--bg-page) relative min-w-0">
        {/* TOP BAR */}
        <header className="h-16 shrink-0 bg-(--bg-surface) border-b border-(--border-color)/80 px-6 flex items-center justify-between shadow-xs select-none">
          <div className="flex items-center gap-3">
            <div className="lg:hidden w-8" /> {/* Spacer for menu toggle */}
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-500">
              <Brain className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-(--text-main) leading-none">
                Medicore AI Assistant
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-semibold text-slate-450 uppercase tracking-wider">
                  Online
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-(--text-muted)">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] bg-slate-100 py-1 px-2.5 rounded-full border border-(--border-color)/40">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure
              HIPAA Compliance
            </span>
          </div>
        </header>
        {/* SCROLLABLE CONVERSATION AREA */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!activeChatId || !activeChat || activeChat.messages.length === 0 ? (
            /* Blank/Greeting State */
            <div className="max-w-3xl mx-auto py-12 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-(--bg-surface) border border-(--border-color)/60 flex items-center justify-center text-primary-500 shadow-md mb-6 animate-bounce">
                <Brain className="w-9 h-9" />
              </div>
              <h1 className="text-2xl font-black text-(--text-main) text-center leading-tight mb-2 tracking-tight">
                How can I assist your health journey today?
              </h1>
              <p className="text-xs text-(--text-muted) text-center max-w-md leading-relaxed mb-10 select-none font-medium">
                Ask about symptoms, lab summaries, medications, or find
                information about booking and reports in Medicore.
              </p>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 w-full mt-4 select-none">
                {suggestionPrompts.map((sug, i) => (
                  <div
                    key={i}
                    onClick={() => handleSendMessage(null, sug.text)}
                    className="p-4 bg-(--bg-surface) border border-(--border-color)/80 rounded-2xl hover:border-primary-300 hover:shadow-md cursor-pointer transition-all flex flex-col text-left group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-primary-500 group-hover:text-primary-600">
                        {sug.title}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-(--text-muted) group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700 mb-0.5 italic truncate">{`"${sug.text}"`}</p>
                    <span className="text-[10px] text-slate-450">
                      {sug.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Messages list */
            <div className="max-w-3xl mx-auto space-y-6">
              {activeChat.messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg._id}
                    className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {/* Assistant Avatar */}
                    {!isUser && (
                      <div className="w-8 h-8 rounded-lg bg-primary-100 border border-primary-200/50 flex items-center justify-center text-primary-500 font-bold text-sm shrink-0 select-none shadow-3xs">
                        <Brain className="w-4 h-4" />
                      </div>
                    )}

                    <div className="flex flex-col gap-1 max-w-[85%]">
                      {/* Message Bubble */}
                      <div
                        className={`rounded-2xl px-4.5 py-3 border shadow-3xs ${
                          isUser
                            ? "bg-primary-500 text-white border-primary-600 rounded-tr-xs"
                            : "bg-(--bg-surface) text-slate-850 border-(--border-color)/80 rounded-tl-xs"
                        }`}
                      >
                        {isUser ? (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap select-text">
                            {msg.content}
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            {msg.content
                              ? renderContentMarkdown(msg.content)
                              : null}
                            {msg.isStreaming && (
                              <span
                                className="inline-block w-2 h-4 bg-primary-400 rounded-sm align-middle animate-pulse ml-0.5"
                                style={{ animationDuration: "0.7s" }}
                              />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Message actions footer */}
                      <div
                        className={`flex items-center gap-2.5 text-[10px] font-semibold text-(--text-muted) px-1 mt-0.5 select-none ${
                          isUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span>{formatTime(msg.timestamp)}</span>

                        {!isUser && (
                          <div className="flex items-center gap-1.5 ml-2.5 select-none">
                            <button
                              onClick={() =>
                                handleCopyMessage(msg.content, msg._id)
                              }
                              className="hover:text-(--text-muted) p-0.5 transition-colors cursor-pointer"
                              title="Copy response"
                            >
                              {copiedId === msg._id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleLikeMessage(msg._id)}
                              className={`p-0.5 transition-colors cursor-pointer ${
                                likedMessages[msg._id]
                                  ? "text-emerald-500"
                                  : "hover:text-(--text-muted)"
                              }`}
                              title="Helpful"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDislikeMessage(msg._id)}
                              className={`p-0.5 transition-colors cursor-pointer ${
                                dislikedMessages[msg._id]
                                  ? "text-rose-500"
                                  : "hover:text-(--text-muted)"
                              }`}
                              title="Not helpful"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing/Loading Indicator — shown only before first stream chunk arrives */}
              {isLoading &&
                !activeChat?.messages?.some(
                  (m) => m.isStreaming && m.content.length > 0,
                ) && (
                  <div className="flex gap-4 justify-start">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 border border-primary-200/50 flex items-center justify-center text-primary-500 shrink-0 select-none">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="bg-(--bg-surface) border border-(--border-color)/80 rounded-2xl rounded-tl-xs px-4.5 py-3.5 flex items-center gap-1.5 shadow-3xs w-16">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100" />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200" />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-300" />
                      </div>
                    </div>
                  </div>
                )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* BOTTOM FIXED INPUT AREA */}
        <footer className="shrink-0 bg-(--bg-surface) border-t border-(--border-color)/80 p-4.5">
          <div className="max-w-3xl mx-auto flex flex-col gap-2 relative">
            {/* Generating controls (Stop, Regenerate) */}
            <div className="flex justify-center select-none">
              {isLoading ? (
                <button
                  onClick={handleStopGenerating}
                  className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-1.5 px-3.5 rounded-full shadow-md hover:shadow-lg transition-all border border-slate-800 cursor-pointer animate-fade-in"
                >
                  <Square className="w-3 h-3 text-rose-500 fill-rose-500" />{" "}
                  Stop Generating
                </button>
              ) : (
                activeChat?.messages?.length > 1 && (
                  <button
                    onClick={handleRegenerateResponse}
                    className="flex items-center gap-1.5 bg-(--bg-surface) hover:bg-(--bg-page) text-slate-700 text-xs font-bold py-1.5 px-3.5 rounded-full shadow-xs border border-(--border-color) cursor-pointer hover:border-slate-300 transition-all"
                  >
                    <RotateCcw className="w-3 h-3 text-(--text-muted)" />{" "}
                    Regenerate Response
                  </button>
                )
              )}
            </div>

            {/* Input Form (ChatGPT Pill Design) */}
            <form onSubmit={handleSendMessage} className="w-full">
              <div className="bg-slate-100/90 border border-(--border-color)/60 rounded-3xl p-1.5 focus-within:bg-(--bg-surface) focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-all flex items-center gap-2.5 px-4 shadow-3xs">
                {/* Plus button Attach File (Screenshot layout) */}
                <button
                  type="button"
                  onClick={() =>
                    toast.info("Attachments are saved for future expansion.", {
                      autoClose: 2000,
                    })
                  }
                  className="p-2 hover:bg-slate-250 text-(--text-muted) rounded-full transition-colors cursor-pointer shrink-0"
                  title="Attach File"
                >
                  <Plus className="w-5 h-5 text-(--text-muted)" />
                </button>

                {/* Textarea Input */}
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  rows={1}
                  placeholder="Ask anything"
                  className="flex-1 bg-transparent border-0 outline-none resize-none text-sm text-slate-850 py-3 px-1 focus:ring-0 leading-relaxed max-h-40 placeholder:text-(--text-muted) select-text"
                />

                {/* Microphone Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-full transition-all cursor-pointer shrink-0 ${
                    isListening
                      ? "bg-rose-500 text-white animate-pulse shadow-md"
                      : "hover:bg-slate-250 text-(--text-muted) hover:text-slate-700"
                  }`}
                  title={isListening ? "Stop Listening" : "Voice Query"}
                >
                  <Mic
                    className={`w-4.5 h-4.5 ${isListening ? "text-white" : "text-(--text-muted)"}`}
                  />
                </button>

                {/* Circular Send Button inside the pill container (Screenshot layout) */}
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="w-9 h-9 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-200 text-white rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs"
                  title="Send Message"
                >
                  <svg
                    className="w-4 h-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </footer>
      </main>

      {/* RENAME MODAL OR DELETE CONFIRMATION MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs select-none"
            onClick={() => setDeletingId(null)}
          />
          <div className="bg-(--bg-surface) rounded-2xl shadow-2xl p-6 max-w-sm w-full relative z-10 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-(--text-main)">
              Delete Consultation?
            </h3>
            <p className="text-xs text-(--text-muted) mt-2 leading-relaxed">
              This will permanently delete this conversation and its message
              history from MongoDB. This action cannot be undone.
            </p>
            <div className="flex gap-2.5 justify-end mt-6 select-none">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 border border-slate-250 text-slate-700 rounded-lg text-xs font-bold hover:bg-(--bg-page) cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteChat(deletingId)}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChat;
