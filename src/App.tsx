import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  FileText, 
  BarChart3, 
  MessageSquare, 
  Plus, 
  Send, 
  History, 
  CheckCircle2, 
  Leaf,
  ArrowRight,
  Database,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Module = 'categorize' | 'proposal' | 'impact' | 'whatsapp' | 'logs';

export default function App() {
  const [activeModule, setActiveModule] = useState<Module>('categorize');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  // Module 1 State
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [catResult, setCatResult] = useState<any>(null);

  // Module 2 State
  const [clientName, setClientName] = useState('');
  const [budget, setBudget] = useState('');
  const [requirements, setRequirements] = useState('');
  const [propResult, setPropResult] = useState<any>(null);

  useEffect(() => {
    if (activeModule === 'logs') {
      fetchLogs();
    }
  }, [activeModule]);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCategorize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: productName, description: productDesc })
      });
      const data = await res.json();
      setCatResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/ai/proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_name: clientName, budget: parseFloat(budget), requirements })
      });
      const data = await res.json();
      setPropResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-black/5 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
            <Leaf size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight">Rayeva AI</span>
        </div>

        <nav className="flex flex-col gap-2">
          <NavItem 
            active={activeModule === 'categorize'} 
            onClick={() => setActiveModule('categorize')}
            icon={<LayoutGrid size={18} />}
            label="Auto-Categorizer"
          />
          <NavItem 
            active={activeModule === 'proposal'} 
            onClick={() => setActiveModule('proposal')}
            icon={<FileText size={18} />}
            label="B2B Proposal"
          />
          <NavItem 
            active={activeModule === 'impact'} 
            onClick={() => setActiveModule('impact')}
            icon={<BarChart3 size={18} />}
            label="Impact Reporting"
          />
          <NavItem 
            active={activeModule === 'whatsapp'} 
            onClick={() => setActiveModule('whatsapp')}
            icon={<MessageSquare size={18} />}
            label="WhatsApp Bot"
          />
          <div className="h-px bg-black/5 my-4" />
          <NavItem 
            active={activeModule === 'logs'} 
            onClick={() => setActiveModule('logs')}
            icon={<History size={18} />}
            label="AI Logs"
          />
        </nav>

        <div className="mt-auto p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
          <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">System Status</p>
          <div className="flex items-center gap-2 text-emerald-600">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">AI Engine Online</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="ml-64 p-12 max-w-6xl">
        <AnimatePresence mode="wait">
          {activeModule === 'categorize' && (
            <motion.div 
              key="cat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">Auto-Category & Tag Generator</h1>
                <p className="text-black/50 text-lg">Automate cataloging with AI-driven categorization and sustainability tagging.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
                  <form onSubmit={handleCategorize} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Product Name</label>
                      <input 
                        type="text" 
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                        placeholder="e.g. Bamboo Toothbrush"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Description</label>
                      <textarea 
                        value={productDesc}
                        onChange={(e) => setProductDesc(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all h-32"
                        placeholder="Describe the product materials, usage, and benefits..."
                        required
                      />
                    </div>
                    <button 
                      disabled={loading}
                      className="w-full bg-black text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-black/90 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Analyzing...' : <><Plus size={18} /> Generate Catalog Data</>}
                    </button>
                  </form>
                </div>

                <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Database size={120} />
                  </div>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Cpu size={20} className="text-emerald-400" />
                    AI Output Preview
                  </h3>
                  
                  {catResult ? (
                    <div className="space-y-6 relative z-10">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                          <p className="text-xs text-emerald-300 uppercase font-bold mb-1">Primary Category</p>
                          <p className="font-semibold">{catResult.primary_category}</p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                          <p className="text-xs text-emerald-300 uppercase font-bold mb-1">Sub-Category</p>
                          <p className="font-semibold">{catResult.sub_category}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-emerald-300 uppercase font-bold mb-2">SEO Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {catResult.seo_tags.map((tag: string) => (
                            <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-sm border border-white/10">{tag}</span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-emerald-300 uppercase font-bold mb-2">Sustainability Filters</p>
                        <div className="flex flex-wrap gap-2">
                          {catResult.sustainability_filters.map((filter: string) => (
                            <span key={filter} className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 size={14} /> {filter}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-white/40 py-12">
                      <BarChart3 size={48} className="mb-4 opacity-20" />
                      <p>Enter product details to see AI generation</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeModule === 'proposal' && (
            <motion.div 
              key="prop"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">B2B Proposal Generator</h1>
                <p className="text-black/50 text-lg">Create data-driven sustainable product proposals for corporate clients.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
                  <form onSubmit={handleProposal} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Client Name</label>
                        <input 
                          type="text" 
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-black/10 outline-none focus:border-emerald-500"
                          placeholder="e.g. EcoCorp"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Budget ($)</label>
                        <input 
                          type="number" 
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-black/10 outline-none focus:border-emerald-500"
                          placeholder="5000"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Specific Requirements</label>
                      <textarea 
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-black/10 outline-none focus:border-emerald-500 h-32"
                        placeholder="e.g. Focus on plastic-free office supplies for 50 employees..."
                      />
                    </div>
                    <button 
                      disabled={loading}
                      className="w-full bg-emerald-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Generating...' : <><Send size={18} /> Generate Proposal</>}
                    </button>
                  </form>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm overflow-auto max-h-[600px]">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <FileText size={20} className="text-emerald-600" />
                    Generated Proposal
                  </h3>

                  {propResult ? (
                    <div className="space-y-8">
                      <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <h4 className="font-bold text-emerald-900 mb-2">Impact Summary</h4>
                        <p className="text-emerald-800 text-sm leading-relaxed">{propResult.impact_summary}</p>
                      </div>

                      <div>
                        <h4 className="font-bold mb-4 flex items-center justify-between">
                          <span>Product Mix</span>
                          <span className="text-xs font-normal text-black/40 uppercase tracking-widest">Estimated Allocation</span>
                        </h4>
                        <div className="space-y-3">
                          {propResult.product_mix.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-black/5 rounded-xl border border-black/5">
                              <div>
                                <p className="font-semibold">{item.product_name}</p>
                                <p className="text-xs text-black/40">Qty: {item.quantity} × ${item.unit_price}</p>
                              </div>
                              <p className="font-bold">${(item.quantity * item.unit_price).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-black/5">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-bold">Total Estimated Cost</span>
                          <span className="text-2xl font-black text-emerald-600">{propResult.cost_breakdown}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-black/20 py-12">
                      <FileText size={48} className="mb-4 opacity-20" />
                      <p>Generate a proposal to see the breakdown</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeModule === 'impact' && (
            <motion.div 
              key="impact"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight mb-2">Impact Reporting Generator</h1>
                  <p className="text-black/50 text-lg">Module Architecture & Design Strategy</p>
                </div>
                <div className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-bold border border-amber-200">
                  Architecture Outline
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ArchitectureCard 
                  title="Data Logic"
                  content="Uses order line items to calculate 'Carbon Avoided' based on material weight vs traditional plastic counterparts. Logic-based estimation using LCA (Life Cycle Assessment) coefficients."
                />
                <ArchitectureCard 
                  title="AI Integration"
                  content="Gemini processes raw metrics (kg plastic saved, miles reduced) into human-readable impact statements for customer dashboards and marketing reports."
                />
                <ArchitectureCard 
                  title="Persistence"
                  content="Impact reports are stored as JSON blobs in the 'order_impact' table, linked to Order IDs for historical tracking and aggregate sustainability dashboards."
                />
              </div>

              <div className="bg-white p-12 rounded-[40px] border border-black/5 shadow-sm text-center">
                <BarChart3 size={64} className="mx-auto mb-6 text-emerald-600 opacity-20" />
                <h2 className="text-2xl font-bold mb-4">Ready for Implementation</h2>
                <p className="text-black/50 max-w-2xl mx-auto mb-8">
                  This module would integrate with the checkout flow to provide real-time impact feedback to users.
                </p>
                <div className="inline-flex items-center gap-2 text-emerald-600 font-bold group cursor-pointer">
                  View Full Architecture Specs <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          )}

          {activeModule === 'whatsapp' && (
            <motion.div 
              key="wa"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight mb-2">WhatsApp Support Bot</h1>
                  <p className="text-black/50 text-lg">Module Architecture & Design Strategy</p>
                </div>
                <div className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-bold border border-amber-200">
                  Architecture Outline
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ArchitectureCard 
                  title="Webhook Handler"
                  content="Express endpoint listens for Twilio/Meta WhatsApp webhooks. Validates incoming messages and routes to the AI processing layer."
                />
                <ArchitectureCard 
                  title="Contextual RAG"
                  content="AI is grounded with real-time DB access (Order Status, Return Policies). Uses Function Calling to fetch specific order details based on User ID/Phone."
                />
                <ArchitectureCard 
                  title="Escalation Logic"
                  content="Sentiment analysis detects frustration or refund keywords, automatically flagging the conversation for human intervention in the admin dashboard."
                />
              </div>

              <div className="bg-white p-12 rounded-[40px] border border-black/5 shadow-sm text-center">
                <MessageSquare size={64} className="mx-auto mb-6 text-emerald-600 opacity-20" />
                <h2 className="text-2xl font-bold mb-4">Conversational Interface</h2>
                <p className="text-black/50 max-w-2xl mx-auto mb-8">
                  Designed to reduce support tickets by 60% through automated query resolution and structured data retrieval.
                </p>
                <div className="inline-flex items-center gap-2 text-emerald-600 font-bold group cursor-pointer">
                  Explore Bot Flowcharts <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          )}

          {activeModule === 'logs' && (
            <motion.div 
              key="logs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">AI Prompt & Response Logs</h1>
                <p className="text-black/50 text-lg">Transparency and debugging for all AI operations.</p>
              </div>

              <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/5 border-bottom border-black/5">
                      <th className="p-4 text-xs font-bold uppercase tracking-widest text-black/40">Timestamp</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-widest text-black/40">Module</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-widest text-black/40">Prompt Snippet</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-widest text-black/40">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-black/5 hover:bg-black/[0.02] transition-colors">
                        <td className="p-4 text-sm text-black/60">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-bold">{log.module}</span>
                        </td>
                        <td className="p-4 text-sm font-mono truncate max-w-xs">{log.prompt.substring(0, 50)}...</td>
                        <td className="p-4">
                          <button 
                            onClick={() => alert(`Full Response:\n${log.response}`)}
                            className="text-emerald-600 text-sm font-bold hover:underline"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all
        ${active 
          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
          : 'text-black/60 hover:bg-black/5 hover:text-black'}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ArchitectureCard({ title, content }: { title: string, content: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
      <h4 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
        {title}
      </h4>
      <p className="text-sm text-black/60 leading-relaxed">{content}</p>
    </div>
  );
}
