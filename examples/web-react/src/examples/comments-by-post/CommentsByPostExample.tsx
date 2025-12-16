import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';

import { CommentItem } from './CommentItem';
import { useStores } from '../../stores';

import type { CommentModel } from '../../stores/comments/model';

export const CommentsByPostExample = observer(() => {
  const {
    posts: {
      lists: {
        fresh: { getList: freshPosts },
      },
    },
    comments: {
      fetchComments,
      list: { getList: commentsByPost },
    },
  } = useStores();
  const [postId, setPostId] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) {
      return;
    }

    fetchComments.run({ params: { postId } });
  }, [postId, fetchComments]);

  return (
    <>
      <br />
      <br />
      <br />
      {freshPosts.map(p => (
        <button key={p.id} onClick={() => setPostId(p.id)}>
          {p.title}
        </button>
      ))}

      {postId &&
        commentsByPost.map((comment: CommentModel) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
    </>
  );
});
