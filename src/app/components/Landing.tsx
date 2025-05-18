"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
    Title,
    Text,
    Button,
    Group,
    FileButton,
    Drawer,
    Select,
} from "@mantine/core";
import { GitHub, RotateCcw, Sliders, Terminal } from "react-feather";
import { useDisclosure } from "@mantine/hooks";
import { ELogLevel, parseLogLevel, getLogLevelColor } from "../types/logLevel";
import { parseLogLines, parseLogCategories } from "../utils/logParser";
import { handleFileParsing } from "../utils/fileParser";
import {
    getDefaultCategorySettings,
    getCategoryLevelPresence,
} from "../utils/categorySettings";
import LogOptionsDrawer from "./LogOptionsDrawer";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import "../../i18n";
import Image from "next/image";
import { getSupportedLanguages, setAppLanguage } from "../utils/languageUtils";
import dynamic from "next/dynamic";
import type * as monaco from "monaco-editor";
import { useMonacoDecorations } from "../utils/useMonacoDecorations";

// Dynamically import Monaco Editor with SSR disabled
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
    ssr: false,
});

export default function Landing() {
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [opened, { open, close }] = useDisclosure(false);
    const [language, setLanguage] = useState<string>("en");

    const router = useRouter();

    const { t, i18n } = useTranslation("common");

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
            return [];
        const lines: { text: string; color: string }[] = [];
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
                const color = getLogLevelColor(level);
                lines.push({ text: entry.line, color });
                if (entry.multiline && entry.multiline.length > 0) {
                    entry.multiline.forEach((line) =>
                        lines.push({ text: line, color })
                    );
                }
            }
        });
        return lines;
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

    const handleLanguageChange = (value: string | null) => {
        if (value) {
            setLanguage(value);
            router.push(`/${value}`);
        }
    };

    // Check current locale from url and apply in i18n
    useEffect(() => {
        if (typeof window === "undefined") return;
        const currentLocale = window.location.pathname.split("/")[1];
        setLanguage(currentLocale);
        setAppLanguage(currentLocale, i18n);
    }, [i18n, language]);

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<typeof import("monaco-editor") | null>(null);

    const { applyDecorations } = useMonacoDecorations(editorRef, monacoRef, filteredContent);

    const handleEditorDidMount = (
        editor: import("monaco-editor").editor.IStandaloneCodeEditor,
        monaco: typeof import("monaco-editor")
    ) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        applyDecorations(); // Ensure decorations are applied immediately after mounting
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Thin heading strip */}
            <div className="bg-gray-100">
                <div className="p-2 flex justify-between items-center gap-4 mx-auto max-w-screen-lg">
                    <a href="https://joshlmao.com" target="_blank">
                        <Group gap={1}>
                            <Terminal color="darkred" />
                            {t("by_author")}
                        </Group>
                    </a>
                    <Group gap="md">
                        <Group gap="xs">
                            <Image
                                src="/translate.svg"
                                alt="Logo"
                                width={20}
                                height={20}
                            />
                            <Select
                                data={getSupportedLanguages()}
                                value={language}
                                onChange={handleLanguageChange}
                                size="xs"
                                className="w-28"
                                aria-label="Select language"
                            />
                        </Group>
                        <a
                            href="https://github.com/joshlmao/slogi"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <GitHub color="black" />
                        </a>
                    </Group>
                </div>
            </div>

            <header className="text-center p-4 flex-none">
                <Title order={1} className="text-4xl sm:text-5xl">
                    {t("app_title")}
                </Title>
                <Text className="text-lg sm:text-xl mt-2">
                    {t("app_subtitle")}
                </Text>
            </header>

            {/* File picker section: only show if no file is loaded */}
            {!bHasValidFile && (
                <section className="w-full max-w-3xl mx-auto flex-none">
                    <Group align="center" justify="center">
                        <Text className="text-lg">{t("choose_log_file")}</Text>
                        <FileButton onChange={handleFile}>
                            {(props) => (
                                <Button {...props} variant="outline">
                                    {t("pick_a_file")}
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
                            {t("restart")}
                        </Button>
                    </div>
                    <div className="ml-auto">
                        <Button onClick={open}>
                            <Sliders color="white" className="mr-2" />
                            {t("options")}
                        </Button>
                    </div>
                </section>
            )}

            <section className="p-4 flex-1">
                {bHasValidFile && (
                    <MonacoEditor
                        height="75vh"
                        width="100%"
                        defaultLanguage="text"
                        value={filteredContent
                            .map((line) => line.text)
                            .join("\n")}
                        options={{
                            readOnly: true,
                            fontFamily: "monospace",
                            wordWrap: "on",
                            minimap: { enabled: false },
                        }}
                        onMount={handleEditorDidMount}
                    />
                )}
            </section>

            <Drawer
                position="right"
                opened={opened}
                onClose={close}
                title={t("options")}
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
