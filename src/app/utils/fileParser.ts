export async function handleFileParsing(file: File | null): Promise<{ content: string | null; error: string | null }> {
    if (!file) return { content: null, error: null };
    try {
        const text = await file.text();
        return { content: text, error: null };
    } catch (err) {
        console.error(err);
        return { content: null, error: "An error occurred while reading the file." };
    }
}