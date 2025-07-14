import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { useSettingsStore } from '@/store/settingsStore';
import { useColorScheme } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: number;
  color?: string;
}

export function ProgressBar({
  progress,
  height = 8,
  color,
}: ProgressBarProps) {
  const { settings } = useSettingsStore();
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

  const progressColor = color || settings.accentColor || themeColors.primary;

  return (
    <View style={[styles.container, { height, backgroundColor: themeColors.border }]}>
      <View
        style={[
          styles.progress,
          {
            width: `${Math.min(Math.max(progress, 0), 100)}%`,
            backgroundColor: progressColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
  },
});
