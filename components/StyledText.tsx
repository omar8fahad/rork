import { Text, TextProps, StyleSheet } from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { useMemo } from 'react';

interface StyledTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'button';
  color?: string;
  centered?: boolean;
}

export function StyledText({
  variant = 'body',
  color,
  centered,
  style,
  ...props
}: StyledTextProps) {
  const { settings } = useSettingsStore();
  
  const textStyle = useMemo(() => {
    const baseSize = settings.fontSize;
    
    const variantStyles = {
      h1: { fontSize: baseSize * 1.75, fontWeight: '700' },
      h2: { fontSize: baseSize * 1.5, fontWeight: '600' },
      h3: { fontSize: baseSize * 1.25, fontWeight: '600' },
      body: { fontSize: baseSize, fontWeight: '400' },
      caption: { fontSize: baseSize * 0.875, fontWeight: '400' },
      button: { fontSize: baseSize, fontWeight: '600' },
    };
    
    return [
      styles.text,
      variantStyles[variant],
      color && { color },
      centered && styles.centered,
      style,
    ];
  }, [variant, color, centered, style, settings.fontSize]);

  return <Text style={textStyle} {...props} />;
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'System',
  },
  centered: {
    textAlign: 'center',
  },
});