import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { StyledText } from '@/components/StyledText';
import { ProgressBar } from '@/components/ProgressBar';
import { QuranPageGrid } from '@/components/QuranPageGrid';
import { useQuranStore } from '@/store/quranStore';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/constants/colors';
import { QuranPage } from '@/types';
import { BookOpen, BookMarked, RefreshCw, Eye } from 'lucide-react-native';

export default function QuranScreen() {
  const { settings } = useSettingsStore();
  const {
    pages,
    updatePageRead,
    updatePageMemorized,
    updatePageRevised,
    getStats,
    initializePages,
    getReadPages,
    getMemorizedPages,
    getRevisedPages
  } = useQuranStore();
  const [selectedPage, setSelectedPage] = useState<QuranPage | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'read' | 'memorized' | 'revised'>('read');

  const themeColors = colors[settings.theme];

  const stats = getStats();

  useEffect(() => {
    if (pages.length === 0) {
      initializePages();
    }
  }, [pages.length, initializePages]);

  const handlePagePress = (page: QuranPage) => {
    setSelectedPage(page);
    setModalVisible(true);
  };

  const handleUpdateRead = (isRead: boolean) => {
    if (selectedPage) {
      updatePageRead(selectedPage.id, isRead);
      setModalVisible(false);
    }
  };

  const handleUpdateMemorized = (isMemorized: boolean) => {
    if (selectedPage) {
      updatePageMemorized(selectedPage.id, isMemorized);
      setModalVisible(false);
    }
  };

  const handleUpdateRevised = (isRevised: boolean) => {
    if (selectedPage) {
      updatePageRevised(selectedPage.id, isRevised);
      setModalVisible(false);
    }
  };

  // Get filtered pages based on active tab
  const getFilteredPages = () => {
    switch (activeTab) {
      case 'read':
        return pages; // Show all pages, colored based on read status
      case 'memorized':
        return pages; // Show all pages, colored based on memorized status
      case 'revised':
        return getMemorizedPages(); // Only show memorized pages for revision
      default:
        return pages;
    }
  };

  const filteredPages = getFilteredPages();

  // Get modal content based on active tab and current page status
  const getModalContent = () => {
    if (!selectedPage) return null;

    switch (activeTab) {
      case 'read':
        return {
          title: selectedPage.isRead ? 'إلغاء التلاوة' : 'تسجيل التلاوة',
          action: () => handleUpdateRead(!selectedPage.isRead),
          actionColor: themeColors.quranRead,
          icon: <Eye size={24} color="#FFFFFF" />,
        };
      case 'memorized':
        return {
          title: selectedPage.isMemorized ? 'إلغاء الحفظ' : 'تسجيل الحفظ',
          action: () => handleUpdateMemorized(!selectedPage.isMemorized),
          actionColor: themeColors.quranMemorized,
          icon: <BookMarked size={24} color="#FFFFFF" />,
        };
      case 'revised':
        return {
          title: selectedPage.isRevised ? 'إلغاء المراجعة' : 'تسجيل المراجعة',
          action: () => handleUpdateRevised(!selectedPage.isRevised),
          actionColor: themeColors.quranRevised,
          icon: <RefreshCw size={24} color="#FFFFFF" />,
        };
      default:
        return null;
    }
  };

  const modalContent = getModalContent();

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <StyledText variant="h1">متتبع القرآن</StyledText>
          <StyledText variant="body" color={themeColors.subtext} style={styles.subtitle}>
            تتبع تقدمك في القراءة والحفظ والمراجعة
          </StyledText>
        </View>

        <View style={[styles.statsContainer, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: themeColors.quranRead }]}>
              <Eye size={20} color="#FFFFFF" />
            </View>
            <StyledText variant="h2">{stats.totalRead}</StyledText>
            <StyledText variant="caption" color={themeColors.subtext}>صفحة مقروءة</StyledText>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: themeColors.quranMemorized }]}>
              <BookMarked size={20} color="#FFFFFF" />
            </View>
            <StyledText variant="h2">{stats.totalMemorized}</StyledText>
            <StyledText variant="caption" color={themeColors.subtext}>صفحة محفوظة</StyledText>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: themeColors.quranRevised }]}>
              <RefreshCw size={20} color="#FFFFFF" />
            </View>
            <StyledText variant="h2">{stats.totalRevised}</StyledText>
            <StyledText variant="caption" color={themeColors.subtext}>صفحة مراجعة</StyledText>
          </View>
        </View>

        <View style={styles.progressSection}>
          <StyledText variant="h3">التقدم العام</StyledText>
          <View style={styles.progressContainer}>
            <ProgressBar progress={stats.completionPercentage} height={12} />
            <StyledText variant="caption" color={themeColors.subtext} style={styles.progressText}>
              {stats.completionPercentage.toFixed(1)}% مكتمل
            </StyledText>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'read' && [styles.activeTab, { backgroundColor: themeColors.quranRead }],
            ]}
            onPress={() => setActiveTab('read')}
          >
            <Eye size={16} color={activeTab === 'read' ? '#FFFFFF' : themeColors.subtext} />
            <StyledText
              variant="button"
              color={activeTab === 'read' ? '#FFFFFF' : themeColors.subtext}
              style={styles.tabText}
            >
              التلاوة
            </StyledText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'memorized' && [styles.activeTab, { backgroundColor: themeColors.quranMemorized }],
            ]}
            onPress={() => setActiveTab('memorized')}
          >
            <BookMarked size={16} color={activeTab === 'memorized' ? '#FFFFFF' : themeColors.subtext} />
            <StyledText
              variant="button"
              color={activeTab === 'memorized' ? '#FFFFFF' : themeColors.subtext}
              style={styles.tabText}
            >
              الحفظ
            </StyledText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'revised' && [styles.activeTab, { backgroundColor: themeColors.quranRevised }],
            ]}
            onPress={() => setActiveTab('revised')}
          >
            <RefreshCw size={16} color={activeTab === 'revised' ? '#FFFFFF' : themeColors.subtext} />
            <StyledText
              variant="button"
              color={activeTab === 'revised' ? '#FFFFFF' : themeColors.subtext}
              style={styles.tabText}
            >
              المراجعة
            </StyledText>
          </TouchableOpacity>
        </View>

        <View style={styles.gridSection}>
          <StyledText variant="h3" style={styles.gridTitle}>
            {activeTab === 'read' && 'صفحات التلاوة'}
            {activeTab === 'memorized' && 'صفحات الحفظ'}
            {activeTab === 'revised' && 'صفحات المراجعة'}
          </StyledText>
          <StyledText variant="caption" color={themeColors.subtext} style={styles.gridSubtitle}>
            {activeTab === 'read' && 'اضغط على الصفحة لتحديدها كمقروءة'}
            {activeTab === 'memorized' && 'اضغط على الصفحة لتحديدها كمحفوظة'}
            {activeTab === 'revised' && 'اضغط على الصفحة لتحديدها كمراجعة (الصفحات المحفوظة فقط)'}
          </StyledText>

          <QuranPageGrid
            pages={filteredPages}
            onPagePress={handlePagePress}
            activeTab={activeTab}
          />
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
            <StyledText variant="h2" centered style={styles.modalTitle}>
              الصفحة {selectedPage?.id}
            </StyledText>

            <StyledText variant="body" color={themeColors.subtext} centered style={styles.modalSubtitle}>
              {activeTab === 'read' && 'تحديث حالة التلاوة'}
              {activeTab === 'memorized' && 'تحديث حالة الحفظ'}
              {activeTab === 'revised' && 'تحديث حالة المراجعة'}
            </StyledText>

            {selectedPage && activeTab === 'revised' && !selectedPage.isMemorized && (
              <View style={[styles.warningContainer, { backgroundColor: themeColors.warning + '20', borderColor: themeColors.warning }]}>
                <StyledText variant="caption" color={themeColors.warning} centered>
                  يجب حفظ الصفحة أولاً قبل تسجيل المراجعة
                </StyledText>
              </View>
            )}

            <View style={styles.modalButtons}>
              {modalContent && (selectedPage?.isMemorized || activeTab !== 'revised') && (
                <TouchableOpacity
                  style={[styles.statusButton, { backgroundColor: modalContent.actionColor }]}
                  onPress={modalContent.action}
                >
                  {modalContent.icon}
                  <StyledText variant="button" color="#FFFFFF" style={styles.statusButtonText}>
                    {modalContent.title}
                  </StyledText>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: themeColors.border }]}
              onPress={() => setModalVisible(false)}
            >
              <StyledText variant="button" color={themeColors.subtext}>
                إلغاء
              </StyledText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  subtitle: {
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressText: {
    marginTop: 8,
    textAlign: 'right',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    marginLeft: 8,
  },
  gridSection: {
    marginBottom: 16,
  },
  gridTitle: {
    marginBottom: 4,
  },
  gridSubtitle: {
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '90%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    marginBottom: 8,
  },
  modalSubtitle: {
    marginBottom: 24,
  },
  warningContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    width: '100%',
  },
  modalButtons: {
    width: '100%',
    marginBottom: 16,
    gap: 12,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  statusButtonText: {
    marginLeft: 8,
  },
  cancelButton: {
    width: '100%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
});
