import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../core/theme/colors';
export function Screen({ children, contentStyle }: React.PropsWithChildren<{ contentStyle?: ViewStyle }>) {
  return <ScrollView style={styles.root} contentContainerStyle={[styles.content, contentStyle]} keyboardShouldPersistTaps="handled"><View>{children}</View></ScrollView>;
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.background }, content: { padding: 18, paddingBottom: 36 } });
