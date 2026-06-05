import Image from 'next/image'

interface Props {
  src?: string | null
  alt?: string
  placeholder?: string
  className?: string
  style?: React.CSSProperties
  width?: number
  height?: number
  fill?: boolean
}

export default function ImageSlot({ src, alt, placeholder = 'Billede', className = '', style, width, height, fill }: Props) {
  if (src) {
    if (fill) {
      return (
        <div className={`img-placeholder ${className}`} style={{ position: 'relative', ...style }}>
          <Image src={src} alt={alt ?? placeholder} fill style={{ objectFit: 'cover' }} />
        </div>
      )
    }
    return (
      <Image
        src={src}
        alt={alt ?? placeholder}
        width={width ?? 400}
        height={height ?? 300}
        className={className}
        style={{ objectFit: 'cover', ...style }}
      />
    )
  }

  return (
    <div
      className={`img-placeholder ${className}`}
      style={style}
      aria-label={placeholder}
    >
      <span style={{ padding: '0 8px', lineHeight: 1.4 }}>{placeholder}</span>
    </div>
  )
}
