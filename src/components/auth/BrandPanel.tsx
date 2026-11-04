const Logo = "/home-culture-logo.svg";

export function BrandPanel() {
  return (
    <aside className="flex h-24 items-center justify-center bg-gradient-to-br from-[#3B2A20] via-[#B8634A] to-[#8F4A36] px-6 text-center text-white lg:h-auto lg:px-12">
      <div className="flex flex-col items-center gap-6">
        <div className="rounded-2xl bg-white px-6 py-4 shadow-lg">
          <img src={Logo} alt="Home Culture" className="h-8 w-auto lg:h-12" />
        </div>
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
