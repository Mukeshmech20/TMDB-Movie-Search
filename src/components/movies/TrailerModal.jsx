import Modal from '../common/Modal';

export default function TrailerModal({ video, title, onClose }) {
  return (
    <Modal title={`${title}: ${video.name}`} onClose={onClose}>
      <div className="aspect-video w-full overflow-hidden rounded-poster bg-black">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${video.key}?autoplay=1&rel=0`}
          title={`${title} - ${video.name}`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        />
      </div>
    </Modal>
  );
}
