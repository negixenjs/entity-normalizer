import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0F12',
  },

  screenTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F2F2F2',
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  postsList: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },

  postChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#1A1C22',
    marginRight: 8,
    maxWidth: 160,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  postChipActive: {
    backgroundColor: '#2D6BFF',
  },

  postChipText: {
    color: '#B0B3C0',
    fontSize: 13,
  },

  postChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },

  hint: {
    color: '#7C8090',
    textAlign: 'center',
    marginVertical: 12,
  },

  commentsList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  commentCard: {
    backgroundColor: '#1A1C22',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },

  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },

  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2D6BFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  avatarLetter: {
    color: '#fff',
    fontWeight: '600',
  },

  commentMeta: {
    flex: 1,
  },

  commentAuthor: {
    color: '#EDEEF3',
    fontWeight: '600',
    fontSize: 13,
  },

  commentBio: {
    color: '#9CA3AF',
    fontSize: 11,
  },

  commentText: {
    color: '#D6D8E0',
    fontSize: 14,
    lineHeight: 18,
  },

  loading: {
    textAlign: 'center',
    color: '#B0B3C0',
    marginVertical: 16,
  },

  empty: {
    textAlign: 'center',
    color: '#B0B3C0',
    marginTop: 24,
  },
});
