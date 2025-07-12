import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { StyledText } from './StyledText';
import { colors } from '@/constants/colors';
import { useSettingsStore } from '@/store/settingsStore';
import { QuranPage } from '@/types';

interface QuranPageGridProps {
  pages: QuranPage[];
  onPagePress: (page: QuranPage) => void;
  activeTab: 'read' | 'memorized' | 'revised';
}

export function QuranPageGrid({ pages, onPagePress, activeTab }: QuranPageGridProps) {
  const { settings } = useSettingsStore();
  const theme = settings.theme === 'system' ? 'light' : settings.theme;
  const themeColors = colors[theme];
  
  const getPageColor = (page: QuranPage) => {
    // Show different colors based on active tab and page status
    switch (activeTab) {
      case 'read':
        if (page.status === 'read') return themeColors.quranRead;
        break;
      case 'memorized':
        if (page.status === 'memorized') return themeColors.quranMemorized;
        break;
      case 'revised':
        if (page.status === 'revised') return themeColors.quranRevised;
        break;
    }
    
    // Default color for unset pages
    return themeColors.card;
  };
  
  const getTextColor = (page: QuranPage) => {
    // Show white text on colored backgrounds
    switch (activeTab) {
      case 'read':
        if (page.status === 'read') return '#FFFFFF';
        break;
      case 'memorized':
        if (page.status === 'memorized') return '#FFFFFF';
        break;
      case 'revised':
        if (page.status === 'revised') return '#FFFFFF';
        break;
    }
    
    return themeColors.text;
  };
  
  const renderPage = ({ item }: { item: QuranPage }) => (
    <TouchableOpacity
      style={[
        styles.pageItem,
        {
          backgroundColor: getPageColor(item),
          borderColor: themeColors.border,
        },
      ]}
      onPress={() => onPagePress(item)}
      activeOpacity={0.7}
    >
      <StyledText
        variant="caption"
        color={getTextColor(item)}
        centered
      >
        {item.id}
      </StyledText>
    </TouchableOpacity>
  );
  
  return (
    <FlatList
      data={pages}
      renderItem={renderPage}
      keyExtractor={(item) => item.id.toString()}
      numColumns={6}
      contentContainerStyle={styles.container}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  pageItem: {
    width: 48,
    height: 48,
    margin: 4,
    borderRadius: 12,
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