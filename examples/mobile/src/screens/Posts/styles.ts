import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0F12',
    paddingTop: 16,
  },

  screenTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F2F2F2',
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#1A1C22',
    color: '#B0B3C0',
  },

  tabActive: {
    backgroundColor: '#2D6BFF',
    color: '#FFFFFF',
    fontWeight: '500',
  },

  list: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },

  row: {
    gap: 12,
  },

  card: {
    flex: 1,
    backgroundColor: '#1A1C22',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  cardTitle: {
    color: '#EDEEF3',
    fontWeight: '600',
    marginBottom: 6,
  },

  meta: {
    fontSize: 12,
    color: '#B0B3C0',
    marginTop: 4,
  },

  bold: {
    color: '#EDEEF3',
    fontWeight: '500',
  },

  loading: {
    textAlign: 'center',
    color: '#B0B3C0',
    marginVertical: 16,
  },

  column: {
    flex: 1,
    paddingHorizontal: 6,
  },

  tabText: {
    color: '#B0B3C0',
  },
});
