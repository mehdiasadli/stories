import Image from 'next/image';

import logoDarkBg from '@/public/mahmud-square-logo-dark-bg.svg';
import logoWhiteBg from '@/public/mahmud-square-logo-white-bg.svg';

interface LogoProps {
  variant?: 'dark' | 'white';
  size?: number;
}

export default function Logo({ variant = 'dark', size = 24 }: LogoProps) {
  const logo = variant === 'dark' ? logoDarkBg : logoWhiteBg;

  return <Image src={logo} alt='logo' width={size} height={size} />;
}
