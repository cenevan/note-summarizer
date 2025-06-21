import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  BoltIcon,
  SparklesIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  DocumentTextIcon,
  LightBulbIcon,
  TagIcon,
  PencilSquareIcon,
  UsersIcon,
  ArrowUpTrayIcon
} from "@heroicons/react/24/outline";

const LandingPage: React.FC = () => (
  <>
    <Header />
    <main className="bg-[#f8f9fa] text-[#001f3f]">
      {/* Hero */}
      <section className="bg-[#001f3f] text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            AI-Powered Note Summaries in Seconds
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Transform raw notes into concise summaries and actionable insights instantly.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-[#00d8d8] text-[#001f3f] font-semibold px-8 py-3 rounded-full shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#00d8d8]"
          >
            Get Started – It’s Free
          </Link>
        </div>
      </section>
      {/* Key Features */}
      <section className="py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
            <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
              <DocumentTextIcon className="w-10 h-10 text-[#00d8d8] mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">One-click Summaries</h3>
              <p className="text-gray-600">Generate concise summaries with a single click.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
              <LightBulbIcon className="w-10 h-10 text-[#00d8d8] mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Actionable Insights</h3>
              <p className="text-gray-600">Extract key action items from your notes.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
              <TagIcon className="w-10 h-10 text-[#00d8d8] mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Tag-based Organization</h3>
              <p className="text-gray-600">Organize notes using intuitive tags.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
              <ArrowUpTrayIcon className="w-10 h-10 text-[#00d8d8] mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 flex items-center justify-center">
                Multi-Modal Support
                <span className="ml-2 inline-block bg-[#00d8d8] bg-opacity-20 text-[#001f3f] text-xs font-semibold px-2 py-1 rounded-full">
                  Coming Soon
                </span>
              </h3>
              <p className="text-gray-600">
                Upload PDFs, images, and more for comprehensive note-taking.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
              <PencilSquareIcon className="w-10 h-10 text-[#00d8d8] mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 flex items-center justify-center">
                Smart Draft Composer
                <span className="ml-2 inline-block bg-[#00d8d8] bg-opacity-20 text-[#001f3f] text-xs font-semibold px-2 py-1 rounded-full">
                  Coming Soon
                </span>
              </h3>
              <p className="text-gray-600">Compose drafts effortlessly with AI assistance.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition lg:col-start-3">
              <UsersIcon className="w-10 h-10 text-[#00d8d8] mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 flex items-center justify-center">
                Collaborative Workspaces
                <span className="ml-2 inline-block bg-[#00d8d8] bg-opacity-20 text-[#001f3f] text-xs font-semibold px-2 py-1 rounded-full">
                  Coming Soon
                </span>
              </h3>
              <p className="text-gray-600">Share and collaborate with your team in real-time.</p>
            </div>
          </div>
        </div>
      </section>
      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">How It Works</h2>
          <div className="flex flex-col sm:flex-row justify-center items-start gap-8">
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold mb-2">1</div>
              <p className="text-gray-600">Upload your notes</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold mb-2">2</div>
              <p className="text-gray-600">AI generates summary</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold mb-2">3</div>
              <p className="text-gray-600">Organize & share</p>
            </div>
          </div>
        </div>
      </section>
      {/* Final CTA */}
      <section className="bg-[#001f3f] text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Elevate Your Notes?</h2>
          <Link
            to="/signup"
            className="inline-block bg-[#00d8d8] text-[#001f3f] font-semibold px-8 py-3 rounded-full shadow-md hover:opacity-90"
          >
            Get Started – It’s Free
          </Link>
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default LandingPage;