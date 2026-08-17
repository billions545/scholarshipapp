import Image from "next/image";

// The wordmark art has a navy word "EduBridge" that disappears on dark
// backgrounds — so dark surfaces (admin header, footer) use the icon mark
// plus a plain white text label instead of the full lockup.
export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/images/logo-full.png"
      alt="Edu Bridge Point"
      width={1774}
      height={887}
      priority
      className={className ?? "h-10 w-auto"}
    />
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/images/logo-icon.png"
      alt="Edu Bridge Point"
      width={850}
      height={850}
      priority
      className={className ?? "h-9 w-9"}
    />
  );
}
