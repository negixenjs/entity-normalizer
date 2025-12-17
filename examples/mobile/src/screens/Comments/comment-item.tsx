import { View, Text, Image } from 'react-native';

import { styles } from './styles';

import type { CommentModel } from '../../stores/comments/model';

export function CommentItem({ comment }: { comment: CommentModel }) {
  const viewer = comment.viewer;

  return (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        {viewer?.avatarUrl ? (
          <Image source={{ uri: viewer.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarLetter}>{viewer?.name?.[0] ?? '?'}</Text>
          </View>
        )}

        <View style={styles.commentMeta}>
          <Text style={styles.commentAuthor}>{viewer?.name ?? 'Unknown'}</Text>

          {!!viewer?.bio && (
            <Text style={styles.commentBio} numberOfLines={1}>
              {viewer.bio}
            </Text>
          )}
        </View>
      </View>

      <Text style={styles.commentText}>{comment.text}</Text>
    </View>
  );
}
