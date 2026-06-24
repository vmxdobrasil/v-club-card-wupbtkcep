export function BrandLogo() {
  return (
    <div className="flex items-center space-x-1 font-sans font-bold select-none cursor-pointer">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white text-xl leading-none">
        V
      </div>
      <div className="bg-red-600 text-white px-2 py-1 text-sm tracking-widest leading-none rounded-sm">
        CLUB
      </div>
      <div className="bg-blue-600 text-white px-2 py-1 text-sm italic tracking-widest leading-none rounded-sm">
        CARD
      </div>
    </div>
  )
}
