import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../core/theme/colors';
export function InfoRow({ label, value }: { label: string; value: string }) { return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>; }
const styles = StyleSheet.create({ row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.border }, label: { color: colors.muted, fontSize: 14 }, value: { color: colors.text, fontWeight: '600', fontSize: 14, maxWidth: '60%', textAlign: 'right' } });
