import { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { StyledText } from '@/components/StyledText';
import { Button } from '@/components/Button';
import { TaskCard } from '@/components/TaskCard';
import { BookCard } from '@/components/BookCard';
import { useRoutineStore } from '@/store/routineStore';
import { useBookStore } from '@/store/bookStore';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/constants/colors';
import { Task, Routine, Book } from '@/types';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { BookOpen, Plus, Calendar } from 'lucide-react-native';
import { formatDateByCalendar } from '@/utils/hijriUtils';
import { useColorScheme } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { settings } = useSettingsStore();
  const { routines, tasks, updateTask } = useRoutineStore();
  const { getActiveBooks } = useBookStore();
  const [refreshing, setRefreshing] = useState(false);
  const [today] = useState(format(new Date(), 'yyyy-MM-dd'));
  const colorScheme = useColorScheme();

  // Determine the active theme
  const getActiveTheme = () => {
    if (settings.theme === 'system') {
      return colorScheme || 'light';
    }
    return settings.theme;
  };

  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme as keyof typeof colors] || colors.light;

  // Get today's tasks and their associated routines
  const todaysTasks = useMemo(() => {
    return tasks
      .filter(task => task.date === today)
      .map(task => {
        const routine = routines.find(r => r.id === task.routineId);
        return { task, routine };
      })
      .filter(({ routine }) => routine !== undefined) as { task: Task; routine: Routine }[];
  }, [tasks, routines, today]);

  // Get active books
  const activeBooks = useMemo(() => {
    return getActiveBooks().slice(0, 3); // Show only first 3 books
  }, [getActiveBooks]);

  // Split tasks into pending and completed
  const pendingTasks = useMemo(() => {
    return todaysTasks.filter(({ task }) => !task.completed);
  }, [todaysTasks]);

  const completedTasks = useMemo(() => {
    return todaysTasks.filter(({ task }) => task.completed);
  }, [todaysTasks]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleTaskPress = (taskId: string, routineId: string) => {
    router.push(`/routine/${routineId}?taskId=${taskId}`);
  };

  const handleTaskComplete = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, {
        completed: !task.completed,
        completedAt: !task.completed ? Date.now() : undefined,
      });
    }
  };

  const handleBookPress = (bookId: string) => {
    router.push(`/book/${bookId}`);
  };

  const renderTaskItem = ({ item }: { item: { task: Task; routine: Routine } }) => (
    <TaskCard
      task={item.task}
      routine={item.routine}
      onPress={() => handleTaskPress(item.task.id, item.routine.id)}
      onComplete={() => handleTaskComplete(item.task.id)}
    />
  );

  const renderBookItem = ({ item }: { item: Book }) => (
    <BookCard book={item} onPress={() => handleBookPress(item.id)} horizontal />
  );

  // Format date based on user's calendar preference
  const formattedDate = formatDateByCalendar(new Date(), settings.calendarType);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <FlatList
        data={[...pendingTasks, ...completedTasks]}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.task.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <StyledText variant="h1">مهام اليوم</StyledText>

            <View style={styles.dateContainer}>
              <Calendar size={16} color={themeColors.primary} />
              <StyledText variant="body" color={themeColors.subtext} style={styles.date}>
                {formattedDate}
              </StyledText>
            </View>

            {/* Active Books Section */}
            {activeBooks.length > 0 && (
              <View style={styles.booksSection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <BookOpen size={20} color={themeColors.primary} />
                    <StyledText variant="h3" style={styles.sectionTitleText}>
                      كتبي الحالية
                    </StyledText>
                  </View>
                  <TouchableOpacity
                    style={styles.seeAllButton}
                    onPress={() => router.push('/(tabs)/books')}
                  >
                    <StyledText variant="caption" color={themeColors.primary}>
                      عرض الكل
                    </StyledText>
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={activeBooks}
                  renderItem={renderBookItem}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.booksListContent}
                />
              </View>
            )}

            {pendingTasks.length === 0 && completedTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <StyledText variant="body" color={themeColors.subtext} centered>
                  ليس لديك أي مهام لهذا اليوم.
                </StyledText>
                <Button
                  title="إنشاء روتين"
                  onPress={() => router.push('/routine/create')}
                  variant="primary"
                />
              </View>
            ) : (
              <>
                {pendingTasks.length > 0 && (
                  <View style={styles.section}>
                    <StyledText variant="h3" style={styles.sectionTitle}>
                      معلقة ({pendingTasks.length})
                    </StyledText>
                  </View>
                )}

                {completedTasks.length > 0 && pendingTasks.length > 0 && (
                  <View style={styles.section}>
                    <StyledText variant="h3" style={styles.sectionTitle}>
                      مكتملة ({completedTasks.length})
                    </StyledText>
                  </View>
                )}
              </>
            )}
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[themeColors.primary]}
            tintColor={themeColors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  date: {
    marginLeft: 8,
  },
  booksSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitleText: {
    marginLeft: 8,
  },
  seeAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  booksListContent: {
    paddingRight: 16,
  },
  section: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  emptyState: {
    marginTop: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
});
