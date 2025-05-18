import "@mantine/core/styles.css";

import Landing from "../components/Landing";
import { ColorSchemeScript, createTheme, MantineProvider } from "@mantine/core";
import Head from "next/head";

const theme = createTheme({
    /** Put your mantine theme override here */
});

export default function Home() {
    return (
        <MantineProvider theme={theme}>
            <div className="font-[family-name:var(--font-geist-sans)]">
                <Head>
                    <title>sLogi</title>
                    <meta
                        name="description"
                        content="A fast and lightweight online tool for debugging and analyzing Unreal Engine log files"
                    />
                    <ColorSchemeScript />
                </Head>
                <main>
                    <Landing />
                </main>
                <footer></footer>
            </div>
        </MantineProvider>
    );
}
