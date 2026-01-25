export interface ToolInputField {
    key: "target" | "file_path" | "domain" | "duration" | "target_url" | "method" | "payload_type" | "target_host" | "wordlist" | "interface";
    label: string;
    placeholder?: string;
    required?: boolean;
    type?: "text" | "number" | "path";
}

export interface Tool {
    id: string;
    name: string;
    description: string;
    category: string;
    risk: "low" | "medium" | "high";
    status: "ready" | "blocked" | "missing";
    blocked_reason?: string;
    inputs?: ToolInputField[];
    tags?: string[];
    version?: string;
}

export interface LogEntry {
    timestamp: number;
    level: "info" | "warning" | "error" | "success";
    message: string;
}
