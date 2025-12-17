import { View, Text, Image } from 'react-native';

import { styles } from './styles';

import type { ViewerModel } from '../../stores/viewer/model';

export function ViewerCard({ viewer }: { viewer: ViewerModel | null }) {
  if (!viewer) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>No viewer loaded</Text>
      </View>
    );
  }

  return (
    <View style={styles.viewerCard}>
      {viewer.avatarUrl ? (
        <Image source={{ uri: viewer.avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarLetter}>{viewer.name[0]}</Text>
        </View>
      )}

      <View style={styles.viewerMeta}>
        <Text style={styles.viewerName}>{viewer.name}</Text>

        {!!viewer.email && (
          <Text style={styles.viewerEmail}>{viewer.email}</Text>
        )}

        {!!viewer.bio && <Text style={styles.viewerBio}>{viewer.bio}</Text>}
      </View>
    </View>
  );
}
