export enum ELogLevel {
    Fatal = "Fatal",
    Error = "Error",
    Warning = "Warning",
    Display = "Display",
    Log = "Log",
    Verbose = "Verbose",
    VeryVerbose = "VeryVerbose",
};

export function parseLogLevel(value: string | null): ELogLevel {
    if (Object.values(ELogLevel).includes(value as ELogLevel)) {
        return value as ELogLevel;
    }
    return ELogLevel.Log; // default value
}

// Function to get the color associated with a log level
export function getLogLevelColor(level: ELogLevel): string {
    const colors: Record<ELogLevel, string> = {
        [ELogLevel.Fatal]: "darkred",
        [ELogLevel.Error]: "red",
        [ELogLevel.Warning]: "yellow",
        [ELogLevel.Display]: "orange",
        [ELogLevel.Log]: "black",
        [ELogLevel.Verbose]: "blue",
        [ELogLevel.VeryVerbose]: "lightblue",
    };

    return colors[level] || "black"; // Default to black if level is not found
}