import { useState } from 'react';

import { CommentsByPostExample } from './examples/comments-by-post/CommentsByPostExample';
import { PostsPaginationExample } from './examples/posts-pagination/PostsPaginationExample';
import { ViewerRecordsExample } from './examples/viewer-records/ViewerRecordsExample';
import './App.css';

function App() {
  const [example, setExample] = useState<'posts' | 'comments' | 'viewer'>(
    'posts',
  );

  return (
    <>
      <button onClick={() => setExample('posts')}>Posts Example (multi collection) </button>
      <button onClick={() => setExample('comments')}>Comments Example (single collection)</button>
      <button onClick={() => setExample('viewer')}>Viewer Example (record)</button>
      {example === 'posts' && <PostsPaginationExample />}
      {example === 'comments' && <CommentsByPostExample />}
      {example === 'viewer' && <ViewerRecordsExample />}
    </>
  );
}
export default App;
