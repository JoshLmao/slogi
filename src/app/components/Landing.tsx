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
    ScrollArea,
    Switch,
    Select,
    Stack,
} from "@mantine/core";
import { GitHub, Sliders, Terminal } from "react-feather";
import { useDisclosure } from "@mantine/hooks";

export default function Landing() {
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [opened, { open, close }] = useDisclosure(false);

    const logLevels = useMemo(
        () => [
            "Fatal",
            "Error",
            "Warning",
            "Display",
            "Log",
            "Verbose",
            "VeryVerbose",
        ],
        []
    );

    // Per-category state: { [category]: { enabled: boolean, minLevel: string } }
    const [categorySettings, setCategorySettings] = useState<{
        [category: string]: { enabled: boolean; minLevel: string };
    }>({});

    const handleFile = async (file: File | null) => {
        if (!file) return;

        try {
            const text = await file.text();
            setFileContent(text);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("An error occurred while reading the file.");
            setFileContent(null);
        }
    };

    // Parse log lines to extract category and level
    const parseLogLines = (content: string) => {
        const lines = content.split("\n");
        return lines.map((line) => {
            // Regex: [timestamp][thread]LogCategory: Level: ...
            // Example: [2025.01.15-18.39.39:991][  0]LogGameFeatures: Display: ...
            const match = line.match(/(Log[A-Za-z0-9_]+):\s*([A-Za-z]+):/);
            let category = null;
            let level = null;
            if (match) {
                category = match[1];
                level = match[2];
            } else {
                // Try to match just the category
                const catMatch = line.match(/(Log[A-Za-z0-9_]+):/);
                if (catMatch) {
                    category = catMatch[1];
                }
                // Try to match just the level
                const levelMatch = line.match(
                    /(Error|Warning|Log|Verbose|VeryVerbose|Display|Fatal):/
                );
                if (levelMatch) {
                    level = levelMatch[1];
                }
            }
            // If no category, assign level 'Log' for filtering
            if (!category) {
                level = "Log";
            }
            return { line, category, level };
        });
    };

    // Function to parse log categories from the file content
    const parseLogCategories = (content: string): Map<string, string> => {
        const lines = content.split("\n");
        const categories = new Map<string, string>();
        lines.forEach((line) => {
            const match = line.match(/(Log[A-Za-z0-9_]+):/);
            if (match && match[1]) {
                const category = match[1];
                if (!categories.has(category)) {
                    categories.set(category, category);
                }
            }
        });
        return new Map(
            [...categories.entries()].sort(([a], [b]) => a.localeCompare(b))
        );
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

    // When logCategories changes, initialize categorySettings
    useEffect(() => {
        if (logCategories.size > 0) {
            const newSettings: {
                [category: string]: { enabled: boolean; minLevel: string };
            } = {};
            Array.from(logCategories.keys()).forEach((cat) => {
                newSettings[cat] = {
                    enabled: true,
                    minLevel: "Log", // Default to show most logs (change as desired)
                };
            });
            setCategorySettings(newSettings);
        }
    }, [logCategories]);

    // Filtered content based on categorySettings
    const filteredContent = useMemo(() => {
        // Helper to compare log levels
        const logLevelIndex = (level: string | null) => {
            if (!level) return logLevels.length; // Treat unknown as lowest
            const idx = logLevels.indexOf(level);
            return idx === -1 ? logLevels.length : idx;
        };

        if (!fileContent || Object.keys(categorySettings).length === 0)
            return "";
        return parsedLogLines
            .filter((entry) => {
                const cat = entry.category;
                const level = entry.level;
                if (cat) {
                    // Normal category filtering
                    if (!categorySettings[cat]?.enabled) return false;
                    const minLevel = categorySettings[cat].minLevel;
                    return logLevelIndex(level) <= logLevelIndex(minLevel);
                } else {
                    // No category: show if ANY enabled category's minLevel is 'Log' or lower
                    return Object.values(categorySettings).some(
                        (settings) =>
                            settings.enabled &&
                            logLevelIndex("Log") <=
                                logLevelIndex(settings.minLevel)
                    );
                }
            })
            .map((entry) => entry.line)
            .join("\n");
    }, [parsedLogLines, categorySettings, fileContent, logLevels]);

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
    const setCategoryLevel = (category: string, minLevel: string) => {
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
        setCategorySettings((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach((cat) => {
                updated[cat].minLevel = "Display";
            });
            return { ...updated };
        });
    };

    const bHasValidFile = fileContent !== "";

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

            <section className="w-full max-w-3xl mx-auto p-4 flex-none">
                <Group align="center">
                    <Text className="text-lg">Choose a log file:</Text>
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

            <section className="p-4 flex-1 flex flex-col">
                {bHasValidFile && (
                    <>
                        <div className="pb-2 ml-auto">
                            <Button className="flex-none" onClick={open}>
                                <Sliders color="white" className="mr-2" />
                                options.
                            </Button>
                        </div>
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
                <div>
                    <Title order={3}>log categories.</Title>
                    <ScrollArea
                        h={"75vh"}
                        overscrollBehavior="auto auto"
                        scrollbars="y"
                        offsetScrollbars
                    >
                        <Stack gap="xs">
                            {Array.from(logCategories.keys()).map(
                                (category) => (
                                    <Group
                                        key={category}
                                        gap={2}
                                        justify="space-between"
                                    >
                                        <Switch
                                            checked={
                                                categorySettings[category]
                                                    ?.enabled
                                            }
                                            onChange={() =>
                                                toggleCategory(category)
                                            }
                                            label={category}
                                        />
                                        <div className="flex flex-row">
                                            <Select
                                                data={logLevels}
                                                value={
                                                    categorySettings[category]
                                                        ?.minLevel
                                                }
                                                onChange={(val) =>
                                                    val &&
                                                    setCategoryLevel(
                                                        category,
                                                        val
                                                    )
                                                }
                                                size="xs"
                                                style={{ maxWidth: 120 }}
                                                disabled={
                                                    !categorySettings[category]
                                                        ?.enabled
                                                }
                                            />
                                        </div>
                                    </Group>
                                )
                            )}
                        </Stack>
                    </ScrollArea>
                    <Group>
                        <Button onClick={handleEnableAll}>all enable.</Button>
                        <Button onClick={handleDisableAll}>all disable.</Button>
                        <Button onClick={handleRevertLevels}>
                            revert levels.
                        </Button>
                    </Group>
                </div>
            </Drawer>
        </div>
    );
}
