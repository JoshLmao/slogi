import {
    Drawer,
    Flex,
    Alert,
    Title,
    Group,
    Button,
    ScrollArea,
    Stack,
    Grid,
    Switch,
    Select,
} from "@mantine/core";
import { ELogLevel, parseLogLevel } from "../types/logLevel";
import React from "react";

interface LogOptionsDrawerProps {
    opened: boolean;
    onClose: () => void;
    logCategories: Map<string, string>;
    categorySettings: {
        [category: string]: { enabled: boolean; minLevel: ELogLevel };
    };
    categoryLevelPresence: { [category: string]: Set<string> };
    logLevelsArray: string[];
    handleEnableAll: () => void;
    handleDisableAll: () => void;
    handleRevertLevels: () => void;
    toggleCategory: (category: string) => void;
    setCategoryLevel: (category: string, minLevel: ELogLevel) => void;
}

const LogOptionsDrawer: React.FC<LogOptionsDrawerProps> = ({
    opened,
    onClose,
    logCategories,
    categorySettings,
    categoryLevelPresence,
    logLevelsArray,
    handleEnableAll,
    handleDisableAll,
    handleRevertLevels,
    toggleCategory,
    setCategoryLevel,
}) => (
    <Drawer position="right" opened={opened} onClose={onClose} title="options.">
        <Flex
            direction="column"
            gap="xs"
            h="calc(100vh - 80px)"
            style={{ minHeight: 0 }}
        >
            <Alert variant="light" color="blue" title="log level info.">
                Log is the default log level for any lines that don&apos;t
                contain a log level
            </Alert>
            <Title order={3}>log categories.</Title>
            <Group justify="center">
                <Button size="compact-sm" onClick={handleEnableAll}>
                    enable all.
                </Button>
                <Button size="compact-sm" onClick={handleDisableAll}>
                    disable all.
                </Button>
                <Button size="compact-sm" onClick={handleRevertLevels}>
                    default levels.
                </Button>
            </Group>
            <ScrollArea
                overscrollBehavior="auto auto"
                scrollbars="y"
                offsetScrollbars
                style={{ flex: 1, minHeight: 0 }}
            >
                <Stack gap="xs">
                    {Array.from(logCategories.keys()).map((category) => (
                        <Grid key={category}>
                            <Grid.Col span={8}>
                                <Switch
                                    checked={
                                        categorySettings[category]?.enabled
                                    }
                                    onChange={() => toggleCategory(category)}
                                    label={
                                        <span
                                            style={{ wordBreak: "break-word" }}
                                        >
                                            {category}
                                        </span>
                                    }
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <div className="flex flex-row">
                                    <Select
                                        data={logLevelsArray.map((level) => ({
                                            value: level,
                                            label: level,
                                            disabled:
                                                !categoryLevelPresence[
                                                    category
                                                ]?.has(level),
                                        }))}
                                        value={
                                            categorySettings[category]?.minLevel
                                        }
                                        onChange={(val) =>
                                            val &&
                                            setCategoryLevel(
                                                category,
                                                parseLogLevel(val)
                                            )
                                        }
                                        size="xs"
                                        style={{ maxWidth: 120 }}
                                        disabled={
                                            !categorySettings[category]?.enabled
                                        }
                                    />
                                </div>
                            </Grid.Col>
                        </Grid>
                    ))}
                </Stack>
            </ScrollArea>
        </Flex>
    </Drawer>
);

export default LogOptionsDrawer;
