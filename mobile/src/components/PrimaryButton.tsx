import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../core/theme/colors';
export function PrimaryButton({ title, onPress, loading, disabled }: { title: string; onPress: () => void; loading?: boolean; disabled?: boolean }) {
  return <Pressable onPress={onPress} disabled={disabled || loading} style={({ pressed }) => [styles.button, (disabled || loading) && styles.disabled, pressed && styles.pressed]}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>{title}</Text>}</Pressable>;
}
const styles = StyleSheet.create({ button: { backgroundColor: colors.primary, borderRadius: 13, paddingVertical: 15, alignItems: 'center', marginTop: 14 }, disabled: { opacity: 0.55 }, pressed: { opacity: 0.85 }, text: { color: '#fff', fontSize: 16, fontWeight: '700' } });
