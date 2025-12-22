import './src/stores/register';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import reactotron from './reactotron';
import { Tabs } from './src';

if (__DEV__) {
  reactotron();
}

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Tabs />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
