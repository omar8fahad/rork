import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { StyledText } from './StyledText';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/constants/colors';
import { Calendar } from 'lucide-react-native';
import { formatDateByCalendar } from '@/utils/hijriUtils';
import { useColorScheme } from 'react-native';

interface DateDisplayProps {
  date: Date;
  showIcon?: boolean;
  onPress?: () => void;
  variant?: 'body' | 'caption';
}

export function DateDisplay({ date, showIcon = true, onPress, variant = 'caption' }: DateDisplayProps) {
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

  const formattedDate = formatDateByCalendar(date, settings.calendarType);

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.container, onPress && styles.pressable]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {showIcon && <Calendar size={16} color={themeColors.primary} />}
      <StyledText variant={variant} color={themeColors.subtext} style={styles.text}>
        {formattedDate}
      </StyledText>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressable: {
    padding: 4,
    borderRadius: 4,
  },
  text: {
    marginLeft: 8,
  },
});
