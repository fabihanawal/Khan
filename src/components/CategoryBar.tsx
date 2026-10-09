import React from 'react';
import { Bug, Sprout, Wheat, Wrench, Sparkles, Layers } from 'lucide-react';
import { ProductCategory } from '../types';

interface CategoryBarProps {
  activeCategory: ProductCategory;
  onSelectCategory: (category: ProductCategory) => void;
  productsCountByCategory: Record<ProductCategory, number>;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  activeCategory,
  onSelectCategory,
  productsCountByCategory,
}) => {
  const categories: { id: ProductCategory; labelBn: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'all',
      labelBn: 'সকল কৃষি পণ্য',
      icon: <Layers className="w-4 h-4" />,
      color: 'emerald'
    },
    {
      id: 'pesticide',
      labelBn: 'কীটনাশক ও ছত্রাকনাশক',
      icon: <Bug className="w-4 h-4" />,
      color: 'amber'
    },
    {
      id: 'fertilizer',
      labelBn: 'সার ও অনুখাদ্য',
      icon: <Sparkles className="w-4 h-4" />,
      color: 'emerald'
    },
    {
      id: 'seed',
      labelBn: 'উন্নত হাইব্রিড বীজ',
      icon: <Wheat className="w-4 h-4" />,
      color: 'amber'
    },
    {
      id: 'organic',
      labelBn: 'খাঁটি জৈব সার',
      icon: <Sprout className="w-4 h-4" />,
      color: 'emerald'
    },
    {
      id: 'equipment',
      labelBn: 'স্প্রে মেশিন ও যন্ত্রপাতি',
      icon: <Wrench className="w-4 h-4" />,
      color: 'stone'
    },
  ];

  return (
    <div className="py-4 overflow-x-auto no-scrollbar scroll-smooth">
      <div className="flex items-center gap-2 pb-1 min-w-max">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const count = productsCountByCategory[cat.id] || 0;

          return (
            <button
              key={cat.id}
              id={`cat-btn-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm scale-100'
                  : 'bg-white text-stone-700 hover:bg-stone-100/80 border-stone-200 shadow-2xs hover:border-emerald-300'
              }`}
            >
              <span className={isActive ? 'text-amber-300' : 'text-emerald-700'}>
                {cat.icon}
              </span>
              <span>{cat.labelBn}</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                isActive ? 'bg-emerald-950 text-emerald-200' : 'bg-stone-100 text-stone-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
