import { observer } from 'mobx-react-lite';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { styles } from './styles';
import { ViewerCard } from './viewer-card';
import { useStores } from '../../stores/hooks';

export const ViewerScreen = observer(() => {
  const { top } = useSafeAreaInsets();

  const {
    viewer: {
      currentViewer,
      viewerDetails,
      fetchCurrentViewer,
      fetchViewerDetails,
    },
  } = useStores();

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <Text style={styles.screenTitle}>Viewer records</Text>

      {/* actions */}
      <View style={styles.actions}>
        <Pressable
          style={styles.actionButton}
          onPress={() => fetchCurrentViewer.run()}
        >
          <Text style={styles.actionText}>Load current viewer button</Text>
        </Pressable>

        <Pressable
          style={styles.actionButton}
          onPress={() => fetchViewerDetails.run({ params: { id: 'u2' } })}
        >
          <Text style={styles.actionText}>Load viewer u2 button</Text>
        </Pressable>

        <Pressable
          style={styles.actionButton}
          onPress={() => fetchViewerDetails.run({ params: { id: 'u1' } })}
        >
          <Text style={styles.actionText}>Load viewer u1 button</Text>
        </Pressable>
      </View>

      {/* cards */}
      <View style={styles.cards}>
        <View style={styles.cardBlock}>
          <Text style={styles.blockTitle}>Current viewer</Text>
          <ViewerCard viewer={currentViewer ?? null} />
        </View>

        <View style={styles.cardBlock}>
          <Text style={styles.blockTitle}>
            Viewer details (always full data of this user)
          </Text>
          <ViewerCard viewer={viewerDetails ?? null} />
        </View>
      </View>
    </View>
  );
});
