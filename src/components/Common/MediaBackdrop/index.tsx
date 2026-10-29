import CachedImage from '@app/components/Common/CachedImage';

const FADE_MASK = 'linear-gradient(180deg, #000 40%, transparent 100%)';

interface MediaBackdropProps {
  backdropPath: string;
}

/**
 * The backdrop of a media page: a sharp banner at the top that dissolves
 * into a blurred, dimmed copy of the same image behind the whole page.
 **/
const MediaBackdrop = ({ backdropPath }: MediaBackdropProps) => (
  <>
    <div
      className="pointer-events-none fixed inset-0 -z-20 overflow-hidden bg-gray-900"
      aria-hidden
    >
      <div className="absolute inset-0 scale-110 opacity-75 blur-[20px]">
        <CachedImage
          type="tmdb"
          alt=""
          src={`https://image.tmdb.org/t/p/w1280/${backdropPath}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          fill
        />
      </div>
      <div className="absolute inset-0 bg-gray-900/40" />
    </div>
    <div
      className="media-page-bg-image"
      style={{ maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK }}
    >
      <CachedImage
        type="tmdb"
        alt=""
        src={`https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/${backdropPath}`}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        fill
        priority
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(8, 8, 8, 0.47) 0%, rgba(8, 8, 8, 0) 100%)',
        }}
      />
    </div>
  </>
);

export default MediaBackdrop;
