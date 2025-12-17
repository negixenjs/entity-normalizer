import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CommentItem } from './comment-item';
import { styles } from './styles';
import { useStores } from '../../stores/hooks';

import type { CommentModel } from '../../stores/comments/model';
import type { PostModel } from '../../stores/posts/model';

export const CommentsScreen = observer(() => {
  const { top } = useSafeAreaInsets();
  const {
    posts: {
      lists: {
        fresh: { getList: freshPosts },
      },
    },
    comments: { fetchComments, list },
  } = useStores();

  const [postId, setPostId] = useState<string | null>('p1');

  useEffect(() => {
    if (!postId) {
      return;
    }
    fetchComments.run({ params: { postId } });
  }, [postId, fetchComments]);

  const isInitialLoading = fetchComments.isLoading && list.isEmpty;

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <Text style={styles.screenTitle}>Comments by post</Text>

      {/* post selector */}
      <FlatList
        horizontal
        data={freshPosts}
        keyExtractor={(item: PostModel) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.postsList}
        renderItem={({ item }) => {
          const active = postId === item.id;
          return (
            <Pressable
              onPress={() => setPostId(item.id)}
              style={[styles.postChip, active && styles.postChipActive]}
            >
              <Text
                style={[
                  styles.postChipText,
                  active && styles.postChipTextActive,
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
            </Pressable>
          );
        }}
      />

      {!postId && (
        <Text style={styles.hint}>Select a post to see comments</Text>
      )}

      {isInitialLoading && <Text style={styles.loading}>Loading…</Text>}

      {!isInitialLoading && postId && (
        <FlatList
          data={list.getList}
          keyExtractor={(item: CommentModel) => item.id}
          contentContainerStyle={styles.commentsList}
          renderItem={({ item }) => <CommentItem comment={item} />}
          ListEmptyComponent={<Text style={styles.empty}>No comments</Text>}
        />
      )}
    </View>
  );
});
