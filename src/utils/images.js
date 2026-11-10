import { IMAGE_BASE_URL, IMAGE_SIZES } from '../config';

export const imageUrl = (path, kind = 'poster') =>
  path ? `${IMAGE_BASE_URL}/${IMAGE_SIZES[kind]}${path}` : null;
