import { ELogLevel } from "../types/logLevel";
import { getDefaultCategorySettings } from "../utils/categorySettings";

describe("should enable all categories, only show available log levels, and select the lowest present log level using getDefaultCategorySettings", () => {
    const logLevelsArray = Object.values(ELogLevel);

    it("should enable all categories, only show available log levels, and select the lowest present log level", () => {
        const log = [
            "LogTemp: Error: Something broke!",
            "LogTemp: Warning: Be careful!",
            "LogTemp: Verbose: Details...",
            "LogTemp: Verbose: More details...",
            "LogTemp: Log: Just info",
            "LogStreaming: Display: Streaming started",
            "LogStreaming: Warning: Streaming warning",
            "LogStreaming: Display: Streaming running",
            "LogStreaming: Display: Streaming finished",
            "LogStreaming: Display: Streaming done",
        ].join("\n");
        const { categorySettings, categoryLevelPresence } = getDefaultCategorySettings(log, logLevelsArray);
        // All categories enabled
        expect(categorySettings["LogTemp"].enabled).toBe(true);
        expect(categorySettings["LogStreaming"].enabled).toBe(true);
        // Only available log levels are enabled
        expect(Array.from(categoryLevelPresence["LogTemp"]).sort()).toEqual([
            ELogLevel.Error,
            ELogLevel.Warning,
            ELogLevel.Verbose,
            ELogLevel.Log,
        ].sort());
        expect(Array.from(categoryLevelPresence["LogStreaming"]).sort()).toEqual([
            ELogLevel.Display,
            ELogLevel.Warning,
        ].sort());
        // Default selected is the lowest present
        expect(categorySettings["LogTemp"].minLevel).toBe(ELogLevel.Verbose);
        expect(categorySettings["LogStreaming"].minLevel).toBe(ELogLevel.Display);
    });
});
