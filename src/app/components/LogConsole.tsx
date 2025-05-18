import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type * as monaco from "monaco-editor";
import { ELogLevel } from "../types/logLevel";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
    ssr: false,
});

interface LogConsoleProps {
    filteredContent: { text: string; level: ELogLevel }[];
}

export default function LogConsole({ filteredContent }: LogConsoleProps) {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<typeof import("monaco-editor") | null>(null);
    const [editorMountCount, setEditorMountCount] = useState(0);

    const applyDecorations = useCallback(() => {
        const editor = editorRef.current;
        if (!editor || !filteredContent.length || !monacoRef.current) return;

        const newDecorations = filteredContent.map((line, index) => ({
            range: new monacoRef.current!.Range(index + 1, 1, index + 1, 9999),
            options: {
                inlineClassName: `log-level-${line.level.toLowerCase()}`,
            },
        }));

        editor.createDecorationsCollection(newDecorations);
    }, [filteredContent, editorRef, monacoRef]);

    const handleEditorDidMount = (
        editor: monaco.editor.IStandaloneCodeEditor,
        monacoInstance: typeof monaco
    ) => {
        editorRef.current = editor;
        monacoRef.current = monacoInstance;
        setEditorMountCount((prev) => prev + 1);
    };

    useEffect(() => {
        applyDecorations();
    }, [editorMountCount, filteredContent, applyDecorations]);

    return (
        <MonacoEditor
            height="75vh"
            width="100%"
            defaultLanguage="text"
            value={filteredContent.map((line) => line.text).join("\n")}
            options={{
                readOnly: true,
                fontFamily: "monospace",
                wordWrap: "on",
                minimap: { enabled: false },
            }}
            onMount={handleEditorDidMount}
        />
    );
}
