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
} from "@mantine/core";
import { GitHub, Sliders, Terminal } from "react-feather";
import { useDisclosure } from "@mantine/hooks";

export default function Landing() {
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [enabledCategories, setEnabledCategories] = useState<string[]>([]);
    const [opened, { open, close }] = useDisclosure(false);

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

    // Function to parse log categories from the file content
    const parseLogCategories = (content: string): Map<string, string> => {
        const lines = content.split("\n"); // Split content into lines
        const categories = new Map<string, string>();

        lines.forEach((line) => {
            const match = line.match(/(Log[A-Za-z0-9_]+):/); // Match "LogCategory:"
            if (match && match[1]) {
                const category = match[1]; // Extract the category including the colon
                if (!categories.has(category)) {
                    categories.set(category, category);
                }
            }
        });

        // Sort categories alphabetically
        return new Map(
            [...categories.entries()].sort(([a], [b]) => a.localeCompare(b))
        );
    };

    // Memoized list of log categories
    const logCategories = useMemo(() => {
        if (!fileContent) return new Map<string, string>();
        return parseLogCategories(fileContent);
    }, [fileContent]);

    // Automatically enable all categories when they are determined
    useEffect(() => {
        if (logCategories.size > 0) {
            setEnabledCategories(Array.from(logCategories.keys()));
        }
    }, [logCategories]);

    // Filtered content based on enabled categories
    const filteredContent = useMemo(() => {
        if (!fileContent || enabledCategories.length === 0) return "";

        return fileContent
            .split("\n")
            .filter((line) =>
                enabledCategories.some((category) => line.includes(category))
            )
            .join("\n");
    }, [fileContent, enabledCategories]);

    // Toggle category enable/disable
    const toggleCategory = (category: string) => {
        setEnabledCategories((prev) => {
            const isCategoryEnabled = prev.includes(category);
            const updatedCategories = isCategoryEnabled
                ? prev.filter((c) => c !== category) // Remove category
                : [...prev, category]; // Add category
            return updatedCategories;
        });
    };

    // Enable all categories
    const handleEnableAll = () => {
        setEnabledCategories(Array.from(logCategories.keys()));
    };

    // Disable all categories
    const handleDisableAll = () => {
        setEnabledCategories([]);
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
                        <div className="pb-2">
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

            <Drawer opened={opened} onClose={close} title="options.">
                {/* Log Categories */}
                <div>
                    <Title order={3}>log categories.</Title>
                    <ScrollArea
                        h={400}
                        overscrollBehavior="auto auto"
                        scrollbars="y"
                    >
                        {Array.from(logCategories.keys()).map((category) => (
                            <div
                                key={category}
                                className="flex items-center mb-2"
                            >
                                <Switch
                                    checked={enabledCategories.includes(
                                        category
                                    )}
                                    onChange={() => toggleCategory(category)}
                                    label={category}
                                />
                            </div>
                        ))}
                    </ScrollArea>
                    <Group>
                        <Button onClick={handleEnableAll}>all enable.</Button>
                        <Button onClick={handleDisableAll}>all disable.</Button>
                    </Group>
                </div>
            </Drawer>
        </div>
    );
}
