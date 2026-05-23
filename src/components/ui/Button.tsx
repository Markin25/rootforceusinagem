import { forwardRef } from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const base = `
      relative inline-flex items-center justify-center font-semibold
      transition-all duration-300 ease-out
      focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:ring-offset-2 focus:ring-offset-black
      disabled:opacity-50 disabled:cursor-not-allowed
      overflow-hidden group
    `;

    const sizeStyles = {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-3 text-sm rounded-xl',
      lg: 'px-8 py-4 text-base rounded-xl',
    };

    const variants = {
      primary: `
        bg-gradient-to-r from-[#D4AF37] to-[#b49328] text-black
        hover:from-[#e6c864] hover:to-[#D4AF37]
        hover:shadow-lg hover:shadow-[#D4AF37]/25
        hover:-translate-y-0.5
        active:translate-y-0
      `,
      secondary: `
        bg-gray-800 text-white border border-gray-700
        hover:bg-gray-700 hover:border-gray-600
        hover:-translate-y-0.5
      `,
      outline: `
        bg-transparent text-[#D4AF37] border-2 border-[#D4AF37]
        hover:bg-[#D4AF37]/10
        hover:-translate-y-0.5
      `,
    };

    return (
      <button
        ref={ref}
        className={`${base} ${sizeStyles[size]} ${variants[variant]} ${className}`}
        {...props}
      >
        {/* Shimmer effect on hover */}
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
