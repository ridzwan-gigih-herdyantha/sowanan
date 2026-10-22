"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { FrameProps } from "@/lib/invitation/frame";

const ASET = "/img/bonar-anggi";

// Butir beras berkat (boras sipir ni tondi) yang jatuh pelan. Posisi dan waktu dibuat tetap supaya hasil server dan
// browser sama. Animasinya berhenti saat keluar layar.
export function Boras({ count = 22, className = "" }: { count?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => el.toggleAttribute("data-jeda", !e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} aria-hidden="true" className={`hr-boras pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          style={{
            left: `${(i * 37 + 11) % 100}%`,
            animationDelay: `${((i * 0.73) % 6).toFixed(2)}s`,
            animationDuration: `${(5.5 + (i % 5) * 0.8).toFixed(1)}s`,
            rotate: `${(i * 47) % 180}deg`,
          }}
        />
      ))}
    </div>
  );
}

// Filter duotone yang mewarnai ulang lapis gambar ke palet: gelap untuk bayangan, terang untuk cahaya. Warnanya dibaca
// dari CSS variable lewat style, jadi ikut berganti saat palet diganti. Dipasang sekali di akar tema.
const NADA = ["jauh", "belakang", "tengah", "dekat", "bunga", "lembut", "gelap"] as const;
type Nada = (typeof NADA)[number];

export function NadaDefs() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <defs>
        {NADA.map((id) => (
          <filter key={id} id={`hr-nada-${id}`} colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
            <feColorMatrix in="SourceGraphic" type="matrix" values="0.3 0.59 0.11 0 0 0.3 0.59 0.11 0 0 0.3 0.59 0.11 0 0 0 0 0 1 0" result="abu" />
            <feComponentTransfer in="abu" result="tegas">
              <feFuncR type="linear" slope="1.25" intercept="-0.1" />
              <feFuncG type="linear" slope="1.25" intercept="-0.1" />
              <feFuncB type="linear" slope="1.25" intercept="-0.1" />
            </feComponentTransfer>
            <feFlood style={{ floodColor: `var(--hr-nada-${id}-a)` }} result="g" />
            <feFlood style={{ floodColor: `var(--hr-nada-${id}-b)` }} result="t" />
            <feComposite in="tegas" in2="t" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="at" />
            <feComposite in="tegas" in2="g" operator="arithmetic" k1="-1" k2="0" k3="1" k4="0" result="ag" />
            <feComposite in="at" in2="ag" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="campur" />
            <feComposite in="campur" in2="SourceGraphic" operator="in" />
          </filter>
        ))}
      </defs>
    </svg>
  );
}

const ASET_UKURAN = {
  "alpinia.webp": [800, 1351],
  "bambu.webp": [1017, 1548],
  "gunung.webp": [1800, 987],
  "hibiskus.webp": [800, 974],
  "kelapa.webp": [998, 1600],
  "pakis.webp": [692, 858],
  "pisang.webp": [1100, 1431],
  "pisang2.webp": [1000, 1376],
  "renealmia.webp": [800, 1284],
  "tebu.webp": [800, 1325],
  "rumah-depan.webp": [769, 1066],
} as const;
type Aset = keyof typeof ASET_UKURAN;

type LapisProps = { src: Aset; nada: Nada; className: string; goyang?: string; balik?: boolean; masuk?: string; putar?: number; sizes: string };

// Satu lapis gambar: posisi di className, nada warna, goyangan, putaran tetap, dan gerak masuk.
function Lapis({ src, nada, className, goyang = "", balik = false, masuk = "", putar, sizes }: LapisProps) {
  const [w, h] = ASET_UKURAN[src];
  return (
    <div className={`absolute ${className}`} style={putar ? { rotate: `${putar}deg` } : undefined}>
      <div className={masuk ? `hr-masuk ${masuk}` : ""}>
        <div className={goyang}>
          <Image src={`${ASET}/${src}`} alt="" width={w} height={h} sizes={sizes} className={`h-auto w-full ${balik ? "-scale-x-100" : ""}`} style={{ filter: `url(#hr-nada-${nada})` }} />
        </div>
      </div>
    </div>
  );
}

const goyang = (v = "") => `hr-goyang ${v}`;

function Juntai() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[34%]">
      <div className="hr-ulos-turun absolute inset-0">
        {(["kiri", "kanan"] as const).map((sisi) => (
          <div key={sisi} className={`hr-juntai hr-juntai-${sisi} absolute top-[-3%] w-[72%] lg:w-[56%] ${sisi === "kiri" ? "left-[-14%] lg:left-[-4%]" : "right-[-14%] lg:right-[-4%]"}`}>
            <div className="hr-ipon h-2" />
            <div className={`hr-ulos h-9 lg:h-12 ${sisi === "kanan" ? "-scale-x-100" : ""}`} />
            <div className="hr-ipon h-2 -scale-y-100" />
            <div className="hr-rumbai-bawah h-5" />
          </div>
        ))}
      </div>
      <Lapis src="hibiskus.webp" nada="bunga" putar={160} goyang={goyang("hr-goyang-e")} className="top-[-4%] left-[-8%] w-[28%] lg:left-[-2%] lg:w-[11%]" sizes="(min-width: 1024px) 11vw, 28vw" />
      <Lapis src="alpinia.webp" nada="bunga" putar={-150} goyang={goyang("hr-goyang-d")} className="top-[-10%] right-[-6%] w-[22%] lg:right-[0%] lg:w-[8%]" sizes="(min-width: 1024px) 8vw, 22vw" />
    </div>
  );
}

// Adegan berlapis di hero, seperti kolase: lukisan pegunungan di kejauhan, rumpun kelapa, bambu, dan pisang di belakang
// rumah, dua rumah bolon yang sama di kiri dan kanan, rumpun di kaki rumah, foto mempelai berbingkai ulos di depan,
// semak dan bunga di bawah, daun pisang besar di sudut, dan dua helai ulos menjuntai di atas. Semua lapis diwarnai ulang
// ke palet dan bergoyang pelan. Selain langit dan gunung, semuanya baru muncul setelah tirai pembuka habis
// (data-hr-terbuka, lihat .hr-muncul di globals.css).
export function HeroScene({ text, bawah, foto, frame, alt }: { text: ReactNode; bawah: ReactNode; foto: string; frame?: FrameProps; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const geser = (px: number) => [0, reduce ? 0 : px];
  const langit = useTransform(scrollYProgress, [0, 1], geser(60));
  const jauh = useTransform(scrollYProgress, [0, 1], geser(140));
  const belakang = useTransform(scrollYProgress, [0, 1], geser(110));
  const tengah = useTransform(scrollYProgress, [0, 1], geser(70));
  const depan = useTransform(scrollYProgress, [0, 1], geser(-40));
  const teks = useTransform(scrollYProgress, [0, 0.5], [1, reduce ? 1 : 0]);

  // Cadangan bila pintu tidak tampil: tandai terbuka sesaat setelah undangan dibuka.
  useEffect(() => {
    const root = ref.current?.closest("[data-inv-state]");
    if (!root) return;
    let id = 0;
    const cek = () => {
      if (root.getAttribute("data-inv-state") !== "open" || root.hasAttribute("data-hr-terbuka")) return;
      id = window.setTimeout(() => {
        if (!document.querySelector(".hr-door")) root.setAttribute("data-hr-terbuka", "");
      }, 400);
    };
    const mo = new MutationObserver(cek);
    mo.observe(root, { attributes: true, attributeFilter: ["data-inv-state"] });
    cek();
    return () => {
      mo.disconnect();
      clearTimeout(id);
    };
  }, []);

  const kelompok = (y: MotionValue<number>, muncul: string, isi: ReactNode) => (
    <motion.div aria-hidden="true" style={{ y }} className="pointer-events-none absolute inset-0">
      <div className={`hr-masuk ${muncul} absolute inset-0`}>{isi}</div>
    </motion.div>
  );

  return (
    <div ref={ref} className="hr-adegan relative h-[max(720px,100svh)] overflow-hidden lg:h-[max(780px,100svh)]">
      {/* Langit dan gunung ikut bergerak seperti kamera saat lapis-lapis lain tersusun, lihat .hr-latar. */}
      <div aria-hidden="true" className="hr-latar pointer-events-none absolute inset-0">
        <motion.div style={{ y: langit }} className="hr-langit absolute inset-x-0 -top-24 bottom-0">
          <div className="hr-matahari absolute top-[36%] left-1/2 size-[80vmin] -translate-x-1/2 rounded-full" />
        </motion.div>

        <motion.div style={{ y: jauh }} className="absolute inset-0">
          <div className="hr-gunung absolute bottom-[30%] left-[-40%] w-[180%] lg:bottom-[24%] lg:left-[-5%] lg:w-[110%]">
            <Image src={`${ASET}/gunung.webp`} alt="" width={1800} height={987} sizes="(min-width: 1024px) 110vw, 180vw" className="h-auto w-full" style={{ filter: "url(#hr-nada-jauh)" }} />
          </div>
          <div className="hr-kabut absolute bottom-[36%] -left-1/4 h-24 w-3/4" />
          <div className="hr-kabut hr-kabut-b absolute right-[-25%] bottom-[32%] h-20 w-2/3" />
        </motion.div>
      </div>

      {kelompok(
        belakang,
        "hr-muncul-1",
        <>
          <Lapis src="kelapa.webp" nada="belakang" goyang={goyang("hr-goyang-c")} className="bottom-[34%] left-[-16%] w-[30%] lg:left-[5%] lg:w-[11%]" sizes="(min-width: 1024px) 11vw, 30vw" />
          <Lapis src="kelapa.webp" nada="belakang" goyang={goyang("hr-goyang-b")} balik className="right-[-16%] bottom-[34%] w-[30%] lg:right-[5%] lg:w-[11%]" sizes="(min-width: 1024px) 11vw, 30vw" />
          <Lapis src="bambu.webp" nada="belakang" goyang={goyang()} className="bottom-[27%] left-[-18%] w-[52%] lg:left-[7%] lg:w-[22%]" sizes="(min-width: 1024px) 22vw, 52vw" />
          <Lapis src="bambu.webp" nada="belakang" goyang={goyang("hr-goyang-b")} balik className="right-[-18%] bottom-[27%] w-[52%] lg:right-[7%] lg:w-[22%]" sizes="(min-width: 1024px) 22vw, 52vw" />
          <Lapis src="pisang.webp" nada="belakang" goyang={goyang("hr-goyang-c")} className="bottom-[17%] left-[20%] hidden w-[28%] lg:left-[26%] lg:block lg:w-[11%]" sizes="(min-width: 1024px) 11vw, 28vw" />
          <Lapis src="pisang.webp" nada="belakang" goyang={goyang()} balik className="right-[20%] bottom-[17%] hidden w-[28%] lg:right-[26%] lg:block lg:w-[11%]" sizes="(min-width: 1024px) 11vw, 28vw" />
        </>,
      )}

      {kelompok(
        tengah,
        "hr-muncul-2",
        <>
          <Lapis src="rumah-depan.webp" nada="tengah" className="bottom-[22%] left-[-6%] w-[42%] md:bottom-[20%] md:left-[2%] md:w-[30%] lg:bottom-[15%] lg:left-[12%] lg:w-[18%]" sizes="(min-width: 1024px) 18vw, 44vw" />
          <Lapis src="rumah-depan.webp" nada="tengah" balik className="right-[-6%] bottom-[22%] w-[42%] md:right-[2%] md:bottom-[20%] md:w-[30%] lg:right-[12%] lg:bottom-[15%] lg:w-[18%]" sizes="(min-width: 1024px) 18vw, 44vw" />
          <Lapis src="tebu.webp" nada="belakang" goyang={goyang("hr-goyang-d")} className="bottom-[9%] left-[-14%] w-[26%] lg:left-[9%] lg:w-[9%]" sizes="(min-width: 1024px) 9vw, 26vw" />
          <Lapis src="tebu.webp" nada="belakang" goyang={goyang("hr-goyang-e")} balik className="bottom-[8%] left-[10%] w-[24%] lg:left-[23%] lg:w-[8%]" sizes="(min-width: 1024px) 8vw, 24vw" />
          <Lapis src="tebu.webp" nada="belakang" goyang={goyang("hr-goyang-d")} balik className="right-[-14%] bottom-[9%] w-[26%] lg:right-[9%] lg:w-[9%]" sizes="(min-width: 1024px) 9vw, 26vw" />
          <Lapis src="tebu.webp" nada="belakang" goyang={goyang("hr-goyang-e")} className="right-[10%] bottom-[8%] w-[24%] lg:right-[23%] lg:w-[8%]" sizes="(min-width: 1024px) 8vw, 24vw" />
          <Lapis src="pakis.webp" nada="dekat" goyang={goyang("hr-goyang-c")} className="bottom-[8%] left-[0%] w-[28%] lg:left-[15%] lg:w-[10%]" sizes="(min-width: 1024px) 10vw, 28vw" />
          <Lapis src="pakis.webp" nada="dekat" goyang={goyang("hr-goyang-b")} balik className="right-[0%] bottom-[8%] w-[28%] lg:right-[15%] lg:w-[10%]" sizes="(min-width: 1024px) 10vw, 28vw" />
        </>,
      )}

      {kelompok(
        depan,
        "hr-muncul-3",
        <>
          <div className="hr-tanah absolute inset-x-0 bottom-0 h-[26%]" />
          <Lapis src="renealmia.webp" nada="dekat" goyang={goyang("hr-goyang-d")} className="bottom-[-8%] left-[-6%] w-[38%] lg:left-[4%] lg:w-[13%]" sizes="(min-width: 1024px) 13vw, 38vw" />
          <Lapis src="pakis.webp" nada="dekat" goyang={goyang("hr-goyang-d")} className="bottom-[-6%] left-[12%] w-[30%] lg:left-[18%] lg:w-[11%]" sizes="(min-width: 1024px) 11vw, 30vw" />
          <Lapis src="renealmia.webp" nada="dekat" goyang={goyang("hr-goyang-c")} balik className="right-[12%] bottom-[-10%] w-[34%] lg:right-[18%] lg:w-[12%]" sizes="(min-width: 1024px) 12vw, 34vw" />
          <Lapis src="pakis.webp" nada="dekat" goyang={goyang("hr-goyang-e")} balik className="right-[-6%] bottom-[-4%] w-[34%] lg:right-[4%] lg:w-[12%]" sizes="(min-width: 1024px) 12vw, 34vw" />
          <Lapis src="alpinia.webp" nada="bunga" goyang={goyang("hr-goyang-e")} className="bottom-[-14%] left-[6%] w-[26%] lg:left-[12%] lg:w-[9%]" sizes="(min-width: 1024px) 9vw, 26vw" />
          <Lapis src="hibiskus.webp" nada="bunga" goyang={goyang("hr-goyang-d")} className="bottom-[-8%] left-[-10%] w-[30%] lg:left-[24%] lg:w-[10%]" sizes="(min-width: 1024px) 10vw, 30vw" />
          <Lapis src="hibiskus.webp" nada="bunga" goyang={goyang("hr-goyang-e")} balik className="right-[-10%] bottom-[-8%] w-[30%] lg:right-[24%] lg:w-[10%]" sizes="(min-width: 1024px) 10vw, 30vw" />
          <Lapis src="alpinia.webp" nada="bunga" goyang={goyang("hr-goyang-d")} balik className="right-[6%] bottom-[-16%] w-[26%] lg:right-[12%] lg:w-[9%]" sizes="(min-width: 1024px) 9vw, 26vw" />
          <Lapis src="pisang2.webp" nada="dekat" goyang={goyang("hr-goyang-c")} masuk="hr-pohon-kiri origin-bottom-left" className="bottom-[-10%] left-[-46%] w-[78%] md:bottom-[-8%] md:left-[-22%] md:w-[42%] lg:left-[-14%] lg:w-[28%]" sizes="(min-width: 1024px) 28vw, 78vw" />
          <Lapis src="pisang2.webp" nada="dekat" goyang={goyang("hr-goyang-b")} balik masuk="hr-pohon-kanan origin-bottom-right" className="right-[-48%] bottom-[-12%] w-[80%] md:right-[-22%] md:bottom-[-8%] md:w-[42%] lg:right-[-14%] lg:w-[28%]" sizes="(min-width: 1024px) 28vw, 80vw" />
        </>,
      )}

      <motion.div style={{ y: tengah }} className="pointer-events-none absolute bottom-[17%] left-1/2 z-10 w-[min(72%,340px)] -translate-x-1/2 md:w-[min(42%,360px)] lg:bottom-[13%] lg:w-[min(25%,400px)]">
        <div className="hr-masuk hr-foto">
          <div aria-hidden="true" className="hr-cahaya-foto absolute -inset-[30%]" />
          <div className="relative rounded-t-[999px] p-3 shadow-[0_40px_80px_rgba(0,0,0,.55)] lg:p-4">
            <div aria-hidden="true" className="hr-ulos absolute inset-0 rounded-t-[999px]" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] shadow-[0_0_0_4px_var(--inv-gold-light),0_0_0_7px_var(--inv-gold)]">
              {/* Napas di pembungkus, supaya zoom foto dari editor tetap berlaku bersama geraknya. */}
              <div className="hr-napas absolute inset-0">
                <Image {...frame} src={foto} alt={alt} fill priority sizes="(min-width: 1024px) 400px, 72vw" className="object-cover object-[50%_28%]" />
              </div>
            </div>
          </div>
          <Lapis src="hibiskus.webp" nada="bunga" goyang={goyang("hr-goyang-e")} className="bottom-[-8%] left-[-30%] w-[50%]" sizes="34vw" />
          <Lapis src="alpinia.webp" nada="bunga" goyang={goyang("hr-goyang-d")} balik className="right-[-22%] bottom-[-14%] w-[36%]" sizes="24vw" />
        </div>
      </motion.div>

      <div className="hr-masuk hr-muncul-ulos pointer-events-none absolute inset-0 z-10">
        <Juntai />
      </div>
      <Boras count={20} className="z-10" />

      <div aria-hidden="true" className="hr-bayang-teks pointer-events-none absolute inset-x-0 top-0 z-10 h-[52%]" />
      <motion.div style={{ opacity: teks }} className="relative z-20 flex h-full flex-col items-center px-6 pt-[max(140px,17svh)] text-center text-inv-wash lg:pt-[max(150px,18svh)]">
        {text}
      </motion.div>
      <motion.div style={{ opacity: teks }} className="hr-bawah-hero absolute inset-x-0 bottom-0 z-20 px-6 pt-10 pb-[max(28px,4svh)] text-center text-inv-wash">
        {bawah}
      </motion.div>
    </div>
  );
}

// Hiasan flora bergoyang untuk bagian lain: di dua sudut atas, dua sudut bawah, atau di kedua sisi. Nada lembut untuk
// latar terang, gelap untuk latar gelap dan merah. Konten bagian tetap di atasnya.
export function Hias({ letak, nada = "lembut", className = "" }: { letak: "atas" | "bawah" | "sisi"; nada?: "lembut" | "gelap"; className?: string }) {
  const kecil = "(min-width: 1024px) 14vw, 34vw";
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 z-[5] ${className}`}>
      {letak === "atas" && (
        <>
          <Lapis src="hibiskus.webp" nada={nada} putar={150} goyang={goyang("hr-goyang-d")} className="top-[-90px] left-[-12%] w-[38%] lg:top-[-120px] lg:left-[-3%] lg:w-[15%]" sizes={kecil} />
          <Lapis src="pakis.webp" nada={nada} putar={170} goyang={goyang()} className="top-[-70px] left-[10%] w-[24%] lg:left-[8%] lg:w-[10%]" sizes={kecil} />
          <Lapis src="alpinia.webp" nada={nada} putar={-150} goyang={goyang("hr-goyang-e")} className="top-[-110px] right-[-8%] w-[30%] lg:top-[-140px] lg:right-[-1%] lg:w-[11%]" sizes={kecil} />
          <Lapis src="renealmia.webp" nada={nada} putar={-170} goyang={goyang("hr-goyang-b")} className="top-[-90px] right-[14%] w-[24%] lg:right-[9%] lg:w-[9%]" sizes={kecil} />
        </>
      )}
      {letak === "bawah" && (
        <>
          <Lapis src="renealmia.webp" nada={nada} goyang={goyang("hr-goyang-c")} className="bottom-[-80px] left-[-10%] w-[34%] lg:bottom-[-110px] lg:left-[-2%] lg:w-[12%]" sizes={kecil} />
          <Lapis src="hibiskus.webp" nada={nada} goyang={goyang("hr-goyang-e")} className="bottom-[-50px] left-[10%] w-[30%] lg:left-[8%] lg:w-[11%]" sizes={kecil} />
          <Lapis src="pakis.webp" nada={nada} goyang={goyang("hr-goyang-d")} balik className="right-[10%] bottom-[-60px] w-[28%] lg:right-[8%] lg:w-[10%]" sizes={kecil} />
          <Lapis src="alpinia.webp" nada={nada} goyang={goyang()} balik className="right-[-8%] bottom-[-100px] w-[30%] lg:right-[-2%] lg:bottom-[-130px] lg:w-[11%]" sizes={kecil} />
        </>
      )}
      {letak === "sisi" && (
        <>
          {/* Di HP daun samping hanya mengintip dari tepi layar. */}
          <Lapis src="pisang2.webp" nada={nada} putar={20} goyang={goyang("hr-goyang-b")} className="top-[18%] left-[-30%] w-[40%] md:left-[-24%] md:w-[40%] lg:left-[-9%] lg:w-[20%]" sizes={kecil} />
          <Lapis src="hibiskus.webp" nada={nada} putar={30} goyang={goyang("hr-goyang-d")} className="top-[52%] left-[-14%] w-[22%] lg:left-[-2%] lg:w-[11%]" sizes={kecil} />
          <Lapis src="pisang2.webp" nada={nada} putar={-20} balik goyang={goyang()} className="top-[30%] right-[-30%] w-[40%] md:right-[-24%] md:w-[40%] lg:right-[-9%] lg:w-[20%]" sizes={kecil} />
          <Lapis src="alpinia.webp" nada={nada} putar={-25} balik goyang={goyang("hr-goyang-e")} className="top-[64%] right-[-12%] w-[20%] lg:right-[-1%] lg:w-[9%]" sizes={kecil} />
        </>
      )}
    </div>
  );
}

// Pita ulos pembatas antar bagian. Rumpun bunga di kedua ujungnya melintang ke bagian di atas dan di bawahnya, jadi
// hiasan antar bagian terasa menyambung.
export function UlosPita() {
  const sizes = "(min-width: 1024px) 12vw, 32vw";
  return (
    <div aria-hidden="true" className="pointer-events-none relative z-[6]">
      <div className="hr-ipon h-2" />
      <div className="hr-ulos h-5 lg:h-6" />
      <div className="hr-ipon h-2 -scale-y-100" />
      <Lapis src="hibiskus.webp" nada="bunga" putar={-12} goyang={goyang("hr-goyang-e")} className="top-1/2 left-[-8%] w-[30%] -translate-y-1/2 lg:left-[-2%] lg:w-[11%]" sizes={sizes} />
      <Lapis src="pakis.webp" nada="dekat" putar={200} goyang={goyang("hr-goyang-d")} className="top-[-20px] left-[12%] w-[22%] lg:left-[7%] lg:w-[8%]" sizes={sizes} />
      <Lapis src="alpinia.webp" nada="bunga" putar={14} balik goyang={goyang("hr-goyang-d")} className="top-1/2 right-[-6%] w-[24%] -translate-y-[60%] lg:right-[-1%] lg:w-[8%]" sizes={sizes} />
      <Lapis src="renealmia.webp" nada="dekat" putar={160} balik goyang={goyang("hr-goyang-c")} className="top-[-10px] right-[12%] w-[22%] lg:right-[7%] lg:w-[8%]" sizes={sizes} />
    </div>
  );
}

// Rumpun flora bergoyang di kedua sudut bawah penutup. Bagian tengah dibiarkan kosong untuk teks.
export function FloraTepi() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%]">
      <Lapis src="pakis.webp" nada="dekat" goyang={goyang("hr-goyang-d")} className="bottom-[-8%] left-[2%] w-[26%] lg:left-[8%] lg:w-[10%]" sizes="(min-width: 1024px) 10vw, 26vw" />
      <Lapis src="hibiskus.webp" nada="bunga" goyang={goyang("hr-goyang-e")} className="bottom-[-6%] left-[-10%] w-[30%] lg:left-[0%] lg:w-[11%]" sizes="(min-width: 1024px) 11vw, 30vw" />
      <Lapis src="pisang2.webp" nada="dekat" goyang={goyang("hr-goyang-c")} className="bottom-[-16%] left-[-34%] w-[56%] lg:left-[-8%] lg:w-[22%]" sizes="(min-width: 1024px) 22vw, 56vw" />
      <Lapis src="alpinia.webp" nada="bunga" goyang={goyang("hr-goyang-d")} balik className="right-[-4%] bottom-[-14%] w-[24%] lg:right-[4%] lg:w-[9%]" sizes="(min-width: 1024px) 9vw, 24vw" />
      <Lapis src="pisang2.webp" nada="dekat" goyang={goyang("hr-goyang-b")} balik className="right-[-36%] bottom-[-18%] w-[56%] lg:right-[-8%] lg:w-[22%]" sizes="(min-width: 1024px) 22vw, 56vw" />
    </div>
  );
}

type Kisah = { title: string; date: string; image: string; short: string; long: string };

function KartuKisah({ item, i, total }: { item: Kisah; i: number; total: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const reduce = useReducedMotion();
  // Kartu mengecil dan meredup saat kartu berikutnya menumpuk di atasnya.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 12%", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduce || i === total - 1 ? 1 : 0.9]);
  const redup = useTransform(scrollYProgress, [0, 1], [0, reduce || i === total - 1 ? 0 : 0.45]);
  const miring = i % 2 ? 1.2 : -1.2;
  return (
    <li ref={ref} className="sticky mb-[22vh] last:mb-0" style={{ top: `calc(max(72px, 9svh) + ${i * 26}px)` } as CSSProperties}>
      <motion.article style={{ scale, rotate: reduce ? 0 : miring, transformOrigin: "50% 0%" }} className="relative overflow-hidden rounded-sm bg-inv-wash text-inv-ink shadow-[0_24px_50px_rgba(28,18,17,.28)] ring-1 ring-inv-line">
        <div aria-hidden="true" className="hr-ulos h-3" />
        <div className="grid md:grid-cols-[1.05fr_1fr]">
          {item.image && (
            <div className={`relative aspect-[4/3] md:aspect-auto md:min-h-[380px] ${i % 2 ? "md:order-2" : ""}`}>
              <Image src={item.image} alt={item.title} fill sizes="(min-width: 768px) 480px, 92vw" className="object-cover" />
            </div>
          )}
          <div className="relative px-6 pt-6 pb-8 sm:px-9 sm:pt-9">
            <p aria-hidden="true" className="pointer-events-none absolute top-1 right-4 font-display text-[clamp(64px,16vw,120px)] leading-none font-semibold text-inv-gold/25">
              {String(i + 1).padStart(2, "0")}
            </p>
            <p className="text-[13px] tracking-[0.28em] text-inv-accent">{item.date}</p>
            <h3 className="mt-2 font-display text-[clamp(26px,6.4vw,36px)] leading-tight font-semibold">{item.title}</h3>
            <div aria-hidden="true" className="hr-ipon mt-3 h-2 w-24" />
            <p className="mt-4 max-w-[42ch] text-[17px] leading-relaxed text-inv-ink/85">{item.long || item.short}</p>
          </div>
        </div>
        <motion.div aria-hidden="true" style={{ opacity: redup }} className="pointer-events-none absolute inset-0 bg-inv-night" />
      </motion.article>
      <Lapis src="hibiskus.webp" nada="bunga" putar={i % 2 ? -20 : 20} goyang={goyang("hr-goyang-e")} className={`top-[-40px] w-[26%] max-w-[170px] ${i % 2 ? "left-[-6%]" : "right-[-6%]"}`} sizes="170px" />
      <Lapis src="pakis.webp" nada="bunga" putar={i % 2 ? 160 : 200} goyang={goyang("hr-goyang-d")} className={`bottom-[-30px] w-[20%] max-w-[130px] ${i % 2 ? "right-[-4%]" : "left-[-4%]"}`} sizes="130px" />
    </li>
  );
}

// Cerita sebagai tumpukan kartu: saat digulir, kartu berikutnya naik dan menumpuk di atas kartu sebelumnya.
export function KisahTumpuk({ items }: { items: Kisah[] }) {
  return (
    <ol className="relative mx-auto max-w-[920px] pb-[38vh]">
      {items.map((item, i) => (
        <KartuKisah key={item.title} item={item} i={i} total={items.length} />
      ))}
    </ol>
  );
}

const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0");

function sisa(target: number) {
  const d = Math.max(0, target - Date.now());
  return { habis: d === 0, hari: Math.floor(d / 864e5), jam: Math.floor(d / 36e5) % 24, menit: Math.floor(d / 6e4) % 60 };
}

// Hitung mundur dengan angka yang berganti seperti kartu dibalik, di atas kotak berpita ulos.
export function UlosCountdown({ target }: { target: string }) {
  const t = new Date(target).getTime();
  const [now, setNow] = useState<ReturnType<typeof sisa> | null>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const tick = () => setNow(sisa(t));
    const first = requestAnimationFrame(tick);
    const id = setInterval(tick, 1000);
    return () => {
      cancelAnimationFrame(first);
      clearInterval(id);
    };
  }, [t]);
  const satuan = [
    ["hari", "Hari"],
    ["jam", "Jam"],
    ["menit", "Menit"],
  ] as const;
  const selesai = now?.habis;
  return (
    <div role="timer" aria-live="off">
      {selesai ? (
        <p className="text-center font-display text-[clamp(26px,7vw,40px)] text-inv-gold-light">Hari bahagia sudah tiba</p>
      ) : (
        <div className="mx-auto grid max-w-[440px] grid-cols-3 gap-2.5 sm:gap-4">
          {satuan.map(([k, label]) => {
            const v = now ? (k === "hari" ? String(now.hari) : pad(now[k])) : "--";
            return (
              <div key={k} className="overflow-hidden rounded-sm bg-inv-night text-center shadow-[0_14px_28px_rgba(0,0,0,.35)]">
                <div aria-hidden="true" className="hr-ulos h-2.5" />
                <div className="relative h-[clamp(58px,15vw,84px)] overflow-hidden">
                  <AnimatePresence initial={false} mode="popLayout">
                    <motion.span
                      key={v}
                      initial={reduce ? false : { y: "-100%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      exit={reduce ? undefined : { y: "100%", opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
                      className="absolute inset-0 flex items-center justify-center font-display text-[clamp(28px,8vw,44px)] text-inv-gold-light tabular-nums"
                    >
                      {v}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <p className="pb-3 text-[11px] tracking-[0.2em] text-inv-wash/75 uppercase">{label}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
