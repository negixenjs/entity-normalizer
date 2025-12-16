import type { ViewerDto } from '../viewer/dto';

export interface CommentDto {
  id: string;
  text: string;
  viewer: ViewerDto;
}

export interface CommentNormalizedDto {
  id: string;
  text: string;
  viewerId: string;
}
