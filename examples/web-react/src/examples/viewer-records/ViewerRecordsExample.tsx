import { observer } from 'mobx-react-lite';

import { useStores } from '../../stores';

export const ViewerRecordsExample = observer(() => {
  const {
    viewer: {
      currentViewer,
      viewerDetails,
      fetchCurrentViewer,
      fetchViewerDetails,
    },
  } = useStores();

  return (
    <div style={{ padding: 16, maxWidth: 720 }}>
      <h2>Viewer records</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => fetchCurrentViewer.run()}>
          Load current viewer
        </button>

        <button
          onClick={() => fetchViewerDetails.run({ params: { id: 'u2' } })}
        >
          Load viewer details (id=u2)
        </button>

        <button
          onClick={() => fetchViewerDetails.run({ params: { id: 'u1' } })}
        >
          Load current viewer details (id=u1)
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <h4>Current viewer</h4>
          <pre style={{ fontSize: 12 }}>
            {JSON.stringify(currentViewer, null, 2)}
          </pre>
        </div>

        <div style={{ flex: 1 }}>
          <h4>Viewer details u2 / Current Viewer Details</h4>
          <pre style={{ fontSize: 12 }}>
            {JSON.stringify(viewerDetails, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
});
