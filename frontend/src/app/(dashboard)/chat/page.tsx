"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Hash, Lock, Shield, User, Paperclip, ShieldAlert, Bot, ShieldCheck, RefreshCw, Database, Zap, Radar, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

interface Message {
    id: number;
    user: string;
    type: 'system' | 'user' | 'ai' | 'object';
    text: string;
    time: string;
    meta?: string;
}

const INITIAL_HISTORIES: Record<string, Message[]> = {
    '# incident-response': [
        { id: 1, user: 'Global Command', type: 'system', text: 'Channel secure. Encryption standard AES-256 enabled.', time: '10:00' },
        { id: 2, user: 'SOC Analyst #4', type: 'user', text: 'I just pushed a new intel graph for the target network. Take a look.', time: '10:02' },
        { id: 3, user: 'Lead Investigator', type: 'user', text: 'Confirmed. Linking to the Dossier now.', time: '10:04' },
        { id: 4, user: 'Sentinel AI', type: 'ai', text: 'Pattern correlation complete. Source IP 185.255.35.226 is confirmed as a known MIRAI variant controller.', time: '10:10' },
        { id: 5, user: 'Security Event', type: 'object', text: 'Critical Alert: Massive DDoS Arc Detected', meta: 'Source: 185.255.35.226 | Target: US-FIN-HUB', time: '10:10' },
        { id: 6, user: 'Protocol Debug', type: 'system', text: 'Protocol Simulation active. Use "/ping [IP]" for ICMP or "/smtp [Email]" for Mail Relay tests.', time: '10:11' },
    ],
    '# global-ops': [
        { id: 101, user: 'Global Command', type: 'system', text: 'Global Operation Center Linked.', time: '09:00' },
        { id: 102, user: 'Admin', type: 'user', text: 'All stations reporting nominal.', time: '09:05' },
    ],
    '# red-team-alpha': [
        { id: 201, user: 'Shadow-1', type: 'user', text: 'Perimeter breached at South Node.', time: '23:45' },
    ],
    '# threat-intel': [
        { id: 301, user: 'Intel-Bot', type: 'system', text: 'Daily threat brief generated.', time: '08:00' },
    ],
    '# ai-reasoning': [
        { id: 401, user: 'Sentinel AI', type: 'ai', text: 'Neural processing active. Ready for complex reasoning tasks.', time: '00:01' },
    ],
    'Sentinel AI': [
        { id: 501, user: 'Sentinel AI', type: 'ai', text: 'Private neural link established. How can I assist with your investigation?', time: '10:15' },
    ],
    'Lead Investigator': [
        { id: 601, user: 'Lead Investigator', type: 'user', text: 'I need your eyes on the latest payload extraction.', time: '10:20' },
    ],
    'SOC Analyst #4': [
        { id: 701, user: 'SOC Analyst #4', type: 'user', text: 'Hey, did you see the anomaly in sector 7?', time: '10:25' },
    ]
};

export default function ChatPage() {
  const [activeChannel, setActiveChannel] = useState('# incident-response');
  const [isTyping, setIsTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [histories, setHistories] = useState<Record<string, Message[]>>(INITIAL_HISTORIES);
  const [input, setInput] = useState('');

  const messages = histories[activeChannel] || [];

  const addMessage = (channel: string, msg: Message) => {
    setHistories(prev => ({
        ...prev,
        [channel]: [...(prev[channel] || []), msg]
    }));
  };

  const sendMsg = async () => {
    if(!input.trim()) return;
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const newMsg: Message = { id: Date.now(), user: 'You', type: 'user', text: input, time };
    
    addMessage(activeChannel, newMsg);
    const userQuery = input;
    setInput('');

    // SMTP PROTOCOL SIMULATION (/smtp command)
    if (userQuery.toLowerCase().startsWith('/smtp')) {
       setIsTyping(true);
       const recipient = userQuery.split(' ')[1] || 'admin@bouclier.local';
       
       const smtpSteps = [
          { msg: "220 smtp.bouclier.local ESMTP Postfix", delay: 500 },
          { msg: `HELO sentinel.node`, delay: 1000 },
          { msg: "250 Hello sentinel.node, pleased to meet you", delay: 1500 },
          { msg: "MAIL FROM:<ai@sentinel.local>", delay: 2000 },
          { msg: "250 2.1.0 Ok", delay: 2500 },
          { msg: `RCPT TO:<${recipient}>`, delay: 3000 },
          { msg: "250 2.1.5 Ok", delay: 3500 },
          { msg: "DATA", delay: 4000 },
          { msg: "354 End data with <CR><LF>.<CR><LF>", delay: 4500 },
          { msg: `Subject: Threat Intelligence Alert\nMessage: Anomalous activity detected in sector 7.\n.`, delay: 5500 },
          { msg: "250 2.0.0 Ok: queued as 4FA923B1", delay: 6000 },
          { msg: "QUIT", delay: 6500 },
          { msg: "221 2.0.0 Bye", delay: 7000 }
       ];

       smtpSteps.forEach((step, index) => {
          setTimeout(() => {
             if (index === smtpSteps.length - 1) setIsTyping(false);
             addMessage(activeChannel, {
                id: Date.now() + index + 2,
                user: 'SMTP Protocol',
                type: 'system',
                text: step.msg,
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
             });
             
             if (step.msg.includes("queued")) {
                window.dispatchEvent(new CustomEvent('notify', { 
                   detail: { message: `SMTP Relay Successful: Message queued for ${recipient}`, type: 'success' } 
                }));
             }
          }, step.delay);
       });
       return;
    }

    // ICMP PROTOCOL SIMULATION (/ping command)
    if (userQuery.toLowerCase().startsWith('/ping')) {
       setIsTyping(true);
       const target = userQuery.split(' ')[1] || '127.0.0.1';
       
       setTimeout(() => {
          setIsTyping(false);
          const rtt = Math.floor(Math.random() * 30) + 10;
          addMessage(activeChannel, {
             id: Date.now() + 1,
             user: 'ICMP Protocol',
             type: 'system',
             text: `PING ${target} (ICMP): 64 bytes from ${target}: icmp_seq=1 ttl=64 time=${rtt}ms`,
             time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          });
          
          window.dispatchEvent(new CustomEvent('notify', { 
             detail: { message: `ICMP Echo Response from ${target}: ${rtt}ms`, type: 'info' } 
          }));
       }, 1500);
       return;
    }

    // AI Response logic (if channel is AI or contact is AI or mentions sentinel)
    if (activeChannel === '# ai-reasoning' || activeChannel === 'Sentinel AI' || userQuery.toLowerCase().includes('sentinel')) {
       setIsTyping(true);
       try {
           const data = await apiClient<any>("/api/ai-reasoning/ask", {
              method: "POST",
              json: { query: userQuery }
           });
          
          setIsTyping(false);
          addMessage(activeChannel, {
             id: Date.now() + 1,
             user: 'Sentinel AI',
             type: 'ai',
             text: data.response || "Neural link stable. Analysis complete.",
             time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          });
       } catch (err) {
          setIsTyping(false);
          addMessage(activeChannel, {
             id: Date.now() + 1,
             user: 'System',
             type: 'system',
             text: 'Neural link interrupted. Retrying encryption...',
             time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          });
       }
    } else {
        if (activeChannel !== '# ai-reasoning' && !activeChannel.startsWith('#')) {
            setIsTyping(true);
            apiClient("/api/sentinel/chat", {
                method: "POST",
                json: { message: userQuery, channel: activeChannel },
            }).then(data => {
                setIsTyping(false);
                addMessage(activeChannel, {
                    id: Date.now() + 50,
                    user: "Sentinel AI",
                    type: 'sentinel',
                    text: data.response || data.message || "Message received and logged.",
                    time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                });
            }).catch(() => {
                setIsTyping(false);
                addMessage(activeChannel, {
                    id: Date.now() + 50,
                    user: "System",
                    type: 'system',
                    text: "Message sent. No response available.",
                    time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                });
            });
        }
    }
  }

  const handleExportTranscript = () => {
    const transcript = messages.map(m => `[${m.time}] ${m.user}: ${m.text}`).join('\n');
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_transcript_${activeChannel.replace('# ', '')}.txt`;
    a.click();
    setShowMenu(false);
  };

  const handleAudit = () => {
    window.dispatchEvent(new CustomEvent('notify', { 
       detail: { message: `Audit initiated for ${activeChannel}. Integrity verified by Sentinel AI.`, type: 'info' } 
    }));
    setShowMenu(false);
  };

  const handleReEncrypt = () => {
     setIsTyping(true);
     addMessage(activeChannel, {
        id: Date.now(),
        user: 'System',
        type: 'system',
        text: 'Re-encrypting neural tunnel... Rotating keys...',
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
     });
     setTimeout(() => {
        setIsTyping(false);
        window.dispatchEvent(new CustomEvent('notify', { 
           detail: { message: 'Neural re-encryption complete. AES-512 standard applied.', type: 'success' } 
        }));
     }, 3000);
     setShowMenu(false);
  };

  const triggerUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        addMessage(activeChannel, {
          id: Date.now(),
          user: 'You',
          type: 'system',
          text: `Shared file: ${file.name} (${(file.size / 1024).toFixed(1)} KB) - Scanning for malware...`,
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        });
      }
    };
    input.click();
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#050505] overflow-hidden">
      {/* Channels Sidebar */}
      <div className="w-80 border-r border-white/5 bg-[#02050A] flex flex-col p-6 space-y-8">
        <div>
           <div className="flex items-center justify-between mb-8">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Neural_Comms</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
           </div>
           
           <div className="space-y-2">
              {['# global-ops', '# red-team-alpha', '# incident-response', '# threat-intel', '# ai-reasoning'].map((chan) => (
                <div 
                  key={chan} 
                  onClick={() => setActiveChannel(chan)}
                  className={cn(
                    "px-5 py-4 rounded-2xl text-[11px] font-mono font-bold cursor-pointer transition-all flex items-center justify-between group",
                    activeChannel === chan 
                      ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]" 
                      : "text-slate-600 hover:text-white hover:bg-white/5 border border-transparent"
                  )}
                >
                   <span className="flex items-center gap-3">
                      <Hash className={cn("w-3.5 h-3.5", activeChannel === chan ? "text-blue-400" : "text-slate-700")} />
                      {chan}
                   </span>
                   {chan === '# incident-response' && (
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                   )}
                </div>
              ))}
           </div>
        </div>

        <div className="pt-8 border-t border-white/5">
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6 block">Direct_Messages</span>
           <div className="space-y-4">
              {['Sentinel AI', 'Lead Investigator', 'SOC Analyst #4'].map(user => (
                 <div 
                    key={user} 
                    onClick={() => setActiveChannel(user)}
                    className={cn(
                        "flex items-center gap-4 group cursor-pointer p-2 rounded-2xl transition-all",
                        activeChannel === user ? "bg-white/5 border border-white/10" : "hover:bg-white/5"
                    )}
                >
                    <div className={cn(
                        "w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all",
                        activeChannel === user ? "border-blue-500/50" : "group-hover:border-blue-500/50"
                    )}>
                       <User className={cn("w-4 h-4 transition-colors", activeChannel === user ? "text-blue-400" : "text-slate-500 group-hover:text-blue-400")} />
                    </div>
                    <div className="flex-1">
                       <p className={cn("text-[11px] font-black transition-colors", activeChannel === user ? "text-blue-400" : "text-white group-hover:text-blue-400")}>{user}</p>
                       <p className="text-[9px] font-mono text-slate-600">Secure Line</p>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
              style={{ backgroundImage: 'linear-gradient(#2979ff 1px, transparent 1px), linear-gradient(90deg, #2979ff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
         
         {/* Chat Header */}
         <div className="h-20 border-b border-white/5 bg-black/60 backdrop-blur-xl flex items-center justify-between px-10 relative z-10">
            <div className="flex items-center gap-6">
               <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                  {activeChannel.startsWith('#') ? <Hash className="w-6 h-6 text-blue-500" /> : <User className="w-6 h-6 text-blue-500" />}
               </div>
               <div className="group relative">
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">{activeChannel}</h2>
                  <div className="flex items-center gap-3 cursor-help">
                     <Lock className="w-3 h-3 text-emerald-500" />
                     <span className="text-[9px] font-black text-emerald-500/70 uppercase tracking-widest">Quantum_Encryption_Active // AES-256</span>
                  </div>
                  {/* Security Tooltip */}
                  <div className="absolute top-full left-0 mt-4 p-5 bg-[#0a0a0f] border border-emerald-500/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-[0_20px_50px_rgba(16,185,129,0.15)] w-72 z-50">
                     <div className="flex items-center gap-3 text-emerald-500 mb-3">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Identity_Verified</span>
                     </div>
                     <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">Encryption tunnel established via Sentinel-Node-4. Zero-knowledge protocol active.</p>
                     <div className="mt-4 pt-4 border-t border-white/5 text-[8px] font-mono text-slate-600 truncate">UUID: {activeChannel}-SEC-9482-X</div>
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-6 relative">
               <div className="flex -space-x-3">
                  {['Sentinel', 'Lead', 'Analyst', 'Admin'].map((u, i) => (
                     <div key={i} title={u} className="w-10 h-10 rounded-2xl bg-slate-800 border-4 border-[#050505] flex items-center justify-center cursor-pointer hover:translate-y-[-4px] hover:border-blue-500 transition-all">
                        <User className="w-4 h-4 text-slate-400" />
                     </div>
                  ))}
               </div>
               <div className="h-10 w-px bg-white/5 mx-2" />
               <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className={cn(
                    "p-3 rounded-2xl transition-all border",
                    showMenu ? "bg-white/10 border-white/10 text-white" : "bg-white/5 border-white/5 text-slate-500 hover:text-white"
                  )}
               >
                  <MoreVertical className="w-5 h-5" />
               </button>

               {/* Tactical Dropdown Menu */}
               <AnimatePresence>
                  {showMenu && (
                     <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-4 w-64 bg-[#0a0a0f] border border-white/10 rounded-[32px] p-3 shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden z-[100]"
                     >
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-600/50" />
                        {[
                           { label: 'Clear History', icon: RefreshCw, color: 'text-slate-400', action: () => setHistories(prev => ({...prev, [activeChannel]: []})) },
                           { label: 'Export Transcript', icon: Database, color: 'text-blue-400', action: handleExportTranscript },
                           { label: 'Channel Audit', icon: Shield, color: 'text-emerald-400', action: handleAudit },
                           { label: 'Force Re-Encrypt', icon: Zap, color: 'text-purple-400', action: handleReEncrypt },
                        ].map((item, i) => (
                           <button 
                              key={i}
                              onClick={() => {
                                 setShowMenu(false);
                                 item.action();
                              }}
                              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-white/5 transition-all group"
                           >
                              <item.icon className={cn("w-4 h-4", item.color)} />
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-white transition-colors">{item.label}</span>
                           </button>
                        ))}
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
         </div>

         {/* Chat Messages */}
         <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar relative z-10">
            {messages.map((msg, i) => (
               <motion.div 
                 initial={{ opacity: 0, x: msg.user === 'You' ? 20 : -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 key={msg.id} 
                 className={cn("flex flex-col max-w-[70%]", msg.user === 'You' ? "ml-auto items-end" : "items-start")}
               >
                  <div className="flex items-center gap-3 mb-2 px-2">
                     <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", msg.user === 'You' ? "text-blue-400" : "text-white")}>{msg.user}</span>
                     <span className="text-[9px] font-mono text-slate-600">{msg.time}</span>
                  </div>
                  
                  {msg.type === 'system' && (
                     <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-3 rounded-[24px] rounded-tl-none text-[11px] font-mono flex items-center gap-3 shadow-2xl shadow-emerald-500/5">
                        <Shield className="w-4 h-4" /> {msg.text}
                     </div>
                  )}
                  
                  {msg.type === 'ai' && (
                     <div className="bg-purple-600/10 border border-purple-500/20 text-purple-100 px-6 py-4 rounded-[32px] rounded-tl-none text-[12px] leading-relaxed shadow-2xl shadow-purple-500/10 flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/30">
                           <Bot className="w-4 h-4 text-purple-400" />
                        </div>
                        <p className="italic font-medium">{msg.text}</p>
                     </div>
                  )}

                  {msg.type === 'user' && (
                     <div className={cn(
                        "px-6 py-4 rounded-[32px] text-[13px] leading-relaxed shadow-2xl",
                        msg.user === 'You' ? "bg-blue-600 text-white rounded-tr-none shadow-blue-500/20" : "bg-[#111111] text-slate-200 border border-white/10 rounded-tl-none"
                     )}>
                        {msg.text}
                     </div>
                  )}
                  
                  {msg.type === 'object' && (
                     <div className="bg-[#0A0505] border border-red-500/30 text-red-100 p-6 rounded-[32px] rounded-tl-none shadow-[0_20px_50px_rgba(220,38,38,0.15)] w-full">
                        <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center gap-3 text-red-500">
                              <ShieldAlert className="w-5 h-5 animate-pulse" />
                              <span className="text-[11px] font-black uppercase tracking-[0.4em] italic">Forensic_Payload</span>
                           </div>
                           <button className="text-[9px] font-black text-red-500/50 uppercase hover:text-red-500 transition-colors">Pivot_to_map →</button>
                        </div>
                        <div className="bg-red-500/5 p-4 rounded-2xl border border-red-500/10 space-y-2">
                           <p className="text-[14px] font-black text-white italic">{msg.text}</p>
                           <p className="text-[10px] font-mono text-red-400/70">{msg.meta}</p>
                        </div>
                     </div>
                  )}
               </motion.div>
            ))}
            {isTyping && (
               <div className="flex items-center gap-3 text-slate-500 italic text-[11px] font-mono px-4">
                  <Bot className="w-4 h-4 animate-bounce" /> Sentinel AI is analyzing...
               </div>
            )}
         </div>

         {/* Chat Input */}
         <div className="p-8 bg-black/60 backdrop-blur-xl border-t border-white/5 relative z-10">
            <div className="max-w-4xl mx-auto h-16 bg-[#111111] border border-white/10 rounded-3xl flex items-center px-6 focus-within:border-blue-500/50 focus-within:shadow-[0_0_30px_rgba(37,99,235,0.15)] transition-all">
               <button 
                  onClick={triggerUpload}
                  className="p-3 text-slate-500 hover:text-white transition-colors"
               >
                  <Paperclip className="w-5 h-5" />
               </button>
               <input 
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMsg()}
                  placeholder={`Send secure message to ${activeChannel}...`}
                  className="flex-1 bg-transparent px-6 py-2 text-[14px] text-white focus:outline-none placeholder:text-slate-700 italic font-medium"
               />
               <button 
                  onClick={sendMsg}
                  className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95"
               >
                  <Send className="w-5 h-5" />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
