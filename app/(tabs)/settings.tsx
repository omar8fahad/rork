import { useState } from 'react';
import { View, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, Platform } from 'react-native';
import { StyledText } from '@/components/StyledText';
import { useSettingsStore } from '@/store/settingsStore';
import { colors, themeNames, ThemeName } from '@/constants/colors';
import { useColorScheme } from 'react-native';
import { Bell, Database, ArrowUpDown, Calendar, Palette } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const {
    settings,
    setTheme,
    setAccentColor,
    setFontSize,
    setCalendarType,
    toggleNotifications,
    setDailyReminderTime
  } = useSettingsStore();

  const themeColors = colors[settings.theme as keyof typeof colors] || colors.andalusianMosaic;

  // تجميع الهويات البصرية
  const dayThemes = [
    { id: 'andalusianMosaic', name: themeNames.andalusianMosaic },
    { id: 'qiblaLines', name: themeNames.qiblaLines },
    { id: 'palmBreeze', name: themeNames.palmBreeze },
    { id: 'andalusianNights', name: themeNames.andalusianNights },
    { id: 'desertDawn', name: themeNames.desertDawn },
  ];

  const nightThemes = [
    { id: 'twilightMagic', name: themeNames.twilightMagic },
    { id: 'moonGlow', name: themeNames.moonGlow },
    { id: 'desertNights', name: themeNames.desertNights },
    { id: 'forestShadows', name: themeNames.forestShadows },
    { id: 'nightWaves', name: themeNames.nightWaves },
  ];

  // ألوان التمييز المحدثة مع ألوان من الهويات البصرية
  const accentColors = [
    // الألوان الأساسية
    { name: 'بنفسجي', value: '#6366F1' },
    { name: 'أخضر', value: '#10B981' },
    { name: 'أصفر', value: '#F59E0B' },
    { name: 'أحمر', value: '#EF4444' },
    { name: 'وردي', value: '#EC4899' },
    { name: 'برتقالي', value: '#F97316' },
    { name: 'سماوي', value: '#06B6D4' },
    { name: 'بنفسجي فاتح', value: '#7C3AED' },

    // ألوان من الهويات النهارية
    { name: 'أزرق فينيق', value: colors.andalusianMosaic.primary },
    { name: 'فيروزي فاتح', value: colors.andalusianMosaic.secondary },
    { name: 'ذهبي باهت', value: colors.andalusianMosaic.warning },
    { name: 'أخضر مسجدي', value: colors.qiblaLines.primary },
    { name: 'أخضر نعناعي', value: colors.qiblaLines.secondary },
    { name: 'بني رطب', value: colors.palmBreeze.primary },
    { name: 'أخضر نخلي', value: colors.palmBreeze.secondary },
    { name: 'أصفر رطب', value: colors.palmBreeze.warning },
    { name: 'أزرق سمائي', value: colors.andalusianNights.primary },
    { name: 'بنفسجي هادئ', value: colors.andalusianNights.secondary },
    { name: 'برتقالي شروق', value: colors.desertDawn.primary },
    { name: 'وردي شاحب', value: colors.desertDawn.secondary },
    { name: 'بني رملي', value: colors.desertDawn.success },

    // ألوان من الهويات الليلية
    { name: 'ليلكي بارد', value: colors.twilightMagic.primary },
    { name: 'رمادي دخاني', value: colors.twilightMagic.secondary },
    { name: 'فضي قمري', value: colors.moonGlow.primary },
    { name: 'أزرق فحمي', value: colors.moonGlow.secondary },
    { name: 'برتقالي غروب', value: colors.desertNights.primary },
    { name: 'ستيل رمادي', value: colors.desertNights.secondary },
    { name: 'أخضر فسفوري', value: colors.forestShadows.primary },
    { name: 'رمادي زيتي', value: colors.forestShadows.secondary },
    { name: 'فيروزي عميق', value: colors.nightWaves.primary },
    { name: 'أزرق بحري', value: colors.nightWaves.secondary },
  ];

  const fontSizes = [
    { name: 'صغير', value: 14 },
    { name: 'متوسط', value: 16 },
    { name: 'كبير', value: 18 },
    { name: 'كبير جداً', value: 20 },
  ];

  const calendarTypes = [
    { name: 'ميلادي', value: 'gregorian' as const },
    { name: 'هجري', value: 'hijri' as const },
  ];

  const handleExportData = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const allData = await AsyncStorage.multiGet(allKeys);
      const dataObject = allData.reduce((result: Record<string, any>, [key, value]) => {
        if (value) {
          result[key] = JSON.parse(value);
        }
        return result;
      }, {});

      const dataString = JSON.stringify(dataObject, null, 2);

      if (Platform.OS === 'web') {
        // For web, create a download link
        const blob = new Blob([dataString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'routine-tracker-backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // For mobile, show a success message
        Alert.alert(
          'تم التصدير بنجاح',
          'تم تصدير البيانات بنجاح. في التطبيق الحقيقي، سيتم حفظها في ملف أو مشاركتها.',
          [{ text: 'موافق' }]
        );
      }
    } catch (error) {
      Alert.alert('فشل التصدير', 'فشل في تصدير البيانات.');
      console.error(error);
    }
  };

  const handleImportData = () => {
    Alert.alert(
      'استيراد البيانات',
      'هذا سيسمح لك بتحديد ملف نسخة احتياطية لاستعادة بياناتك. في التطبيق الحقيقي، سيتم استخدام منتقي الملفات.',
      [{ text: 'موافق' }]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'إعادة تعيين جميع البيانات',
      'سيؤدي هذا إلى حذف جميع روتيناتك ومهامك وتقدم القرآن وبيانات الكتب. لا يمكن التراجع عن هذا الإجراء.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'إعادة تعيين',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('نجح', 'تم إعادة تعيين جميع البيانات. يرجى إعادة تشغيل التطبيق.');
            } catch (error) {
              Alert.alert('خطأ', 'فشل في إعادة تعيين البيانات.');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const getThemePreviewColors = (themeName: string) => {
    const theme = colors[themeName as keyof typeof colors] || colors.andalusianMosaic;
    return [theme.primary, theme.secondary, theme.success];
  };

  const renderThemeSection = (themes: any[], title: string) => (
    <View style={styles.themeSection}>
      <StyledText variant="h3" style={styles.subsectionTitle}>
        {title}
      </StyledText>

      <View style={styles.themesGrid}>
        {themes.map((theme) => {
          const previewColors = getThemePreviewColors(theme.id);

          return (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.themeCard,
                {
                  backgroundColor: themeColors.card,
                  borderColor: settings.theme === theme.id ? themeColors.primary : themeColors.border,
                  borderWidth: settings.theme === theme.id ? 2 : 1,
                },
              ]}
              onPress={() => setTheme(theme.id as any)}
              activeOpacity={0.7}
            >
              <View style={styles.themePreview}>
                {previewColors.map((color, colorIndex) => (
                  <View
                    key={colorIndex}
                    style={[styles.previewColor, { backgroundColor: color }]}
                  />
                ))}
              </View>

              <StyledText variant="caption" numberOfLines={2} style={styles.themeName}>
                {theme.name}
              </StyledText>

              {settings.theme === theme.id && (
                <View
                  style={[styles.selectedIndicator, { backgroundColor: themeColors.primary }]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <StyledText variant="h1">الإعدادات</StyledText>
        <StyledText variant="body" color={themeColors.subtext} style={styles.subtitle}>
          تخصيص تجربة التطبيق
        </StyledText>
      </View>

      <View style={styles.section}>
        <StyledText variant="h2" style={styles.sectionTitle}>
          الهوية البصرية
        </StyledText>

        {renderThemeSection(dayThemes, 'الهويات النهارية')}
        {renderThemeSection(nightThemes, 'الهويات الليلية')}

        <StyledText variant="h3" style={styles.subsectionTitle}>
          لون التمييز
        </StyledText>

        <View style={styles.colorOptions}>
          {accentColors.map((color) => (
            <TouchableOpacity
              key={color.name}
              style={[
                styles.colorOption,
                { backgroundColor: color.value },
                settings.accentColor === color.value && styles.selectedColorOption,
              ]}
              onPress={() => setAccentColor(color.value)}
            />
          ))}
        </View>

        <StyledText variant="h3" style={styles.subsectionTitle}>
          حجم الخط
        </StyledText>

        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          {fontSizes.map((size, index) => (
            <View key={size.name}>
              <View style={styles.settingItem}>
                <StyledText variant="body">{size.name}</StyledText>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    settings.fontSize === size.value && {
                      borderColor: themeColors.primary,
                    },
                  ]}
                  onPress={() => setFontSize(size.value)}
                >
                  {settings.fontSize === size.value && (
                    <View
                      style={[styles.radioButtonInner, { backgroundColor: themeColors.primary }]}
                    />
                  )}
                </TouchableOpacity>
              </View>
              {index < fontSizes.length - 1 && (
                <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
              )}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <StyledText variant="h2" style={styles.sectionTitle}>
          التقويم
        </StyledText>

        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          {calendarTypes.map((calendar, index) => (
            <View key={calendar.value}>
              <View style={styles.settingItem}>
                <View style={styles.settingLabelContainer}>
                  <Calendar size={20} color={themeColors.text} style={styles.settingIcon} />
                  <StyledText variant="body">{calendar.name}</StyledText>
                </View>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    settings.calendarType === calendar.value && {
                      borderColor: themeColors.primary,
                    },
                  ]}
                  onPress={() => setCalendarType(calendar.value)}
                >
                  {settings.calendarType === calendar.value && (
                    <View
                      style={[styles.radioButtonInner, { backgroundColor: themeColors.primary }]}
                    />
                  )}
                </TouchableOpacity>
              </View>
              {index < calendarTypes.length - 1 && (
                <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
              )}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <StyledText variant="h2" style={styles.sectionTitle}>
          الإشعارات
        </StyledText>

        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Bell size={20} color={themeColors.text} style={styles.settingIcon} />
              <StyledText variant="body">تفعيل الإشعارات</StyledText>
            </View>
            <Switch
              value={settings.notifications.enabled}
              onValueChange={(value) => toggleNotifications(value)}
              trackColor={{ false: themeColors.border, true: themeColors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              // In a real app, this would open a time picker
              Alert.alert(
                'تحديد وقت التذكير',
                'هذا سيفتح منتقي الوقت لتحديد وقت التذكير اليومي.',
                [{ text: 'موافق' }]
              );
            }}
          >
            <StyledText variant="body">وقت التذكير اليومي</StyledText>
            <View style={styles.settingValue}>
              <StyledText variant="body" color={themeColors.primary}>
                {settings.notifications.dailyReminderTime}
              </StyledText>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <StyledText variant="h2" style={styles.sectionTitle}>
          إدارة البيانات
        </StyledText>

        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
            <View style={styles.settingLabelContainer}>
              <ArrowUpDown size={20} color={themeColors.text} style={styles.settingIcon} />
              <StyledText variant="body">تصدير البيانات</StyledText>
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

          <TouchableOpacity style={styles.settingItem} onPress={handleImportData}>
            <View style={styles.settingLabelContainer}>
              <Database size={20} color={themeColors.text} style={styles.settingIcon} />
              <StyledText variant="body">استيراد البيانات</StyledText>
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

          <TouchableOpacity style={styles.settingItem} onPress={handleResetData}>
            <StyledText variant="body" color="#EF4444">
              إعادة تعيين جميع البيانات
            </StyledText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <StyledText variant="caption" color={themeColors.subtext} centered>
          متتبع الروتين اليومي الإصدار 1.0.0
        </StyledText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    marginBottom: 8,
  },
  subtitle: {
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  subsectionTitle: {
    marginTop: 16,
    marginBottom: 12,
  },
  themeSection: {
    marginBottom: 16,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeCard: {
    width: 80,
    height: 80,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  themePreview: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  previewColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  themeName: {
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 12,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 16,
    gap: 8,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    margin: 2,
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
});
