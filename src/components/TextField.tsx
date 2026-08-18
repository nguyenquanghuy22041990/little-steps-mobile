import React, { useState } from 'react';
import { 
  TextInput, 
  TextInputProps, 
  View, 
  StyleSheet, 
  Platform 
} from 'react-native';
import { colors, radius, spacing } from '../theme';
import { Typography } from './Typography';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  error,
  style,
  onFocus,
  onBlur,
  editable = true,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur && onBlur(e);
  };

  const getBorderColor = () => {
    if (error) return colors.error;
    if (isFocused) return colors.primary;
    return colors.border;
  };

  const getBackgroundColor = () => {
    if (!editable) return colors.warmGray100;
    return colors.surface;
  };

  return (
    <View style={styles.container}>
      {label && (
        <Typography variant="label" style={styles.label}>
          {label}
        </Typography>
      )}
      <TextInput
        style={[
          styles.input,
          {
            borderColor: getBorderColor(),
            borderWidth: isFocused ? 2 : 1,
            backgroundColor: getBackgroundColor(),
            color: !editable ? colors.textDisabled : colors.textPrimary,
          },
          style
        ]}
        placeholderTextColor={colors.textDisabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        editable={editable}
        {...props}
      />
      {error && (
        <Typography variant="caption" color={colors.error} style={styles.errorText}>
          {error}
        </Typography>
      )}
    </View>
  );
};

const fontFamily = Platform.select({ ios: 'System', android: 'Roboto', default: 'System' });

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
  input: {
    height: 48,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    fontFamily,
  },
  errorText: {
    marginTop: spacing.xs,
  }
});
