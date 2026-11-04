import Image from "next/image";
import { Container, cx, SectionTitle, reveal, sectionPad } from "@/components/ui";
import type { Settings } from "@/lib/settings";
import { mediaUrl } from "@/lib/storage/media";
import { TestimonialSlider } from "./testimonial-slider";

function Stars({ rating }: { rating: number }) {
  return (
    <div role="img" aria-label={`${rating} dari 5 bintang`} className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 20 20" aria-hidden="true" className={cx("size-4", n <= rating ? "fill-wine" : "fill-line")}>
          <path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials({ settings }: { settings: Settings }) {
  const shown = settings.testimonials.items.filter((t) => t.on);
  if (shown.length === 0) return null;
  const title = settings.sections.testi.title;
  return (
    <section id="testimoni" className="border-b border-line">
      <Container className={sectionPad}>
        <TestimonialSlider label={title} title={<SectionTitle className="mb-0" {...reveal()}>{title}</SectionTitle>}>
          {shown.map((t, i) => (
            <li key={t.id} className="flex w-[84%] flex-none snap-start flex-col rounded-[14px] border border-line bg-white p-6 sm:w-[calc((100%-20px)/2)] sm:p-7 lg:w-[calc((100%-40px)/3)]" {...reveal(Math.min(i, 2))}>
              <Stars rating={t.rating} />
              <p className="mt-3.5 mb-[18px] font-serif text-xl leading-[1.4] whitespace-pre-line text-ink-soft">{t.text}</p>
              <div className="mt-auto flex items-center gap-3">
                <span aria-hidden="true" className="relative flex size-12 flex-none items-center justify-center overflow-hidden rounded-full bg-blush font-serif text-xl text-wine">
                  {t.photo ? <Image src={mediaUrl(t.photo)} alt="" fill sizes="48px" className="object-cover" /> : Array.from(t.name)[0]?.toUpperCase()}
                </span>
                <p className="min-w-0 text-[15px] font-medium text-ink">{t.name}</p>
              </div>
            </li>
          ))}
        </TestimonialSlider>
      </Container>
    </section>
  );
}
