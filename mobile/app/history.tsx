import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import TestHistoryCard from "../components/TestHistoryCard";
import { getTestHistory, deleteTest } from "../services/api";
import { Colors, Radius, Spacing } from "../constants/theme";
import type { TestRecord } from "../types";

export default function HistoryScreen() {
  const [tests, setTests] = useState<TestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<string>("");
  const [totalCount, setTotalCount] = useState(0);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await getTestHistory({
        page: 1,
        pageSize: 50,
        result: resultFilter || undefined,
        q: search || undefined,
      });
      setTests(data.items);
      setTotalCount(data.total);
    } catch (err) {
      console.error("Failed to load test history", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [resultFilter, search]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const handleDeleteTest = (test: TestRecord) => {
    Alert.alert(
      "Delete Evidence Record",
      `Permanently purge record #${test.id.slice(0, 8)} (${test.kit_type_name || "Reagent"})? This will irrevocably delete the captured image and cryptographic signatures.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTest(test.id);
              setTests((prev) => prev.filter((t) => t.id !== test.id));
              setTotalCount((prev) => Math.max(0, prev - 1));
            } catch (err: any) {
              Alert.alert("Error", err?.message || "Failed to delete test record.");
            }
          },
        },
      ]
    );
  };

  const filterOptions = [
    { label: "All", value: "" },
    { label: "Positive", value: "positive" },
    { label: "Negative", value: "negative" },
    { label: "Inconclusive", value: "inconclusive" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Search & Filter Bar */}
        <View style={styles.header}>
          <View style={styles.searchRow}>
            <View style={styles.searchWrapper}>
              <Ionicons name="search" size={18} color={Colors.textMuted} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search kit, officer, or notes..."
                placeholderTextColor={Colors.textMuted}
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
                onSubmitEditing={fetchHistory}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")} style={{ padding: 4 }}>
                  <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Filter Chips */}
          <View style={styles.filterScroll}>
            {filterOptions.map((opt) => {
              const active = resultFilter === opt.value;
              return (
                <TouchableOpacity
                  key={opt.label}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setResultFilter(opt.value)}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* List Content */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.loadingText}>Fetching Cryptographic Logs...</Text>
          </View>
        ) : (
          <FlatList
            data={tests}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.primary}
              />
            }
            ListHeaderComponent={
              <View style={styles.countRow}>
                <Text style={styles.countText}>
                  Showing {tests.length} of {totalCount} Records
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TestHistoryCard
                test={item}
                onPress={() => {
                  router.push({
                    pathname: "/result",
                    params: { testId: item.id },
                  });
                }}
                onDelete={() => handleDeleteTest(item)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={54} color={Colors.borderLight} />
                <Text style={styles.emptyTitle}>No Test Records Found</Text>
                <Text style={styles.emptySub}>
                  {search || resultFilter
                    ? "Try adjusting your filters or search terms."
                    : "Complete a field test capture to build the digital evidence log."}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    paddingVertical: 10,
  },
  filterScroll: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  filterChipActive: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  filterTextActive: {
    color: Colors.primary,
  },
  countRow: {
    marginBottom: Spacing.sm,
  },
  countText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl + 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  loadingText: {
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
});
