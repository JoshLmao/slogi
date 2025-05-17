"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Title,
    Text,
    Button,
    Textarea,
    Group,
    FileButton,
    Drawer,
} from "@mantine/core";
import { GitHub, RotateCcw, Sliders, Terminal } from "react-feather";
import { useDisclosure } from "@mantine/hooks";
import { ELogLevel, parseLogLevel } from "../types/logLevel";
import { parseLogLines, parseLogCategories } from "../utils/logParser";
import { handleFileParsing } from "../utils/fileParser";
import {
    getDefaultCategorySettings,
    getCategoryLevelPresence,
} from "../utils/categorySettings";
import LogOptionsDrawer from "./LogOptionsDrawer";

export default function Landing() {
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [opened, { open, close }] = useDisclosure(false);

    const logLevelsArray = Object.values(ELogLevel);

    // Per-category state: { [category]: { enabled: boolean, minLevel: string } }
    const [categorySettings, setCategorySettings] = useState<{
        [category: string]: { enabled: boolean; minLevel: ELogLevel };
    }>({});

    const handleFile = async (file: File | null) => {
        const result = await handleFileParsing(file);
        setFileContent(result.content);
        setError(result.error);
    };

    // New: Clear all state and start over
    const handleStartOver = () => {
        setFileContent(null);
        setError(null);
        setCategorySettings({});
    };

    // Memoized parsed log lines
    const parsedLogLines = useMemo(() => {
        if (!fileContent) return [];
        return parseLogLines(fileContent);
    }, [fileContent]);

    // Memoized list of log categories
    const logCategories = useMemo(() => {
        if (!fileContent) return new Map<string, string>();
        return parseLogCategories(fileContent);
    }, [fileContent]);

    // Helper: For each category, get which log levels are present in the file
    const categoryLevelPresence = useMemo(() => {
        return getCategoryLevelPresence(parsedLogLines);
    }, [parsedLogLines]);

    // When logCategories changes, initialize categorySettings only if categories are new or fileContent changed
    useEffect(() => {
        if (logCategories.size === 0) return;
        if (Object.keys(categorySettings).length === 0) {
            const { categorySettings: newSettings } =
                getDefaultCategorySettings(
                    fileContent || "",
                    Object.values(ELogLevel)
                );
            setCategorySettings(newSettings);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logCategories, fileContent, categoryLevelPresence]);

    // Filtered content based on categorySettings, including multiline logs
    const filteredContent = useMemo(() => {
        // Helper to compare log levels
        const logLevelIndex = (level: ELogLevel | null) => {
            if (!level) return logLevelsArray.length; // Treat unknown as lowest
            const idx = logLevelsArray.indexOf(level);
            return idx === -1 ? logLevelsArray.length : idx;
        };

        if (!fileContent || Object.keys(categorySettings).length === 0)
            return "";
        const lines: string[] = [];
        parsedLogLines.forEach((entry) => {
            const cat = entry.category;
            const level: ELogLevel = parseLogLevel(entry.level);
            let show = false;
            if (cat) {
                if (categorySettings[cat]?.enabled) {
                    const minLevel = categorySettings[cat].minLevel;
                    show = logLevelIndex(level) <= logLevelIndex(minLevel);
                }
            } else {
                // No category: show if ANY enabled category's minLevel is 'Log' or lower
                show = Object.values(categorySettings).some(
                    (settings) =>
                        settings.enabled &&
                        logLevelIndex(ELogLevel.Log) <=
                            logLevelIndex(settings.minLevel)
                );
            }
            if (show) {
                lines.push(entry.line);
                if (entry.multiline && entry.multiline.length > 0) {
                    lines.push(...entry.multiline);
                }
            }
        });
        return lines.join("\n");
    }, [parsedLogLines, categorySettings, fileContent, logLevelsArray]);

    // Toggle category enable/disable
    const toggleCategory = (category: string) => {
        setCategorySettings((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                enabled: !prev[category]?.enabled,
            },
        }));
    };

    // Handler for changing min log level
    const setCategoryLevel = (category: string, minLevel: ELogLevel) => {
        setCategorySettings((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                minLevel,
            },
        }));
    };

    // Enable all categories
    const handleEnableAll = () => {
        setCategorySettings((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach((cat) => {
                updated[cat].enabled = true;
            });
            return { ...updated };
        });
    };

    // Disable all categories
    const handleDisableAll = () => {
        setCategorySettings((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach((cat) => {
                updated[cat].enabled = false;
            });
            return { ...updated };
        });
    };

    const handleRevertLevels = () => {
        if (!fileContent) return;
        const { categorySettings: defaultSettings } =
            getDefaultCategorySettings(fileContent, logLevelsArray);
        setCategorySettings((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach((cat) => {
                if (defaultSettings[cat]) {
                    updated[cat].minLevel = defaultSettings[cat].minLevel;
                }
            });
            return updated;
        });
    };

    const bHasValidFile = fileContent !== "" && fileContent !== null;

    return (
        <div className="min-h-screen flex flex-col">
            {/* Thin heading strip */}
            <div className="bg-gray-100">
                <div className="p-2 flex justify-between items-center gap-4 mx-auto max-w-screen-lg">
                    <a href="https://joshlmao.com" target="_blank">
                        <Group gap={1}>
                            <Terminal color="darkred" />
                            by joshlmao
                        </Group>
                    </a>
                    <a
                        href="https://github.com/joshlmao/slogi"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <GitHub color="black" />
                    </a>
                </div>
            </div>

            <header className="text-center p-4 flex-none">
                <Title order={1} className="text-4xl sm:text-5xl">
                    slogi.
                </Title>
                <Text className="text-lg sm:text-xl mt-2">
                    A fast and lightweight online tool for debugging and
                    analyzing Unreal Engine log files.
                </Text>
            </header>

            {/* File picker section: only show if no file is loaded */}
            {!bHasValidFile && (
                <section className="w-full max-w-3xl mx-auto flex-none">
                    <Group align="center" justify="center">
                        <Text className="text-lg">choose a log file.</Text>
                        <FileButton onChange={handleFile}>
                            {(props) => (
                                <Button {...props} variant="outline">
                                    pick a file.
                                </Button>
                            )}
                        </FileButton>
                    </Group>

                    {error && (
                        <Text color="red" className="text-center mb-4">
                            {error}
                        </Text>
                    )}
                </section>
            )}

            {/* Start Over button: only show if a file is loaded */}
            {bHasValidFile && (
                <section className="px-4 flex flex-row items-center relative">
                    <div className="absolute left-1/2 -translate-x-1/2">
                        <Button
                            onClick={handleStartOver}
                            className="text-center"
                        >
                            <RotateCcw color="white" className="mr-2" />
                            restart.
                        </Button>
                    </div>
                    <div className="ml-auto">
                        <Button onClick={open}>
                            <Sliders color="white" className="mr-2" />
                            options.
                        </Button>
                    </div>
                </section>
            )}

            <section className="p-4 flex-1 flex flex-col">
                {bHasValidFile && (
                    <>
                        <div className="flex-1 flex flex-col">
                            <Textarea
                                value={filteredContent}
                                readOnly
                                className="w-full h-full flex flex-col flex-1"
                                styles={{
                                    input: {
                                        fontFamily: "monospace",
                                        whiteSpace: "pre",
                                        overflowX: "auto",
                                        flex: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                    },
                                    wrapper: {
                                        flex: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                    },
                                }}
                            />
                        </div>
                    </>
                )}
            </section>

            <Drawer
                position="right"
                opened={opened}
                onClose={close}
                title="options."
            >
                {/* Log Categories */}
                <LogOptionsDrawer
                    opened={opened}
                    onClose={close}
                    logCategories={logCategories}
                    categorySettings={categorySettings}
                    categoryLevelPresence={categoryLevelPresence}
                    logLevelsArray={logLevelsArray}
                    handleEnableAll={handleEnableAll}
                    handleDisableAll={handleDisableAll}
                    handleRevertLevels={handleRevertLevels}
                    toggleCategory={toggleCategory}
                    setCategoryLevel={setCategoryLevel}
                />
            </Drawer>
        </div>
    );
}
