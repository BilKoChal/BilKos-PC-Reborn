
import React, { memo } from 'react';
import { Users, BookOpen, Briefcase } from 'lucide-react';

// Compact variant configuration
const VARIANTS = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    decoration: 'bg-blue-500/10',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30'
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    decoration: 'bg-red-500/10',
    iconBg: 'bg-red-100 dark:bg-red-900/30'
  },
  yellow: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    decoration: 'bg-yellow-500/10',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30'
  }
} as const;

type VariantType = keyof typeof VARIANTS;

const FeatureCard: React.FC<{ 
  icon: React.ElementType;
  title: string; 
  desc: string; 
  color: VariantType;
}> = memo(({ icon: Icon, title, desc, color }) => {
  const v = VARIANTS[color];

  return (
    <div className="group relative p-6 bg-white dark:bg-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:-translate-y-1 overflow-hidden">
      {/* Decorative Corner Blob */}
      <div className={`absolute top-0 right-0 w-24 h-24 ${v.decoration} rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-500`}></div>
      
      {/* Icon Container */}
      <div className={`w-12 h-12 rounded-xl ${v.iconBg} flex items-center justify-center mb-4 ${v.text} dark:text-${color}-400 group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={24} />
      </div>
      
      {/* Title */}
      <h3 className={`text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:${v.text} transition-colors`}>
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        {desc}
      </p>
    </div>
  );
});

export const Features: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-16 px-4">
      <FeatureCard 
        icon={Users}
        title="Team Editor"
        desc="Modify stats, moves, IVs/EVs, and personality values. Build your perfect competitive team instantly."
        color="blue"
      />
      <FeatureCard 
        icon={BookOpen}
        title="Pokedex Manager"
        desc="Complete your Pokedex with a single click or edit individual entries seen and caught flags."
        color="red"
      />
      <FeatureCard 
        icon={Briefcase}
        title="Inventory Tools"
        desc="Manage items, key items, and balls. Inject rare candies or master balls directly into your bag."
        color="yellow"
      />
    </div>
  );
};
