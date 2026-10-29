import Image from "next/image";
import { isOwnImageUrl } from "@/lib/image-url";

export function RemoteImage({
  src,
  alt,
  width,
  height,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  className?: string;
}) {
  if (isOwnImageUrl(src)) {
    return (
      <Image src={src} alt={alt} width={width} height={height} sizes={sizes} className={className} />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} width={width} height={height} loading="lazy" className={className} />
  );
}
