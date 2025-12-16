import type { CommentDto } from '../comments/dto';
import type { ViewerDto } from '../viewer/dto';

export type PostGroup = 'fresh' | 'archived';

export interface PostDto {
  id: string;
  title: string;
  viewer: ViewerDto;
  comments: CommentDto[];
  group: PostGroup;
}

// -----------------
// NORMALIZED DTO
// -----------------

export interface PostNormalizedDto {
  id: string;
  title: string;
  viewerId: string;
  commentsId: string[];
}
