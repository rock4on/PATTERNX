import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import {
  NeumorphicCard,
  NeumorphicButton,
  NeumorphicTextInput,
  NeumorphicChip,
  NeumorphicListItem,
} from './index';

export const ColorTestScreen: React.FC = () => {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: '#0A0A0A' }]}>
      <View style={styles.content}>
        {/* Header */}
        <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.onBackground }]}>
          🎨 Color Contrast Test
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Testing all component variants for proper readability
        </Text>

        {/* Cards Section */}
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Cards with Different Tints
        </Text>

        <NeumorphicCard intensity="medium" tint="none" style={styles.card}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            Default Card (None Tint)
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            This card uses no tint with proper white text contrast
          </Text>
        </NeumorphicCard>

        <NeumorphicCard intensity="medium" tint="primary" style={styles.card}>
          <Text variant="titleMedium" style={{ color: '#FFFFFF' }}>
            Primary Card
          </Text>
          <Text variant="bodyMedium" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Primary tinted card with white text for contrast
          </Text>
        </NeumorphicCard>

        <NeumorphicCard intensity="medium" tint="success" style={styles.card}>
          <Text variant="titleMedium" style={{ color: '#FFFFFF' }}>
            Success Card
          </Text>
          <Text variant="bodyMedium" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Success tinted card with white text
          </Text>
        </NeumorphicCard>

        {/* Buttons Section */}
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Buttons with Improved Colors
        </Text>

        <NeumorphicButton
          title="Primary Button"
          variant="primary"
          size="large"
          style={styles.button}
        />

        <NeumorphicButton
          title="Secondary Button"
          variant="secondary"
          size="large"
          style={styles.button}
        />

        <NeumorphicButton
          title="Tertiary Button"
          variant="tertiary"
          size="large"
          style={styles.button}
        />

        {/* Text Inputs Section */}
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Text Inputs
        </Text>

        <NeumorphicTextInput
          label="Default Input"
          placeholder="Type something..."
          value=""
          onChangeText={() => {}}
          style={styles.input}
        />

        <NeumorphicTextInput
          label="Success Input"
          placeholder="Valid input"
          value=""
          onChangeText={() => {}}
          variant="success"
          style={styles.input}
        />

        <NeumorphicTextInput
          label="Error Input"
          placeholder="Invalid input"
          value=""
          onChangeText={() => {}}
          variant="error"
          errorText="This field is required"
          style={styles.input}
        />

        {/* Chips Section */}
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Chips with Better Contrast
        </Text>

        <View style={styles.chipRow}>
          <NeumorphicChip label="Default" variant="default" />
          <NeumorphicChip label="Primary" variant="primary" />
          <NeumorphicChip label="Success" variant="success" />
          <NeumorphicChip label="Error" variant="error" />
          <NeumorphicChip label="Warning" variant="warning" />
        </View>

        {/* List Items Section */}
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          List Items
        </Text>

        <NeumorphicCard intensity="medium" tint="none" style={styles.card}>
          <NeumorphicListItem
            title="Default List Item"
            subtitle="With proper contrast"
            leadingIcon="account"
            variant="default"
          />
          
          <NeumorphicListItem
            title="Primary List Item"
            subtitle="With primary colors"
            leadingIcon="star"
            variant="primary"
            trailing={<NeumorphicChip label="New" variant="primary" size="small" />}
          />
          
          <NeumorphicListItem
            title="Success List Item"
            subtitle="With success indication"
            leadingIcon="check-circle"
            variant="success"
            trailing={<NeumorphicChip label="✓ Done" variant="success" size="small" />}
          />
        </NeumorphicCard>

        {/* Color Reference */}
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Color Reference
        </Text>

        <NeumorphicCard intensity="medium" tint="none" style={styles.card}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: 12 }}>
            Theme Colors
          </Text>
          
          <View style={styles.colorRow}>
            <Text style={{ color: theme.colors.onSurface }}>onSurface: </Text>
            <Text style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
              {theme.colors.onSurface}
            </Text>
          </View>
          
          <View style={styles.colorRow}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>onSurfaceVariant: </Text>
            <Text style={{ color: theme.colors.onSurfaceVariant, fontWeight: 'bold' }}>
              {theme.colors.onSurfaceVariant}
            </Text>
          </View>
          
          <View style={styles.colorRow}>
            <Text style={{ color: theme.colors.primary }}>primary: </Text>
            <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
              {theme.colors.primary}
            </Text>
          </View>
        </NeumorphicCard>

        <View style={styles.bottomSpacer} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
    marginTop: 24,
    fontWeight: '600',
  },
  card: {
    marginBottom: 16,
    padding: 16,
  },
  button: {
    marginBottom: 12,
  },
  input: {
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default ColorTestScreen;