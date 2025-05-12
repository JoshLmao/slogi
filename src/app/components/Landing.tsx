"use client";

import { useState } from "react";
import {
    Title,
    Text,
    Button,
    Textarea,
    Group,
    FileButton,
} from "@mantine/core";

export default function Landing() {
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

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

    return (
        <div className="min-h-screen flex flex-col">
            <header className="text-center p-4 flex-none">
                <Title order={1} className="text-4xl sm:text-5xl">
                    Slogi
                </Title>
                <Text className="text-lg sm:text-xl mt-2">
                    A fast and lightweight online tool for debugging and
                    analyzing Unreal Engine log files
                </Text>
            </header>

            <section className="w-full max-w-3xl mx-auto p-4 flex-none">
                <Group align="center">
                    <Text className="text-lg">Choose a log file:</Text>
                    <FileButton onChange={handleFile}>
                        {(props) => (
                            <Button {...props} variant="outline">
                                Pick a file
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

            <section className="p-4 w-full flex-1 flex flex-col">
                {fileContent && (
                    <Textarea
                        value={fileContent
                            .split("\n")
                            .map((line, index) => `${index + 1}: ${line}`)
                            .join("\n")}
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
                )}
            </section>
        </div>
    );
}
