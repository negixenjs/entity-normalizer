import type { CoreLifecycleAPI } from './types';

export function createLifecycleAPI(deps: {
  getIsInitialized: () => boolean;
  setInitialized: (v: boolean) => void;
}): CoreLifecycleAPI {
  return {
    get isInitialized() {
      return deps.getIsInitialized();
    },
    setInitialized: deps.setInitialized,
  };
}
