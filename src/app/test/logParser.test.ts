import { describe } from "node:test";
import { parseLogLines, parseLogCategories } from "../utils/logParser";
import { LogCategory } from "../types/logCategory";

describe("parseLogLines", () => {
    it("parses a line with no category", () => {
        const log = "Log file open, 01/15/25 18:39:19";
        const result = parseLogLines(log);
        expect(result).toEqual([
            {
                line: log,
                category: LogCategory.NoLogCategory,
                level: "Log",
            },
        ]);
    });

    it("parses a line with a category but no level", () => {
        const log = "SourceControl: Revision control is disabled";
        const result = parseLogLines(log);
        expect(result).toEqual([
            {
                line: log,
                category: "SourceControl",
                level: "Log",
            },
        ]);
    });

    it("parses a line with category and level", () => {
        const log = "LogDirectoryWatcher: Display: Something happened";
        const result = parseLogLines(log);
        expect(result).toEqual([
            {
                line: log,
                category: "LogDirectoryWatcher",
                level: "Display",
            },
        ]);
    });

    it("parses a line with date/time, category, and level", () => {
        const log = "[2025.01.15-18.39.40:956][  0]LogDirectoryWatcher: Display: CreateFile failed";
        const result = parseLogLines(log);
        expect(result).toEqual([
            {
                line: log,
                category: "LogDirectoryWatcher",
                level: "Display",
            },
        ]);
    });

    it("parses multiline logs and attaches them to the previous entry", () => {
        const log = [
            "[2025.01.15-18.39.28:852][  0]LogConsoleResponse: User settings details:",
            "- Resolution: 0x0@120.0Hz at 0.0% 3D Resolution",
            "- Fullscreen mode: WindowedFullscreen, VSync: 0",
            "- Motion blur: 0, RHIT: 0",
        ].join("\n");
        const result = parseLogLines(log);
        expect(result).toEqual([
            {
                line: "[2025.01.15-18.39.28:852][  0]LogConsoleResponse: User settings details:",
                category: "LogConsoleResponse",
                level: "Log",
                multiline: [
                    "- Resolution: 0x0@120.0Hz at 0.0% 3D Resolution",
                    "- Fullscreen mode: WindowedFullscreen, VSync: 0",
                    "- Motion blur: 0, RHIT: 0",
                ],
            },
        ]);
    });

    it("parses multiple log entries and multiline blocks", () => {
        const log = [
            "[2025.01.15-18.39.28:852][  0]LogConsoleResponse: User settings details:",
            "- Resolution: 0x0@120.0Hz at 0.0% 3D Resolution",
            "[2025.01.15-18.39.29:000][  0]SourceControl: Revision control is disabled",
        ].join("\n");
        const result = parseLogLines(log);
        expect(result).toEqual([
            {
                line: "[2025.01.15-18.39.28:852][  0]LogConsoleResponse: User settings details:",
                category: "LogConsoleResponse",
                level: "Log",
                multiline: [
                    "- Resolution: 0x0@120.0Hz at 0.0% 3D Resolution",
                ],
            },
            {
                line: "[2025.01.15-18.39.29:000][  0]SourceControl: Revision control is disabled",
                category: "SourceControl",
                level: "Log",
            },
        ]);
    });

    it("assigns NoLogCategory and Log for lines with neither", () => {
        const log = "Some random text";
        const result = parseLogLines(log);
        expect(result).toEqual([
            {
                line: log,
                category: LogCategory.NoLogCategory,
                level: "Log",
            },
        ]);
    });
});

describe("parseLogCategories", () => {
    it("parses all unique categories and sorts them", () => {
        const log = [
            "LogA: Something",
            "LogB: Something else",
            "SourceControl: Revision control is disabled",
            "NoCategoryLine",
        ].join("\n");
        const result = parseLogCategories(log);
        expect(Array.from(result.keys())).toEqual([
            "LogA",
            "LogB",
            LogCategory.NoLogCategory,
            "SourceControl",
        ].sort());
    });

    it("assigns NoLogCategory for lines with no category", () => {
        const log = [
            "Just some text",
            "Another line",
        ].join("\n");
        const result = parseLogCategories(log);
        expect(Array.from(result.keys())).toEqual([LogCategory.NoLogCategory]);
    });
});
