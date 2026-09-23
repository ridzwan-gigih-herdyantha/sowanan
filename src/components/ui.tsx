import type { ComponentProps } from "react";

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

export function SectionSub({ className, ...props }: ComponentProps<"p">) {
  return <p className={cx("mb-11 max-w-[62ch] text-[17px] text-ink-body", className)} {...props} />;
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
