import type { CommentModel } from '../../stores/comments/model';

export function CommentItem({ comment }: { comment: CommentModel }) {
  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: 6,
        padding: 8,
        marginTop: 8,
      }}
    >
      <p style={{ margin: '0 0 4px 0' }}>{comment.text}</p>

      <small>
        by <b>{comment.viewer?.name ?? '—'}</b>
      </small>
    </div>
  );
}
