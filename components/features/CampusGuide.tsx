'use client';

import { useState } from 'react';
import { ArrowLeft, MapPin, Navigation } from 'lucide-react';
import { campusGuide } from '@/lib/phaseData';

interface CampusGuideProps {
  onBack: () => void;
}

export function CampusGuide({ onBack }: CampusGuideProps) {
  const [activeTab, setActiveTab] = useState<'buildings' | 'facilities' | 'resources'>('buildings');
  const tabs: Array<typeof activeTab> = ['buildings', 'facilities', 'resources'];

  const renderItems = () => {
    const items = campusGuide[activeTab];
    return items.map((item, index) => (
      <div key={index} className="bg-card border rounded-2xl p-6 transition-all hover:border-primary/40 hover:shadow-md group animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${index * 50}ms` }}>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 text-primary transition-colors text-2xl shrink-0 border border-primary/20">
            {item.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{item.name}</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed font-medium">{item.description}</p>
            <div className="flex items-start gap-2 pt-3 border-t">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-muted-foreground">{item.tips}</p>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-background relative font-sans text-foreground">

      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-card border rounded-xl hover:bg-accent hover:border-accent-foreground/20 transition-all shadow-sm shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-display tracking-tight text-foreground">Campus Guide</h1>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">Navigate, explore, and discover your campus</p>
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Tabs */}
        <div className="flex gap-3 mb-10 flex-wrap animate-in fade-in slide-in-from-bottom-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 outline-none rounded-xl text-sm font-bold transition-all shadow-sm capitalize ${
                activeTab === tab
                  ? 'bg-primary text-primary-foreground border-primary border'
                  : 'bg-card border hover:border-primary/40 hover:bg-accent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {renderItems()}
        </div>

        {/* Helpful Tips */}
        <div className="bg-card border rounded-3xl p-8 md:p-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-start gap-4 mb-8">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 shrink-0">
               <Navigation className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-foreground">Getting Around Campus</h3>
              <p className="text-sm font-medium text-muted-foreground mt-1">Essential tips for navigating effectively.</p>
            </div>
          </div>
          <ul className="space-y-4">
            {[
              "Get a campus map from the information desk on day 1",
              "Walk around with your wing mates to explore and get familiar",
              "Mark important locations (classes, library, mess) on your phone",
              "Seniors are your best guide. Don't hesitate to ask for directions",
              "Explore one new area every day to build confidence"
            ].map((tip, idx) => (
              <li key={idx} className="flex gap-4 items-start text-sm font-medium text-muted-foreground group">
                <div className="w-6 h-6 shrink-0 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all font-bold text-[10px]">
                  ✓
                </div>
                <span className="mt-0.5 group-hover:text-foreground transition-colors leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

      </main>
    </div>
  );
}
