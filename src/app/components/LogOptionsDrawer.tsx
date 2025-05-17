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
    TextInput,
    Divider,
} from "@mantine/core";
import { ELogLevel, parseLogLevel } from "../types/logLevel";
import React, { useState } from "react";

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
}) => {
    const [search, setSearch] = useState("");
    const filteredCategories =
        search.trim().length === 0
            ? Array.from(logCategories.keys())
            : Array.from(logCategories.keys()).filter((cat) =>
                  cat.toLowerCase().includes(search.trim().toLowerCase())
              );

    return (
        <Drawer
            position="right"
            opened={opened}
            onClose={onClose}
            title="options."
            size="lg"
            overlayProps={{ backgroundOpacity: 0 }}
        >
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
                <Group align="stretch" className="flex flex-col">
                    <Title order={3}>log categories.</Title>
                    <Group align="stretch" className="flex-1">
                        <TextInput
                            size="xs"
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="filter categories..."
                            style={{ flex: 1 }}
                        />
                        <Button
                            size="compact-md"
                            variant="light"
                            onClick={() => setSearch("")}
                            style={{ flex: "none" }}
                        >
                            clear.
                        </Button>
                    </Group>
                </Group>
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
                        {filteredCategories.map((category) => (
                            <div key={category}>
                                <Grid>
                                    <Grid.Col span={8}>
                                        <Switch
                                            checked={
                                                categorySettings[category]
                                                    ?.enabled
                                            }
                                            onChange={() =>
                                                toggleCategory(category)
                                            }
                                            label={
                                                <span
                                                    style={{
                                                        wordBreak: "break-word",
                                                    }}
                                                >
                                                    {category}
                                                </span>
                                            }
                                        />
                                        <Divider
                                            style={{
                                                marginTop: 9,
                                                marginLeft: 0,
                                                marginRight: 0,
                                                width: "100%",
                                            }}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={4}>
                                        <Select
                                            data={logLevelsArray.map(
                                                (level) => ({
                                                    value: level,
                                                    label: level,
                                                    disabled:
                                                        !categoryLevelPresence[
                                                            category
                                                        ]?.has(level),
                                                })
                                            )}
                                            value={
                                                categorySettings[category]
                                                    ?.minLevel
                                            }
                                            onChange={(val) =>
                                                val &&
                                                setCategoryLevel(
                                                    category,
                                                    parseLogLevel(val)
                                                )
                                            }
                                            size="xs"
                                            style={{ minWidth: 120 }}
                                            disabled={
                                                !categorySettings[category]
                                                    ?.enabled
                                            }
                                        />
                                    </Grid.Col>
                                </Grid>
                            </div>
                        ))}
                    </Stack>
                </ScrollArea>
            </Flex>
        </Drawer>
    );
};

export default LogOptionsDrawer;
