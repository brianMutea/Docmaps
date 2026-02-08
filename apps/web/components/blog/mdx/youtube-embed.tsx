interface YouTubeEmbedProps {
  videoId: string
  title?: string
  autoplay?: boolean
}

export function YouTubeEmbed({ videoId, title = 'YouTube video', autoplay = false }: YouTubeEmbedProps) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}${autoplay ? '?autoplay=1' : ''}`

  return (
    <div className="relative my-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
    </div>
  )
}
