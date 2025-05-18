import { useEffect, useRef, useCallback } from "react";
import type * as monaco from "monaco-editor";

interface DecorationData {
    text: string;
    color: string;
}

export function useMonacoDecorations(
    editorRef: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>,
    monacoRef: React.MutableRefObject<typeof monaco | null>,
    content: DecorationData[]
) {
    const decorationsCollectionRef = useRef<monaco.editor.IEditorDecorationsCollection | null>(null);

    const applyDecorations = useCallback(() => {
        const editor = editorRef.current;
        if (!editor || !content.length || !monacoRef.current) return;

        const newDecorations = content.map((line, index) => ({
            range: new monacoRef.current!.Range(index + 1, 1, index + 1, 9999),
            options: {
                inlineClassName: `log-level-${line.color}`,
            },
        }));

        if (!decorationsCollectionRef.current) {
            decorationsCollectionRef.current = editor.createDecorationsCollection(newDecorations);
        } else {
            decorationsCollectionRef.current.set(newDecorations);
        }
    }, [content, editorRef, monacoRef]);

    useEffect(() => {
        applyDecorations();
    }, [applyDecorations]);

    return { applyDecorations };
}
