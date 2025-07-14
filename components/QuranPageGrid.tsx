import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { StyledText } from './StyledText';
import { colors } from '@/constants/colors';
import { useSettingsStore } from '@/store/settingsStore';
import { QuranPage } from '@/types';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useState } from 'react';

interface QuranPageGridProps {
  pages: QuranPage[];
  onPagePress: (page: QuranPage) => void;
  activeTab: 'read' | 'memorized' | 'revised';
}

interface JuzSection {
  id: number;
  name: string;
  startPage: number;
  endPage: number;
  pages: QuranPage[];
}

export function QuranPageGrid({ pages, onPagePress, activeTab }: QuranPageGridProps) {
  const { settings } = useSettingsStore();
  const theme = settings.theme === 'system' ? 'light' : settings.theme;
  const themeColors = colors[theme];

  const [expandedJuz, setExpandedJuz] = useState<Set<number>>(new Set([1])); // الجزء الأول مفتوح افتراضياً

  // تجميع الصفحات في أجزاء
  const createJuzSections = (): JuzSection[] => {
    const sections: JuzSection[] = [];

    for (let juzNumber = 1; juzNumber <= 30; juzNumber++) {
      let startPage: number;
      let endPage: number;

      if (juzNumber === 1) {
        // الجزء الأول: 22 صفحة (1-22)
        startPage = 1;
        endPage = 22;
      } else if (juzNumber === 30) {
        // الجزء الثلاثون: 22 صفحة (583-604)
        startPage = 583;
        endPage = 604;
      } else {
        // الأجزاء 2-29: كل جزء 20 صفحة
        startPage = 22 + (juzNumber - 2) * 20 + 1;
        endPage = startPage + 19;
      }

      const juzPages = pages.filter(page => page.id >= startPage && page.id <= endPage);

      sections.push({
        id: juzNumber,
        name: `الجزء ${juzNumber}`,
        startPage,
        endPage,
        pages: juzPages,
      });
    }

    return sections;
  };

  const juzSections = createJuzSections();

  const toggleJuz = (juzId: number) => {
    const newExpanded = new Set(expandedJuz);
    if (newExpanded.has(juzId)) {
      newExpanded.delete(juzId);
    } else {
      newExpanded.add(juzId);
    }
    setExpandedJuz(newExpanded);
  };

  const getPageColor = (page: QuranPage) => {
    // Show different colors based on active tab and page status
    switch (activeTab) {
      case 'read':
        if (page.isRead) return themeColors.quranRead;
        break;
      case 'memorized':
        if (page.isMemorized) return themeColors.quranMemorized;
        break;
      case 'revised':
        if (page.isRevised) return themeColors.quranRevised;
        break;
    }

    // Default color for unset pages
    return themeColors.card;
  };

  const getTextColor = (page: QuranPage) => {
    // Show white text on colored backgrounds
    switch (activeTab) {
      case 'read':
        if (page.isRead) return '#FFFFFF';
        break;
      case 'memorized':
        if (page.isMemorized) return '#FFFFFF';
        break;
      case 'revised':
        if (page.isRevised) return '#FFFFFF';
        break;
    }

    return themeColors.text;
  };

  const getJuzStats = (juz: JuzSection) => {
    let count = 0;
    juz.pages.forEach(page => {
      switch (activeTab) {
        case 'read':
          if (page.isRead) count++;
          break;
        case 'memorized':
          if (page.isMemorized) count++;
          break;
        case 'revised':
          if (page.isRevised) count++;
          break;
      }
    });
    return count;
  };

  const renderPage = (page: QuranPage) => (
    <TouchableOpacity
      key={page.id}
      style={[
        styles.pageItem,
        {
          backgroundColor: getPageColor(page),
          borderColor: themeColors.border,
        },
      ]}
      onPress={() => onPagePress(page)}
      activeOpacity={0.7}
    >
      <StyledText
        variant="caption"
        color={getTextColor(page)}
        centered
      >
        {page.id}
      </StyledText>
    </TouchableOpacity>
  );

  const renderJuzSection = (juz: JuzSection) => {
    const isExpanded = expandedJuz.has(juz.id);
    const stats = getJuzStats(juz);
    const totalPages = juz.pages.length;

    return (
      <View key={juz.id} style={[styles.juzContainer, { borderColor: themeColors.border }]}>
        <TouchableOpacity
          style={[styles.juzHeader, { backgroundColor: themeColors.card }]}
          onPress={() => toggleJuz(juz.id)}
          activeOpacity={0.7}
        >
          <View style={styles.juzHeaderContent}>
            <View style={styles.juzTitleContainer}>
              <StyledText variant="h3" style={styles.juzTitle}>
                {juz.name}
              </StyledText>
              <StyledText variant="caption" color={themeColors.subtext}>
                الصفحات {juz.startPage} - {juz.endPage}
              </StyledText>
            </View>

            <View style={styles.juzStatsContainer}>
              <View style={[styles.statsChip, { backgroundColor: getStatsChipColor() }]}>
                <StyledText variant="caption" color="#FFFFFF">
                  {stats}/{totalPages}
                </StyledText>
              </View>

              {isExpanded ? (
                <ChevronUp size={20} color={themeColors.subtext} />
              ) : (
                <ChevronDown size={20} color={themeColors.subtext} />
              )}
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.pagesContainer}>
            <View style={styles.pagesGrid}>
              {juz.pages.map(renderPage)}
            </View>
          </View>
        )}
      </View>
    );
  };

  const getStatsChipColor = () => {
    switch (activeTab) {
      case 'read':
        return themeColors.quranRead;
      case 'memorized':
        return themeColors.quranMemorized;
      case 'revised':
        return themeColors.quranRevised;
      default:
        return themeColors.primary;
    }
  };

  return (
    <View style={styles.container}>
      {juzSections.map(renderJuzSection)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  juzContainer: {
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  juzHeader: {
    padding: 12,
  },
  juzHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  juzTitleContainer: {
    flex: 1,
  },
  juzTitle: {
    marginBottom: 2,
  },
  juzStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  pagesContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  pagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 6,
  },
  pageItem: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
