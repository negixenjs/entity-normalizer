type Viewer = {
  id: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  email?: string;
};

export function ViewerCard({ viewer }: { viewer: Viewer | null }) {
  if (!viewer) {
    return <div>No viewer loaded</div>;
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: 16,
        border: '1px solid #2a2a2a',
        borderRadius: 12,
        background: '#111',
        color: '#fff',
        maxWidth: 360,
      }}
    >
      {viewer.avatarUrl && (
        <img
          src={viewer.avatarUrl}
          alt={viewer.name}
          width={64}
          height={64}
          style={{ borderRadius: '50%', objectFit: 'cover' }}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <strong style={{ fontSize: 16 }}>{viewer.name}</strong>
        <span style={{ fontSize: 13, opacity: 0.8 }}>{viewer.email}</span>
        {viewer.bio && (
          <p style={{ fontSize: 13, margin: '6px 0 0', opacity: 0.9 }}>
            {viewer.bio}
          </p>
        )}
      </div>
    </div>
  );
}
