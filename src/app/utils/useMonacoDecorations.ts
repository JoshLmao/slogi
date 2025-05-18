import { useEffect, useCallback } from "react";
import type * as monaco from "monaco-editor";
import { ELogLevel } from "../types/logLevel";

interface DecorationData {
    text: string;
    level: ELogLevel;
}

export function useMonacoDecorations(
    editorRef: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>,
    monacoRef: React.MutableRefObject<typeof monaco | null>,
    content: DecorationData[]
) {
    const applyDecorations = useCallback(() => {
        const editor = editorRef.current;
        if (!editor || !content.length || !monacoRef.current) return;

        const newDecorations = content.map((line, index) => ({
            range: new monacoRef.current!.Range(index + 1, 1, index + 1, 9999),
            options: {
                inlineClassName: `log-level-${line.level.toLowerCase()}`,
            },
        }));

        editor.createDecorationsCollection(newDecorations);
    }, [content, editorRef, monacoRef]);

    useEffect(() => {
        applyDecorations();
    }, [applyDecorations]);

    return { applyDecorations };
}
