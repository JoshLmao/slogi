import { ELogLevel } from "../types/logLevel";
import { parseLogLines, parseLogCategories } from "./logParser";

export interface CategorySettings {
    [category: string]: { enabled: boolean; minLevel: ELogLevel };
}

export interface CategoryLevelPresence {
    [category: string]: Set<string>;
}

export function getCategoryLevelPresence(parsedLogLines: ReturnType<typeof parseLogLines>): CategoryLevelPresence {
    const presence: CategoryLevelPresence = {};
    parsedLogLines.forEach((entry) => {
        if (!presence[entry.category]) presence[entry.category] = new Set();
        presence[entry.category].add(entry.level);
    });
    return presence;
}

export function getDefaultCategorySettings(
    logContent: string,
    logLevelsArray: string[]
): { categorySettings: CategorySettings; categoryLevelPresence: CategoryLevelPresence } {
    const parsedLogLines = parseLogLines(logContent);
    const logCategories = parseLogCategories(logContent);
    const categoryLevelPresence = getCategoryLevelPresence(parsedLogLines);
    const newSettings: CategorySettings = {};
    Array.from(logCategories.keys()).forEach((cat) => {
        const presentLevels = categoryLevelPresence[cat];
        let minLevel = ELogLevel.Log;
        if (presentLevels && presentLevels.size > 0) {
            let maxIdx = 0;
            logLevelsArray.forEach((level, idx) => {
                if (presentLevels.has(level) && idx > maxIdx) {
                    maxIdx = idx;
                }
            });
            minLevel = maxIdx < logLevelsArray.length ? (logLevelsArray[maxIdx] as ELogLevel) : ELogLevel.Log;
        }
        newSettings[cat] = {
            enabled: true,
            minLevel,
        };
    });
    return { categorySettings: newSettings, categoryLevelPresence };
}
