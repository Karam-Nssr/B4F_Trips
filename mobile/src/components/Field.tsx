import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '../core/theme/colors';
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={styles.wrap}><Text style={styles.label}>{label}</Text><TextInput placeholderTextColor={colors.muted} style={styles.input} {...props} /></View>;
}
const styles = StyleSheet.create({ wrap: { marginBottom: 14 }, label: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 7 }, input: { borderWidth: 1, borderColor: colors.border, borderRadius: 11, backgroundColor: '#fff', paddingHorizontal: 13, paddingVertical: 12, fontSize: 15, color: colors.text } });
