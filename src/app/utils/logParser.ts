import { ParsedLogEntry } from "../types/logEntry";

// Parse log lines to extract category and level, supporting multiline logs and flexible category names
export function parseLogLines(content: string): ParsedLogEntry[] {
    const lines = content.split("\n");
    const entries: ParsedLogEntry[] = [];
    let lastEntry: ParsedLogEntry | null = null;

    // Regex patterns
    const dateTimePattern = /^\[[^\]]+\]\[\s*\d+\]\s*/;
    const categoryPattern = /^([A-Za-z0-9_]+):/; // e.g., LogConsoleResponse: or SourceControl:
    const levelPattern =
        /\b(Fatal|Error|Warning|Display|Log|Verbose|VeryVerbose):/;

    lines.forEach((line) => {
        // Multiline: indented or dash-prefixed lines (not a new log entry)
        if (/^\s+|^- /.test(line) && lastEntry) {
            if (!lastEntry.multiline) lastEntry.multiline = [];
            lastEntry.multiline.push(line);
            return;
        }

        // Remove date/time if present
        const rest = line.replace(dateTimePattern, "");

        // Try to extract category (first word ending with a colon)
        const categoryMatch = rest.match(categoryPattern);
        let category = categoryMatch ? categoryMatch[1] : null;

        // Try to extract level (must be one of the known levels, with colon)
        const levelMatch = rest.match(levelPattern);
        let level = levelMatch ? levelMatch[1] : null;

        // If no category, assign "NoLogCategory"
        if (!category) category = "NoLogCategory";
        // If no level, assign "Log"
        if (!level) level = "Log";
        // fix tests but need some change to test pr

        const entry: ParsedLogEntry = { line, category, level };
        entries.push(entry);
        lastEntry = entry;
    });
    return entries;
}

// Function to parse log categories from the file content, supporting categories that don't start with "Log"
export function parseLogCategories(content: string): Map<string, string> {
    const lines = content.split("\n");
    const categories = new Map<string, string>();
    const dateTimePattern = /^\[[^\]]+\]\[\s*\d+\]\s*/;
    const categoryPattern = /^([A-Za-z0-9_]+):/;
    lines.forEach((line) => {
        // Remove date/time if present
        const rest = line.replace(dateTimePattern, "");
        const categoryMatch = rest.match(categoryPattern);
        const category = categoryMatch ? categoryMatch[1] : "NoLogCategory";
        if (!categories.has(category)) {
            categories.set(category, category);
        }
    });
    return new Map(
        [...categories.entries()].sort(([a], [b]) => a.localeCompare(b))
    );
}
