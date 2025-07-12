import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { useSettingsStore } from '@/store/settingsStore';

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
  const theme = settings.theme === 'system' ? 'light' : settings.theme;
  const themeColors = colors[theme];
  
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