import React, { useState, useEffect, useMemo } from "react";
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
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line
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

// Fetcher for AI results using OpenAI and generateText
const fetchAiResults = async (weekItems: string, apiKey: string) => {
  const provider = createOpenAI({ apiKey });
  // consolidate action items
  const { text: itemsText } = await generateText({
    model: provider("gpt-4o-mini"),
    system:
      "Consolidate the following list of action items into a concise bullet list without numbering, keeping the most important items. Each item should start with a bullet point (•) and be no longer than 20 words.",
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
  const [activityData, setActivityData] = useState<{ month: string; count: number }[]>([]);
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

  useEffect(() => {
    // Group by month
    const counts: Record<string, number> = {};
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    yearNotes
      .filter(n => new Date(n.updated_at) >= oneYearAgo)
      .forEach(n => {
        const d = new Date(n.updated_at);
        const month = d.toLocaleString("default", { year: "numeric", month: "short" });
        counts[month] = (counts[month] || 0) + 1;
      });
    // Build sorted array for chart
    const dataArr = Object.entries(counts)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => new Date(a.month + " 1").getTime() - new Date(b.month + " 1").getTime());
    setActivityData(dataArr);
  }, [yearNotes]);


  const { inputTokens, outputTokens } = useMemo(() => {
    let inTokens = 0, outTokens = 0;
    weekNotes.forEach(n => {
      inTokens += n.summary.split(/\s+/).length + n.action_items.split(/\s+/).length;
      outTokens += n.content.split(/\s+/).length;
    });
    return { inputTokens: inTokens, outputTokens: outTokens };
  }, [weekNotes]);

  return (
    <>
      <main className="bg-gray-100 min-h-screen p-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex flex-col sm:flex-row items-center justify-between">
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
        </div>
        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Notes */}
          <div className="bg-white rounded-lg shadow p-6 flex items-center">
            <div className="p-3 bg-[#001f3f] rounded-full">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Notes</p>
              <p className="text-2xl font-semibold text-[#001f3f]">{totalNotes}</p>
            </div>
          </div>
          {/* Total Tags */}
          <div className="bg-white rounded-lg shadow p-6 flex items-center">
            <div className="p-3 bg-[#001f3f] rounded-full">
              <TagIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Tags</p>
              <p className="text-2xl font-semibold text-[#001f3f]">{totalTags}</p>
            </div>
          </div>
          {/* Input Tokens */}
          <div className="bg-white rounded-lg shadow p-6 flex items-center">
            <div className="p-3 bg-[#001f3f] rounded-full">
              <ArrowUpTrayIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Input Tokens</p>
              <p className="text-2xl font-semibold text-[#001f3f]">{inputTokens}</p>
            </div>
          </div>
          {/* Output Tokens */}
          <div className="bg-white rounded-lg shadow p-6 flex items-center">
            <div className="p-3 bg-[#001f3f] rounded-full">
              <ArrowDownTrayIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Output Tokens</p>
              <p className="text-2xl font-semibold text-[#001f3f]">{outputTokens}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="col-span-2 space-y-6">
            {/* Recently Modified Notes */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-[#001f3f] mb-4 flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2 text-[#001f3f]" />
                Recently Modified
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentNotes.map(note => (
                  <NoteCard
                    key={note.id}
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
                ))}
              </div>
            </div>
            {/* Upload Activity */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-[#001f3f] mb-4 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-[#001f3f]" />
                Upload Activity
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#001f3f" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <aside className="space-y-6">
            {/* Your Past Week Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-[#001f3f] mb-4">
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
            </div>
          </aside>
        </div>
      </main>
    </>
  );
};

export default Dashboard;