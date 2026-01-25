"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Clock, Server, Globe, User, AlertTriangle } from "lucide-react";

interface SearchResult {
    id: string;
    type: "ip" | "host" | "user" | "event" | "country";
    label: string;
    sublabel?: string;
    icon?: React.ReactNode;
    severity?: "critical" | "high" | "medium";
}

interface SearchAutocompleteProps {
    placeholder?: string;
    onSearch?: (query: string) => void;
    onSelect?: (result: SearchResult) => void;
    recentSearches?: string[];
}

export default function SearchAutocomplete({
    placeholder = "Rechercher hosts, IPs, users...",
    onSearch,
    onSelect,
    recentSearches = [],
}: SearchAutocompleteProps) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005";
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Update results when query changes
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            setIsOpen(false);
            setSelectedIndex(-1);
            return;
        }

        const controller = new AbortController();

        const fetchResults = async () => {
            setIsLoading(true);
            setApiError(null);
            try {
                const res = await fetch(`${apiBase}/api/search?query=${encodeURIComponent(query)}`, {
                    signal: controller.signal
                });
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                const data = await res.json();
                const list = Array.isArray(data) ? data : [];
                setResults(list.slice(0, 8));
                setIsOpen(true);
                setSelectedIndex(-1);
            } catch (err) {
                if ((err as any)?.name === "AbortError") {
                    return;
                }
                setApiError("Search unavailable");
                setResults([]);
                setIsOpen(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
        return () => controller.abort();
    }, [apiBase, query]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, -1));
        } else if (e.key === "Enter") {
            if (selectedIndex >= 0 && results[selectedIndex]) {
                handleSelect(results[selectedIndex]);
            } else if (query) {
                onSearch?.(query);
                setIsOpen(false);
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
            inputRef.current?.blur();
        }
    };

    const handleSelect = (result: SearchResult) => {
        setQuery(result.label);
        setIsOpen(false);
        onSelect?.(result);
    };

    const getIcon = (type: SearchResult["type"], severity?: string) => {
        switch (type) {
            case "ip":
                return <Server className={`h-4 w-4 ${severity === "critical" ? "text-red-400" : "text-cyan-400"}`} />;
            case "host":
                return <Server className="h-4 w-4 text-purple-400" />;
            case "user":
                return <User className="h-4 w-4 text-green-400" />;
            case "event":
                return <AlertTriangle className={`h-4 w-4 ${severity === "critical" ? "text-red-400" : severity === "high" ? "text-orange-400" : "text-yellow-400"}`} />;
            case "country":
                return <Globe className="h-4 w-4 text-blue-400" />;
            default:
                return <Search className="h-4 w-4 text-slate-400" />;
        }
    };

    return (
        <div ref={containerRef} className="relative w-full max-w-md">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg pl-10 pr-10 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery("");
                            setResults([]);
                            inputRef.current?.focus();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-slate-800 bg-slate-900/95 shadow-2xl backdrop-blur-sm overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Results */}
                    {isLoading ? (
                        <div className="px-3 py-4 text-center text-sm text-slate-500">
                            Recherche en cours...
                        </div>
                    ) : apiError ? (
                        <div className="px-3 py-4 text-center text-sm text-red-400">
                            {apiError}
                        </div>
                    ) : results.length > 0 ? (
                        <div className="py-1">
                            {results.map((result, index) => (
                                <button
                                    key={result.id}
                                    onClick={() => handleSelect(result)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-left transition ${index === selectedIndex ? "bg-slate-800" : "hover:bg-slate-800/50"
                                        }`}
                                >
                                    {getIcon(result.type, result.severity)}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-white truncate">{result.label}</div>
                                        {result.sublabel && (
                                            <div className="text-[10px] text-slate-500 truncate">{result.sublabel}</div>
                                        )}
                                    </div>
                                    {result.severity && (
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${result.severity === "critical" ? "bg-red-500/20 text-red-300" :
                                                result.severity === "high" ? "bg-orange-500/20 text-orange-300" :
                                                    "bg-yellow-500/20 text-yellow-300"
                                            }`}>
                                            {result.severity === "critical" ? "Critique" : result.severity === "high" ? "Élevé" : "Moyen"}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : query.length >= 2 ? (
                        <div className="px-3 py-4 text-center text-sm text-slate-500">
                            Aucun résultat pour "{query}"
                        </div>
                    ) : null}

                    {/* Recent Searches */}
                    {query.length < 2 && recentSearches.length > 0 && (
                        <div className="border-t border-slate-800">
                            <div className="px-3 py-2 text-[10px] text-slate-500 uppercase tracking-wider">
                                Recherches récentes
                            </div>
                            {recentSearches.map((search, index) => (
                                <button
                                    key={index}
                                    onClick={() => setQuery(search)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-800/50 transition"
                                >
                                    <Clock className="h-3 w-3 text-slate-600" />
                                    <span className="text-sm text-slate-400">{search}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
