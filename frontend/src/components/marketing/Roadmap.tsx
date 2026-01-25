import { Calendar, GitCommit } from "lucide-react";

const roadmapItems = [
    { label: "Q1 2026", task: "Multi-cluster Distributed Ingestion", status: "In Development" },
    { label: "Q2 2026", task: "Native EDR Agent Integration", status: "Planned" },
    { label: "Q2 2026", task: "Custom Detection Rule Engine", status: "Planned" },
    { label: "Q3 2026", task: "Automated Evidence Collection", status: "Post-MVP" },
    { label: "Q4 2026", task: "Shared Intel Marketplace", status: "Vision" },
];

export default function Roadmap() {
    return (
        <section className="py-32 bg-white relative">
            <div className="container mx-auto">
                <h2 className="text-4xl font-black text-nokod-black mb-20 tracking-tighter">Roadmap <br /><span className="text-slate-400">(Coming next)</span></h2>

                <div className="grid gap-4">
                    {roadmapItems.map((item, i) => (
                        <div key={i} className="flex flex-col md:flex-row gap-6 md:items-center group p-8 rounded-4xl bg-[#F8FAFC] border border-transparent hover:border-slate-100 hover:bg-white transition-all hover:shadow-xl hover:shadow-slate-100">
                            <div className="md:w-32">
                                <span className="text-xs font-black text-nokod-purple uppercase tracking-[0.2em]">{item.label}</span>
                            </div>

                            <div className="flex-1">
                                <h4 className="text-xl font-bold text-nokod-black">{item.task}</h4>
                            </div>

                            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-100">
                                <div className={`h-1.5 w-1.5 rounded-full ${item.status === 'In Development' ? 'bg-nokod-purple animate-pulse' : 'bg-slate-300'}`} />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
