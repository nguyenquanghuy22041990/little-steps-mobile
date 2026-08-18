import React from 'react';
import { 
  TouchableOpacity, 
  TouchableOpacityProps, 
  StyleSheet, 
  ActivityIndicator,
  View
} from 'react-native';
import { colors, spacing, radius } from '../theme';
import { Typography } from './Typography';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  ...props
}) => {
  const getBackgroundColor = () => {
    if (disabled) return colors.warmGray200;
    if (variant === 'primary') return colors.primary;
    if (variant === 'secondary') return colors.surface;
    if (variant === 'destructive') return colors.error;
    return 'transparent'; // ghost
  };

  const getBorderColor = () => {
    if (disabled) return 'transparent';
    if (variant === 'secondary') return colors.border;
    return 'transparent';
  };

  const getTextColor = () => {
    if (disabled) return colors.textDisabled;
    if (variant === 'primary' || variant === 'destructive') return colors.white;
    if (variant === 'ghost') return colors.primary;
    return colors.textPrimary; // secondary
  };

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'secondary' ? 1 : 0,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Typography variant="button" color={getTextColor()} align="center">
          {title}
        </Typography>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
