import './src/stores/register'
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { Tabs } from './src';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Tabs />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
