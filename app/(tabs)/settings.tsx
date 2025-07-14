import { useState } from 'react';
import { View, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, Platform } from 'react-native';
import { StyledText } from '@/components/StyledText';
import { useSettingsStore } from '@/store/settingsStore';
import { colors, themeNames, ThemeName } from '@/constants/colors';
import { useColorScheme } from 'react-native';
import { Moon, Sun, Smartphone, Bell, Database, ArrowUpDown, Calendar, Palette } from 'lucide-react-native';
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

  // Determine the active theme
  const getActiveTheme = () => {
    if (settings.theme === 'system') {
      return colorScheme || 'light';
    }
    return settings.theme;
  };

  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme as keyof typeof colors] || colors.light;

  const themes = [
    { id: 'light', name: themeNames.light, icon: Sun },
    { id: 'dark', name: themeNames.dark, icon: Moon },
    { id: 'system', name: 'تلقائي', icon: Smartphone },
    { id: 'andalusianMosaic', name: themeNames.andalusianMosaic, icon: Palette },
    { id: 'qiblaLines', name: themeNames.qiblaLines, icon: Palette },
    { id: 'palmBreeze', name: themeNames.palmBreeze, icon: Palette },
    { id: 'andalusianNights', name: themeNames.andalusianNights, icon: Palette },
    { id: 'desertDawn', name: themeNames.desertDawn, icon: Palette },
  ];

  const accentColors = [
    { name: 'بنفسجي', value: colors.light.primary },
    { name: 'أخضر', value: colors.light.success },
    { name: 'أصفر', value: colors.light.warning },
    { name: 'أحمر', value: colors.light.error },
    { name: 'وردي', value: colors.light.pink },
    { name: 'برتقالي', value: colors.light.orange },
    { name: 'سماوي', value: colors.light.cyan },
    { name: 'بنفسجي فاتح', value: colors.light.violet },
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
    const theme = colors[themeName as keyof typeof colors] || colors.light;
    return [theme.primary, theme.secondary, theme.success];
  };

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

        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          {themes.map((theme, index) => {
            const IconComponent = theme.icon;
            const previewColors = getThemePreviewColors(theme.id);

            return (
              <View key={theme.id}>
                <TouchableOpacity
                  style={styles.themeItem}
                  onPress={() => setTheme(theme.id as any)}
                >
                  <View style={styles.themeInfo}>
                    <View style={styles.themeHeader}>
                      <IconComponent size={20} color={themeColors.text} style={styles.themeIcon} />
                      <StyledText variant="body">{theme.name}</StyledText>
                    </View>

                    <View style={styles.themePreview}>
                      {previewColors.map((color, colorIndex) => (
                        <View
                          key={colorIndex}
                          style={[styles.previewColor, { backgroundColor: color }]}
                        />
                      ))}
                    </View>
                  </View>

                  <View
                    style={[
                      styles.radioButton,
                      settings.theme === theme.id && { borderColor: themeColors.primary },
                    ]}
                  >
                    {settings.theme === theme.id && (
                      <View
                        style={[styles.radioButtonInner, { backgroundColor: themeColors.primary }]}
                      />
                    )}
                  </View>
                </TouchableOpacity>
                {index < themes.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
                )}
              </View>
            );
          })}
        </View>

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
            <StyledText variant="body" color={colors.light.error}>
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
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  themeInfo: {
    flex: 1,
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  themeIcon: {
    marginRight: 12,
  },
  themePreview: {
    flexDirection: 'row',
    gap: 4,
  },
  previewColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
