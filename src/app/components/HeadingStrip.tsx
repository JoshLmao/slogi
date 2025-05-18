import { Group, Select } from "@mantine/core";
import { Terminal, GitHub } from "react-feather";
import Image from "next/image";
import { getSupportedLanguages } from "../utils/languageUtils";
import { useTranslation } from "react-i18next";

interface HeadingStripProps {
    language: string;
    onLanguageChange: (value: string | null) => void;
}

export default function HeadingStrip({
    language,
    onLanguageChange,
}: HeadingStripProps) {
    const { t } = useTranslation("common");

    return (
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
                            onChange={onLanguageChange}
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
    );
}
