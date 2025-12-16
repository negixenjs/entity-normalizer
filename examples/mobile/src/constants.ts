export const ENTITY_KEY = {
  COMMENTS: 'comments',
  VIEWERS: 'viewers',
  POSTS: 'posts',
} as const;

export const REF_SOURCE = {
  //collections
  POSTS_FEED: 'posts-feed',
  COMMENTS_FEED: 'comments-feed',

  //records
  CURRENT_VIEWER: 'current_viewer',
  VIEWER_DETAILS: 'viewer_details',
};
