interface HamburgerIconProps {
  isOpen: boolean;
  className?: string;
}

export function HamburgerIcon({ isOpen, className = "" }: HamburgerIconProps) {
  return (
    <div className={`relative w-5 h-5 flex flex-col justify-center items-center ${className}`}>
      <span
        className={`block absolute h-0.5 w-5 bg-current transform transition-all duration-300 ease-out ${
          isOpen ? "rotate-45" : "-translate-y-1.5"
        }`}
      />
      <span
        className={`block absolute h-0.5 bg-current transform transition-all duration-300 ease-out ${
          isOpen ? "w-0 opacity-0" : "w-3.5 opacity-100"
        }`}
      />
      <span
        className={`block absolute h-0.5 w-5 bg-current transform transition-all duration-300 ease-out ${
          isOpen ? "-rotate-45" : "translate-y-1.5"
        }`}
      />
    </div>
  );
}
