const Logo = "/logo_white.png";

export function BrandPanel() {
  return (
    <aside className="flex h-24 items-center justify-center bg-gradient-to-br from-[#1F1F1F] via-[#4A4A4A] to-[#2B2B2B] px-6 text-center text-white lg:h-auto lg:px-12">
      <div className="flex flex-col items-center gap-6">
        <img src={Logo} alt="Home Culture" className="h-10 w-auto lg:h-16" />
        <div className="hidden space-y-2 lg:block">
          <h2 className="text-2xl font-semibold">Home Culture</h2>
        </div>
        <p className="hidden text-xs text-white/50 lg:block">
          © {new Date().getFullYear()} Home Culture. All rights reserved.
        </p>
      </div>
    </aside>
  );
}
