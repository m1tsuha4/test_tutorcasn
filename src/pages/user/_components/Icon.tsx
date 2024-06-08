import { icons } from 'lucide-react';

const Icon = ({ name, color, size }: any) => {
  const LucideIcon = icons[name];

  return <LucideIcon color={color} size={size} />;
};

export default Icon;