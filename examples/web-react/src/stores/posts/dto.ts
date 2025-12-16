import type { CommentDto } from '../comments/dto';
import type { ViewerDto } from '../viewer/dto';

export interface PostDto {
  id: string;
  title: string;
  viewer: ViewerDto;
  comments: CommentDto[];
}

// -----------------
// NORMALIZED DTO
// -----------------

export interface PostNormalizedDto {
  id: string;
  title: string;
  viewerId: string;
  commentIds: string[];
}
