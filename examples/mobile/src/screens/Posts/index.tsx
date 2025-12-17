import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PostCard } from './post-card';
import { styles } from './styles';
import { useStore } from '../../stores/hooks';

type Group = 'fresh' | 'archived';

export const PostsScreen = observer(() => {
  const { top } = useSafeAreaInsets();
  const { lists, fetchPosts, fetchMorePosts } = useStore('posts');
  const [group, setGroup] = useState<Group>('fresh');

  const collection = lists[group];
  const fetchState = fetchPosts[group];

  useEffect(() => {
    fetchState.run({ params: { group } });
  }, [group, fetchState]);

  const isInitialLoading = fetchState.isLoading && collection.isEmpty;

  const isLoadingMore = fetchMorePosts[group].isLoading;

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <Text style={styles.screenTitle}>Posts pagination</Text>

      <View style={styles.tabs}>
        <Pressable
          onPress={() => setGroup('fresh')}
          style={[styles.tab, group === 'fresh' && styles.tabActive]}
        >
          <Text style={styles.tabText}>Fresh</Text>
        </Pressable>

        <Pressable
          onPress={() => setGroup('archived')}
          style={[styles.tab, group === 'archived' && styles.tabActive]}
        >
          <Text style={styles.tabText}>Archived</Text>
        </Pressable>
      </View>
      {isInitialLoading && <Text style={styles.loading}>Loading…</Text>}
      {!isInitialLoading && (
        <FlatList
          key={group}
          data={collection.getList}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.column}>
              <PostCard post={item} type={group} />
            </View>
          )}
          onEndReached={() => {
            if (!collection.hasNoMore) {
              fetchMorePosts[group].run({ params: { group } });
            }
          }}
          onEndReachedThreshold={0.6}
          ListFooterComponent={
            isLoadingMore ? <Text style={styles.loading}>Loading…</Text> : null
          }
        />
      )}
    </View>
  );
});
