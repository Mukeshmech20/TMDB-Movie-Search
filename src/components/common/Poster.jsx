import { useState } from 'react';
import { imageUrl } from '../../utils/images';

/** Poster or backdrop image with a graceful fallback when the image is missing or fails. */
export default function Poster({ path, title, kind = 'poster', className = '' }) {
  const [failed, setFailed] = useState(false);
  const src = imageUrl(path, kind);

  if (!src || failed) {
    if (kind === 'profile') {
      const initials = title.split(' ').map((w) => w[0]).slice(0, 2).join('');
      return (
        <div className={`flex items-center justify-center bg-curtain font-display text-2xl text-mute ${className}`} role="img" aria-label={`No photo available for ${title}`}>{initials}</div>
      );
    }
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-curtain to-velvet p-4 text-center ${className}`} role="img" aria-label={`No image available for ${title}`}>
        <span className="font-display text-lg leading-tight text-mute">{title}</span>
      </div>
    );
  }
  return <img src={src} alt={kind === 'profile' ? title : `${title} ${kind === 'backdrop' ? 'backdrop' : 'poster'}`} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}
