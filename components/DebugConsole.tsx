import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useThemeColor } from "../hooks/useThemeColor";
import { ThemedText } from "./ThemedText";

interface LogEntry {
  timestamp: Date;
  type: "log" | "error" | "warn" | "info";
  message: string;
}

// Override console methods to capture logs
const setupConsoleCapture = (addLogEntry: (entry: LogEntry) => void) => {
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleInfo = console.info;

  console.log = (...args) => {
    originalConsoleLog(...args);
    const entry = {
      timestamp: new Date(),
      type: "log" as const,
      message: args
        .map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg) : String(arg)
        )
        .join(" "),
    };
    // Use setTimeout to avoid updating state during render
    setTimeout(() => addLogEntry(entry), 0);
  };

  console.error = (...args) => {
    originalConsoleError(...args);
    const entry = {
      timestamp: new Date(),
      type: "error" as const,
      message: args
        .map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg) : String(arg)
        )
        .join(" "),
    };
    setTimeout(() => addLogEntry(entry), 0);
  };

  console.warn = (...args) => {
    originalConsoleWarn(...args);
    const entry = {
      timestamp: new Date(),
      type: "warn" as const,
      message: args
        .map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg) : String(arg)
        )
        .join(" "),
    };
    setTimeout(() => addLogEntry(entry), 0);
  };

  console.info = (...args) => {
    originalConsoleInfo(...args);
    const entry = {
      timestamp: new Date(),
      type: "info" as const,
      message: args
        .map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg) : String(arg)
        )
        .join(" "),
    };
    setTimeout(() => addLogEntry(entry), 0);
  };

  return () => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.info = originalConsoleInfo;
  };
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("en-US", { hour12: false });
};

const DebugConsole: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [visible, setVisible] = useState(false);
  const logsRef = useRef<LogEntry[]>([]);

  const backgroundColor = useThemeColor(
    { light: "#e0e0e0", dark: "#222" },
    "background"
  );
  const textColor = useThemeColor({ light: "#000", dark: "#fff" }, "text");
  const borderColor = useThemeColor(
    { light: "#ccc", dark: "#555" },
    "background"
  );

  useEffect(() => {
    const addLogEntry = (entry: LogEntry) => {
      // Use the ref to track logs between renders
      logsRef.current = [...logsRef.current, entry];
      // Limit to last 100 logs
      if (logsRef.current.length > 100) {
        logsRef.current = logsRef.current.slice(logsRef.current.length - 100);
      }
      // Update state safely outside of render
      setLogs([...logsRef.current]);
    };

    const cleanup = setupConsoleCapture(addLogEntry);

    // Add initial log entry - using setTimeout to avoid issues during render
    setTimeout(() => {
      addLogEntry({
        timestamp: new Date(),
        type: "info",
        message: "Debug console initialized",
      });
    }, 100);

    return () => {
      cleanup();
    };
  }, []);

  const clearLogs = () => {
    logsRef.current = [];
    setLogs([]);
  };

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case "error":
        return "#ff6b6b";
      case "warn":
        return "#feca57";
      case "info":
        return "#48dbfb";
      default:
        return textColor;
    }
  };

  if (!visible) {
    return (
      <TouchableOpacity
        style={styles.debugButton}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.debugButtonText}>🐞</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Debug Console</ThemedText>
        <View style={styles.headerButtons}>
          <Button title="Clear" onPress={clearLogs} />
          <Button title="Close" onPress={() => setVisible(false)} />
        </View>
      </View>

      <ScrollView style={styles.logContainer}>
        {logs.map((log, index) => (
          <View key={index} style={styles.logEntry}>
            <Text style={[styles.logTime, { color: textColor }]}>
              {formatTime(log.timestamp)}
            </Text>
            <Text
              style={[styles.logMessage, { color: getLogTypeColor(log.type) }]}
            >
              {`[${log.type.toUpperCase()}] ${log.message}`}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: Dimensions.get("window").height / 3,
    borderTopWidth: 1,
    elevation: 5,
    zIndex: 999,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerButtons: {
    flexDirection: "row",
  },
  title: {
    fontWeight: "bold",
  },
  logContainer: {
    flex: 1,
    padding: 8,
  },
  logEntry: {
    marginBottom: 4,
    flexDirection: "row",
  },
  logTime: {
    marginRight: 8,
    fontSize: 12,
  },
  logMessage: {
    flex: 1,
    fontSize: 12,
  },
  debugButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  debugButtonText: {
    fontSize: 20,
    color: "white",
  },
});

export default DebugConsole;
