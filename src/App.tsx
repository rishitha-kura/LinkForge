import React, { useState, useEffect } from "react";
import { 
  Link2, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw,
  Flame,
  Sparkles,
  Settings,
  History
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UrlMapping } from "./types";

export default function App() {
  // Input fields and loading states
  const [originalUrl, setOriginalUrl] = useState("");
  const [errorInput, setErrorInput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMapping, setSuccessMapping] = useState<UrlMapping | null>(null);

  // Database listing history state
  const [urlHistory, setUrlHistory] = useState<UrlMapping[]>([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Copy tracking states for specific rows
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Connection config toggle state
  const [showSettings, setShowSettings] = useState(false);

  // Backend Toggle Configuration
  // "local" uses our live local Express backend (Port 3000)
  // "custom" connects directly to user's Spring Boot deployed on Render/local
  const [apiMode, setApiMode] = useState<"local" | "custom">("local");
  const [customApiUrl, setCustomApiUrl] = useState("http://localhost:8080");

  // Determine active API Url
  const activeApiUrl = apiMode === "local" ? "" : customApiUrl;

  // Retrieve current shortened list from active backend on load or when API configuration changes
  const fetchUrlHistory = async () => {
    setIsFetchingHistory(true);
    setHistoryError(null);
    try {
      const response = await fetch(`${activeApiUrl}/api/urls`);
      if (!response.ok) {
        throw new Error(`Failed to load history (HTTP ${response.status})`);
      }
      const data = await response.json();
      setUrlHistory(data);
    } catch (err: any) {
      console.error(err);
      setHistoryError(
        apiMode === "custom"
          ? `Could not reach your Spring Boot backend at ${customApiUrl}. Please ensure it is running and CORS is configured.`
          : "Could not retrieve link history."
      );
    } finally {
      setIsFetchingHistory(false);
    }
  };

  useEffect(() => {
    fetchUrlHistory();
  }, [apiMode, customApiUrl]);

  // Form submit to shorten URLs
  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInput(null);
    setSuccessMapping(null);

    // Initial validation
    if (!originalUrl.trim()) {
      setErrorInput("Please provide a valid URL destination");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${activeApiUrl}/api/urls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ originalUrl: originalUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to shorten URL");
      }

      setSuccessMapping(data);
      setOriginalUrl("");
      // Refresh history list
      fetchUrlHistory();
    } catch (err: any) {
      setErrorInput(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Clipboard copy handler with cross-origin sandboxed standard fallback
  const copyToClipboard = (text: string, key: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text)
          .then(() => {
            setCopiedKey(key);
            setTimeout(() => {
              setCopiedKey(null);
            }, 2000);
          })
          .catch(() => {
            fallbackCopyText(text, key);
          });
      } else {
        fallbackCopyText(text, key);
      }
    } catch {
      fallbackCopyText(text, key);
    }
  };

  // Fallback copying function using document.execCommand
  const fallbackCopyText = (text: string, key: string) => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      // Prevent screen scrolling on selection jump
      textarea.style.top = "0";
      textarea.style.left = "0";
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (successful) {
        setCopiedKey(key);
        setTimeout(() => {
          setCopiedKey(null);
        }, 2000);
      }
    } catch (err) {
      console.error("Fallback clipboard mechanism failed:", err);
    }
  };

  // Convert date format elegantly
  const formatDate = (isoString: string) => {
    if (!isoString) return "Just now";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
        return "Just now";
      }
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Just now";
    }
  };

  return (
    <div className="min-h-screen bg-[#07050f] text-slate-100 font-sans relative overflow-hidden selection:bg-purple-500/30 selection:text-purple-200 antialiased">
      {/* Ambient glowing background orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-900/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-fuchsia-950/5 blur-[150px] pointer-events-none" />
      
      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-16 relative z-10">
        
        {/* Navigation / Header */}
        <nav className="flex items-center justify-between mb-12 relative">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 opacity-75 blur-sm transition duration-500 group-hover:opacity-100" />
              <div className="relative w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-purple-400 border border-purple-500/30 shadow-xl">
                <Flame className="w-5 h-5 text-purple-400 animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold font-display tracking-tight bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
                LinkForge
              </span>
              <span className="text-[10px] text-purple-400/70 uppercase tracking-widest font-mono font-medium leading-none">
                URL Alchemist
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Active sync tag */}
            <div className="hidden sm:flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full text-xs font-medium text-purple-300">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
              Forge Synced
            </div>
            
            {/* Sleek inline connection manager dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  showSettings 
                    ? "bg-purple-600/20 border-purple-500 text-white shadow-lg" 
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-purple-500/30"
                }`}
                title="Connection Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 glass-panel rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50 text-left"
                  >
                    <h4 className="text-sm font-semibold font-display text-white mb-2 flex items-center gap-1.5">
                      <Settings className="w-4 h-4 text-purple-400" />
                      Configuration Engine
                    </h4>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      Toggle backend sources seamlessly. Standard in-memory works automatically inside this host sandbox.
                    </p>

                    <div className="space-y-4">
                      <div className="bg-slate-950/60 p-1 rounded-xl border border-purple-500/10 flex items-center shadow-inner">
                        <button 
                          type="button"
                          onClick={() => setApiMode("local")}
                          className={`text-xs px-3 py-2 rounded-lg flex-1 font-semibold transition-all cursor-pointer ${
                            apiMode === "local" 
                              ? "bg-purple-600 text-white shadow-md border border-purple-500/30" 
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          Local Engine
                        </button>
                        <button 
                          type="button"
                          onClick={() => setApiMode("custom")}
                          className={`text-xs px-3 py-2 rounded-lg flex-1 font-semibold transition-all cursor-pointer ${
                            apiMode === "custom" 
                              ? "bg-purple-600 text-white shadow-md border border-purple-500/30" 
                              : "text-slate-400 hover:text-purple-400"
                          }`}
                        >
                          Custom API
                        </button>
                      </div>

                      {apiMode === "custom" && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 overflow-hidden"
                        >
                          <label className="text-[10px] uppercase tracking-wider font-mono font-bold text-purple-400">Endpoint Destination</label>
                          <div className="flex gap-2">
                            <input 
                              type="url" 
                              placeholder="e.g. http://localhost:8080" 
                              value={customApiUrl}
                              onChange={(e) => setCustomApiUrl(e.target.value)}
                              className="bg-slate-950/70 border border-purple-500/20 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:border-purple-400 outline-none flex-1 font-mono"
                            />
                            <button 
                              type="button"
                              onClick={fetchUrlHistory}
                              className="bg-purple-600 text-white p-2 rounded-xl hover:bg-purple-500 transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                              title="Reconnect"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </nav>

        {/* Shortener Submission Hero Area */}
        <section className="flex flex-col items-center gap-6 py-8 md:py-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 border border-purple-500/20 px-3.5 py-1 rounded-full text-xs text-purple-300 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>Transform bulky links into sleek portals</span>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-white leading-tight">
              Forge Your Links, <br />
              <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                Elevate Your Reach
              </span>
            </h1>
            <p className="text-sm md:text-base text-slate-400 max-w-lg mx-auto font-sans leading-relaxed">
              Shape raw URLs into high-performing, ultra-compact short links. Enjoy instant redirections and complete client-server synergy.
            </p>
          </div>
          
          <div className="w-full max-w-3xl mt-6 relative">
            <div className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              {/* Decorative top border glow */}
              <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
              
              <form onSubmit={handleShorten} className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch gap-3 relative">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Link2 className="w-5 h-5 text-purple-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Paste your long destination URL here..."
                      value={originalUrl}
                      onChange={(e) => {
                        setOriginalUrl(e.target.value);
                        if (errorInput) setErrorInput(null);
                      }}
                      disabled={isLoading}
                      className="w-full bg-slate-950/60 border border-purple-500/20 focus:border-purple-500 rounded-2xl py-4 pl-12 pr-4 text-base outline-none text-white placeholder-slate-500 transition-all focus:ring-2 focus:ring-purple-500/10 font-sans"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative group overflow-hidden bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-2xl px-8 py-4 font-bold text-base transition-all hover:opacity-95 shadow-lg shadow-purple-550/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin text-purple-200" />
                        <span>Forging...</span>
                      </>
                    ) : (
                      <>
                        <span>Forge Link</span>
                        <ArrowRight className="w-4 h-4 text-purple-200 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {errorInput && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-rose-450 text-xs px-2 font-medium justify-center sm:justify-start"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="text-rose-300">{errorInput}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              {/* Stylish Success Result Card */}
              <AnimatePresence>
                {successMapping && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-purple-950/20 border border-purple-500/30 rounded-2xl p-5 relative text-left">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                            <Check className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest font-mono">LINK FORGED</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            </div>
                            <h4 className="text-sm font-semibold text-slate-350 truncate">
                              Your compact redirect link is ready
                            </h4>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                          <button
                            onClick={() => copyToClipboard(successMapping.shortUrl, "success")}
                            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl glass-panel text-purple-300 hover:text-white hover:border-purple-500/50 cursor-pointer transition-all"
                          >
                            {copiedKey === "success" ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>COPIED</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>COPY</span>
                              </>
                            )}
                          </button>
                          <a
                            href={successMapping.shortUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-purple-600/95 hover:bg-purple-600 border border-purple-500/40 text-white cursor-pointer transition-all"
                          >
                            <ExternalLink className="w-3 a.5 h-3.5" />
                            <span>OPEN URL</span>
                          </a>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-purple-500/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-slate-500 shrink-0 font-medium">Connector:</span>
                          <span className="font-mono text-purple-300 font-semibold truncate select-all">{successMapping.shortUrl}</span>
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-slate-500 shrink-0 font-medium">Destination:</span>
                          <span className="font-mono text-slate-400 truncate select-all max-w-[240px]">{successMapping.originalUrl}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Recent generated links table section (Centered and Full Width) */}
        <section className="w-full max-w-3xl mx-auto mt-6 relative z-10">
          <div className="glass-panel rounded-3xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between px-6 py-5 bg-slate-950/35 border-b border-purple-500/15">
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-purple-455" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-purple-300 font-display">
                  Recent Alchemical Forges
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-slate-400 font-mono">
                  ({urlHistory.length} mappings)
                </span>
                <button 
                  onClick={fetchUrlHistory} 
                  className="text-slate-400 hover:text-purple-300 p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer"
                  title="Refresh mappings"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetchingHistory ? 'animate-spin text-purple-400' : ''}`} />
                </button>
              </div>
            </div>

            {isFetchingHistory && urlHistory.length === 0 ? (
              <div className="py-20 text-center text-slate-400 space-y-3 flex flex-col items-center justify-center">
                <span className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-400 rounded-full animate-spin inline-block"></span>
                <p className="text-xs font-medium font-mono text-purple-400/80">Reading forged mappings...</p>
              </div>
            ) : historyError ? (
              <div className="p-6 m-4 bg-rose-950/20 border border-rose-500/30 rounded-2xl flex gap-3 text-rose-300 text-xs text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div>
                  <span className="font-bold text-rose-200">Connection Error</span>
                  <p className="mt-1 leading-relaxed opacity-90">{historyError}</p>
                </div>
              </div>
            ) : urlHistory.length === 0 ? (
              <div className="py-20 text-center text-slate-500 border border-dashed border-purple-500/10 rounded-2xl m-6 bg-slate-950/15">
                <Flame className="w-8 h-8 mx-auto mb-2 text-purple-500/20" />
                <p className="text-xs font-semibold text-slate-400 font-sans">No mappings recorded inside the forge</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                  Paste a long URL above to forge your first compact redirect connector.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/20 border-b border-purple-500/10">
                      <th className="px-6 py-4 text-xs font-bold text-purple-400 uppercase tracking-wider">Original Destination</th>
                      <th className="px-6 py-4 text-xs font-bold text-purple-400 uppercase tracking-wider">Short Key</th>
                      <th className="px-6 py-4 text-xs font-bold text-purple-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-500/10">
                    {urlHistory.map((row) => (
                      <tr key={row.shortKey} className="hover:bg-purple-950/10 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex flex-col max-w-xs md:max-w-md">
                            <span className="text-sm font-semibold text-slate-200 truncate group-hover:text-purple-200 transition-colors select-all" title={row.originalUrl}>
                              {row.originalUrl}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                              Created {formatDate(row.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-purple-400 font-semibold select-all">
                          <div className="flex items-center gap-2">
                            <span className="bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-lg text-xs font-mono text-purple-300">
                              {row.shortKey}
                            </span>
                            <a
                              href={row.shortUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-500 hover:text-purple-300 p-1.5 rounded-lg hover:bg-purple-500/15 transition-all"
                              title="Visit redirect connector"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => copyToClipboard(row.shortUrl, row.shortKey)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl border cursor-pointer transition-all ${
                              copiedKey === row.shortKey
                                ? "bg-purple-500/20 text-purple-300 border-purple-550/40 font-bold"
                                : "glass-panel text-slate-400 hover:text-white hover:border-purple-500/35"
                            }`}
                          >
                            {copiedKey === row.shortKey ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>COPIED</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-purple-400" />
                                <span>COPY</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Clean Consumer Footer */}
      <footer className="mt-20 border-t border-purple-500/10 py-8 text-center text-xs text-slate-500 relative z-10">
        <p className="font-mono">© {new Date().getFullYear()} LinkForge. All rights reserved. Shaped by URL alchemy.</p>
      </footer>
    </div>
  );
}

