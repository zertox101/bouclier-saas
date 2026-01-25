'use client';

import { useState } from 'react';
import { Search, Command } from 'lucide-react';

export function DocsSearch() {
    const [query, setQuery] = useState('');

    return (
        <div className="relative group max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-text-3 group-focus-within:text-p-400 transition-colors" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-12 py-2 bg-bg-2 border border-border-2 rounded-xl text-sm text-text-1 placeholder-text-3 focus:outline-none focus:ring-2 focus:ring-p-500/20 focus:border-p-500 transition-all hover:border-border-1"
                placeholder="Search documentation..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-border-2 bg-bg-1 text-[10px] text-text-3 font-mono">
                    <Command className="h-2.5 w-2.5" />
                    K
                </kbd>
            </div>
        </div>
    );
}
