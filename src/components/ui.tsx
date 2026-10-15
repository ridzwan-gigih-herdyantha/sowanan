import type { ComponentProps, ReactNode } from "react";

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("mx-auto max-w-[1120px] px-5 sm:px-7 lg:px-10", className)} {...props} />;
}

export const sectionPad = "py-12 sm:py-16 lg:py-[88px]";

export function SectionTitle({ className, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      className={cx("mb-3 font-serif text-[clamp(30px,4vw,44px)] leading-[1.15] font-medium", className)}
      {...props}
    />
  );
}

// Label kecil bernomor di atas judul bagian beranda, seperti penanda bab.
export function Eyebrow({ no, children, className }: { no: string; children: ReactNode; className?: string }) {
  return (
    <p className={cx("mb-3 flex items-center gap-3 text-[12px] tracking-[3px] text-wine uppercase", className)}>
      <span className="font-serif text-[16px] tracking-normal">{no}</span>
      <span aria-hidden="true" className="h-px w-8 bg-current opacity-40" />
      {children}
    </p>
  );
}

// Ranting daun bergaris tipis sebagai hiasan latar bagian. Selalu dekoratif dan tidak bisa diklik.
export function Sprig({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 240" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" className={cx("pointer-events-none absolute", className)}>
      <path d="M60 236 C58 190 62 140 56 96 C52 62 58 30 70 4" />
      {[
        [58, 206, -1],
        [59, 178, 1],
        [59, 150, -1],
        [58, 122, 1],
        [56, 96, -1],
        [56, 70, 1],
        [60, 44, -1],
        [65, 22, 1],
      ].map(([x, y, d], i) => {
        const len = 30 - i * 2;
        const tx = x + d * len;
        const ty = y - len * 0.55;
        return <path key={i} d={`M${x} ${y} C${x + d * len * 0.3} ${y - len * 0.6} ${tx - d * 4} ${ty - 6} ${tx} ${ty} C${tx - d * 8} ${ty + 6} ${x + d * len * 0.5} ${y + 2} ${x} ${y} Z`} />;
      })}
      <circle cx="70" cy="4" r="2.2" />
    </svg>
  );
}

export function SectionSub({ className, ...props }: ComponentProps<"p">) {
  return <p className={cx("mb-11 max-w-[82ch] text-[17px] text-ink-body", className)} {...props} />;
}

const btnBase =
  "inline-block rounded-sm no-underline tracking-[.5px] transition-[transform,background-color,color,box-shadow] duration-200 ease-out motion-reduce:transform-none";

export const btn = {
  primary: cx(
    btnBase,
    "bg-wine px-[34px] py-[18px] text-base text-white hover:-translate-y-0.5 hover:bg-wine-dark hover:shadow-[0_8px_20px_rgba(124,43,62,.26)]",
  ),
  dark: cx(btnBase, "bg-ink px-[22px] py-3 text-sm text-ivory hover:-translate-y-0.5 hover:bg-black"),
  ghost:
    "inline-block border-b border-wine px-2 py-[18px] text-ink no-underline transition-colors duration-200 hover:text-wine",
  base: btnBase,
};

export function reveal(index = 0) {
  return { "data-reveal": "", style: { "--reveal-delay": `${index * 70}ms` } as React.CSSProperties };
}
