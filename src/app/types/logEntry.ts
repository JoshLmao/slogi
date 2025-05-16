
export interface ParsedLogEntry {
    line: string;
    category: string;
    level: string;
    multiline?: string[];
}