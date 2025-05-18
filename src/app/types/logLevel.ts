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
