import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import NoteCard from "../components/NoteCard";
import {
  DocumentTextIcon,
  TagIcon,
  CalendarIcon,
  MapPinIcon,
  CheckCircleIcon,
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import { ArrowUpTrayIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  Bar,
  Legend
} from "recharts";

interface Tag {
  id: number;
  name: string;
  color: string;
}

interface Note {
  id: number;
  name: string;
  summary: string;
  action_items: string;
  updated_at: string;
  tags?: Tag[];
  content: string;
}

interface ApiUsageEntry {
  id: number;
  user_id: number;
  note_id: number | null;
  input_tokens: number;
  output_tokens: number;
  usage_date: string;
}

// Fetcher for AI results using OpenAI and generateText
const fetchAiResults = async (weekItems: string, apiKey: string) => {
  const provider = createOpenAI({ apiKey });
  // consolidate action items
  const { text: itemsText } = await generateText({
    model: provider("gpt-4o-mini"),
    system:
      "Consolidate the following list of action items into a concise bullet list without numbering, keeping the most important items and limiting to 10 bullet points. Each item should start with a bullet point (•) and be no longer than 25 words.",
    prompt: weekItems
  });
  // extract keywords
  const keywordsPrompt = `Extract the top 5 most important keywords or short phrases (comma-separated) from the following action items:\n${weekItems}`;
  const { text: keywordsText } = await generateText({
    model: provider("gpt-4o-mini"),
    system: "You are an AI assistant that extracts keywords.",
    prompt: keywordsPrompt
  });
  // return both
  return { itemsText, keywordsText };
};

const Dashboard: React.FC = () => {
  const [userName, setUserName] = useState<string>("");
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [userApiKey, setUserApiKey] = useState<string>("");
  const [weekNotes, setWeekNotes] = useState<Note[]>([]);
  const [apiUsage, setApiUsage] = useState<ApiUsageEntry[]>([]);
  // SWR for AI generated action items and keywords
  const { data: aiData, isValidating: aiLoading } = useSWR(
    weekNotes.length && userApiKey
      ? [
          "aiResults",
          weekNotes.map(n => n.id).join(","),
          userApiKey
        ]
      : null,
    () =>
      fetchAiResults(
        weekNotes
          .flatMap(n =>
            n.action_items
              .split(/\r?\n/)
              .map(i => i.trim())
              .filter(Boolean)
          )
          .join("\n"),
        userApiKey
      ),
    { revalidateOnFocus: false, dedupingInterval: 24 * 60 * 60 * 1000 }
  );
  const loadingActionItems = aiLoading && !aiData;
  const aiActionItems =
    aiData?.itemsText
      .split(/\r?\n|[•]\s*/)
      .map(i => i.trim())
      .filter(Boolean) || [];
  const topKeywords =
    aiData?.keywordsText
      .split(/,|\n/)
      .map(k => k.trim())
      .filter(Boolean)
      .slice(0, 5) || [];
  const [yearNotes, setYearNotes] = useState<Note[]>([]);
  // const [activityData, setActivityData] = useState<{ month: string; count: number }[]>([]);
  const [totalNotes, setTotalNotes] = useState<number>(0);
  const [totalTags, setTotalTags] = useState<number>(0);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    fetch("http://localhost:8000/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.username) setUserName(data.username);
        if (data.openai_api_key) setUserApiKey(data.openai_api_key);
      })
      .catch(err => console.error("Failed to fetch user info:", err));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    fetch("http://localhost:8000/notes/", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then((data: Note[]) => {
        setTotalNotes(data.length);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const filtered = data.filter(n => new Date(n.updated_at) >= weekAgo);
        // sort and take top 4 for recentNotes
        const sorted = filtered.sort((a,b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        setRecentNotes(sorted.slice(0,4));
        setWeekNotes(filtered);
        setYearNotes(data);
      })
      .catch(err => console.error("Failed to fetch notes:", err));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    fetch("http://localhost:8000/tags/", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then((tags: Tag[]) => setTotalTags(tags.length))
      .catch(err => console.error("Failed to fetch tags:", err));
  }, []);

  // Removed old activityData state/effect (now handled below)
  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    fetch("http://localhost:8000/users/me/usage", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then((data: ApiUsageEntry[]) => setApiUsage(data))
      .catch(err => console.error("Failed to fetch API usage:", err));
  }, []);

  const uploadActivityData = useMemo(() => {
    const counts: Record<string, number> = {};
    apiUsage.forEach(u => {
      const date = u.usage_date.slice(0, 10);
      counts[date] = (counts[date] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [apiUsage]);

  const tokenUsageData = useMemo(() => {
    const sums: Record<string, { input: number; output: number }> = {};
    apiUsage.forEach(u => {
      const date = u.usage_date.slice(0, 10);
      if (!sums[date]) sums[date] = { input: 0, output: 0 };
      sums[date].input += u.input_tokens;
      sums[date].output += u.output_tokens;
    });
    return Object.entries(sums)
      .map(([date, vals]) => ({ date, input: vals.input, output: vals.output }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [apiUsage]);


  const totalInputTokens = useMemo(() => {
    return apiUsage.reduce((sum, u) => sum + u.input_tokens, 0);
  }, [apiUsage]);

  const totalOutputTokens = useMemo(() => {
    return apiUsage.reduce((sum, u) => sum + u.output_tokens, 0);
  }, [apiUsage]);

  return (
    <>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-100 min-h-screen p-8 font-sans"
      >
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 250 }}
          className="bg-white rounded-lg shadow-lg p-8 mb-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0"
        >
          <div>
            <p className="text-lg text-gray-500 mb-1">Welcome back,</p>
            <h1 className="text-5xl font-extrabold text-[#001f3f] tracking-tight">
              {userName || "User"}<span className="text-[#001f3f]">!</span>
            </h1>
          </div>
          <h2 className="text-3xl font-extrabold text-[#001f3f] uppercase tracking-wide mx-auto my-4 sm:my-0">
            My Dashboard
          </h2>
          <UserIcon className="w-16 h-16 text-[#001f3f] mt-4 sm:mt-0" />
        </motion.div>
        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Total Notes */}
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.15)" }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white rounded-lg shadow p-6 flex items-center border-l-4 border-[#001f3f]"
          >
            <div className="p-3 bg-[#001f3f] rounded-full">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Notes</p>
              <p className="text-2xl font-semibold text-[#001f3f]">{totalNotes}</p>
            </div>
          </motion.div>
          {/* Total Tags */}
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.15)" }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white rounded-lg shadow p-6 flex items-center border-l-4 border-[#001f3f]"
          >
            <div className="p-3 bg-[#001f3f] rounded-full">
              <TagIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Tags</p>
              <p className="text-2xl font-semibold text-[#001f3f]">{totalTags}</p>
            </div>
          </motion.div>
          {/* Input Tokens */}
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.15)" }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white rounded-lg shadow p-6 flex items-center border-l-4 border-[#001f3f]"
          >
            <div className="p-3 bg-[#001f3f] rounded-full">
              <ArrowUpTrayIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Input Tokens</p>
              <p className="text-2xl font-semibold text-[#001f3f]">{totalInputTokens}</p>
            </div>
          </motion.div>
          {/* Output Tokens */}
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.15)" }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white rounded-lg shadow p-6 flex items-center border-l-4 border-[#001f3f]"
          >
            <div className="p-3 bg-[#001f3f] rounded-full">
              <ArrowDownTrayIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Output Tokens</p>
              <p className="text-2xl font-semibold text-[#001f3f]">{totalOutputTokens}</p>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="col-span-2 space-y-6">
            {/* Recently Modified Notes */}
            <motion.div
              whileHover={{ scale: 1.02, boxShadow: "0px 8px 16px rgba(0,0,0,0.1)" }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-[#001f3f]"
            >
              <h2 className="text-2xl font-extrabold text-[#001f3f] mb-4 uppercase tracking-wide flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2 text-[#001f3f]" />
                Recently Modified
              </h2>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {recentNotes.map(note => (
                  <motion.div
                    key={note.id}
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <NoteCard
                      noteId={note.id}
                      name={note.name}
                      summary={note.summary}
                      actionItems={note.action_items}
                      onDelete={async (id: number) => {
                        const res = await fetch(`http://localhost:8000/notes/${id}`, {
                          method: "DELETE",
                          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                        });
                        if (res.ok) {
                          setRecentNotes(prev => prev.filter(n => n.id !== id));
                        } else {
                          alert("Failed to delete note.");
                        }
                      }}
                      expandLink={`/notes/${note.id}`}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            {/* Chart Panels Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                whileHover={{ scale: 1.02, boxShadow: "0px 8px 16px rgba(0,0,0,0.1)" }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-[#001f3f]"
              >
                <h2 className="text-2xl font-extrabold text-[#001f3f] mb-4 uppercase tracking-wide flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-[#001f3f]" />
                  Queries Over Time
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={uploadActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#001f3f" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02, boxShadow: "0px 8px 16px rgba(0,0,0,0.1)" }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-[#001f3f]"
              >
                <h2 className="text-2xl font-extrabold text-[#001f3f] mb-4 uppercase tracking-wide flex items-center">
                  <CurrencyDollarIcon className="w-5 h-5 mr-2 text-[#001f3f]" />
                  Token Usage Over Time
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={tokenUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="input" stackId="a" fill="#001f3f" />
                    <Bar dataKey="output" stackId="a" fill="#004080" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </section>

          <aside className="space-y-6">
            {/* Your Past Week Section */}
            <motion.div
              whileHover={{ scale: 1.02, boxShadow: "0px 8px 16px rgba(0,0,0,0.1)" }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-[#001f3f]"
            >
              <h2 className="text-2xl font-extrabold text-[#001f3f] mb-4 uppercase tracking-wide">
                Your Past Week
              </h2>
              <div className="space-y-6">
                {/* Action Items */}
                <div>
                  <h3 className="text-lg font-medium text-[#001f3f] mb-2 flex items-center">
                    <CheckCircleIcon className="w-5 h-5 mr-2 text-[#001f3f]" />
                    Generated Action Items
                  </h3>
                  <div className="min-h-[4rem] flex items-center justify-center">
                    {loadingActionItems ? (
                      <div className="w-6 h-6 border-4 border-gray-200 border-t-[#001f3f] rounded-full animate-spin"></div>
                    ) : (
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {aiActionItems.length ? (
                          aiActionItems.map((item, idx) => <li key={idx}>{item}</li>)
                        ) : (
                          <li>No action items found.</li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
                {/* Top Keywords */}
                <div>
                  <h3 className="text-lg font-medium text-[#001f3f] mb-2 flex items-center">
                    <TagIcon className="w-5 h-5 mr-2 text-[#001f3f]" />
                    Top Keywords
                  </h3>
                  <div className="min-h-[3rem] flex items-center justify-center">
                    {loadingActionItems ? (
                      <div className="w-6 h-6 border-4 border-gray-200 border-t-[#001f3f] rounded-full animate-spin"></div>
                    ) : topKeywords.length ? (
                      <div className="flex flex-wrap gap-2">
                        {topKeywords.map((kw, idx) => (
                          <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-gray-700">
                            {kw}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">No keywords found.</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </aside>
        </div>
      </motion.main>
    </>
  );
};

export default Dashboard;