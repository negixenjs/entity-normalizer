import Reactotron, { ReactotronReactNative } from 'reactotron-react-native';

declare global {
  interface Console {
    tron: ReactotronReactNative;
  }
}

export default () => {
  Reactotron.configure({}).useReactNative().connect();

  // eslint-disable-next-line no-console
  console.tron = Reactotron;
};
