// Kelas gaya admin. Dipisah dari ui.tsx supaya bisa dipakai komponen server.
export const cx = (...p: (string | false | null | undefined)[]) => p.filter(Boolean).join(" ");

export const input =
  "w-full rounded-lg border bg-white px-3 py-2.5 text-base text-[#2A2320] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#9A8C82] focus:border-wine focus:shadow-[0_0_0_3px_#F6EBEE] disabled:bg-[#F5F1EB] disabled:text-[#8C7F76] sm:text-[13.5px]";
export const ring = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine";

export const button = {
  primary: cx(
    "inline-flex items-center justify-center gap-[7px] rounded-lg border border-wine bg-wine px-5 py-[11px] text-[13.5px] text-white no-underline transition-colors duration-150 hover:border-[#651F30] hover:bg-[#651F30] disabled:cursor-not-allowed disabled:opacity-50",
    ring,
  ),
  ghost: cx("inline-flex items-center justify-center gap-[7px] rounded-lg border border-wine bg-transparent px-5 py-[11px] text-[13.5px] text-wine no-underline transition-colors duration-150 hover:bg-[#F6EBEE]", ring),
  quiet: cx(
    "inline-flex items-center justify-center gap-[7px] rounded-lg border border-[#E8E0D6] bg-transparent px-5 py-[11px] text-[13.5px] text-[#5C5048] no-underline transition-colors duration-150 hover:border-[#DCD2C7] hover:bg-[#F5F1EB] hover:text-[#2A2320] disabled:cursor-not-allowed disabled:opacity-50",
    ring,
  ),
  sm: "px-[13px]! py-[7px]! text-[12.5px]!",
};
