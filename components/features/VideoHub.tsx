'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, videoData, UserType } from '@/lib/lpuData';
import { Play, Eye, ThumbsUp, Bookmark, ArrowLeft, PlayCircle } from 'lucide-react';

interface VideoHubProps {
  userType: UserType;
  onBack?: () => void;
}

export function VideoHub({ userType, onBack }: VideoHubProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [watchLater, setWatchLater] = useState<string[]>([]);

  useEffect(() => {
    const filtered = videoData.filter((v) => v.forUserTypes.includes(userType));
    setVideos(filtered);
    const saved = localStorage.getItem(`watchLater-${userType}`);
    if (saved) setWatchLater(JSON.parse(saved));
  }, [userType]);

  const categories = ['all', ...Array.from(new Set(videos.map((v) => v.category)))];

  const displayVideos =
    selectedCategory === 'all'
      ? videos
      : videos.filter((v) => v.category === selectedCategory);

  const toggleWatchLater = (videoId: string) => {
    const updated = watchLater.includes(videoId)
      ? watchLater.filter((id) => id !== videoId)
      : [...watchLater, videoId];
    setWatchLater(updated);
    localStorage.setItem(`watchLater-${userType}`, JSON.stringify(updated));
  };

  return (
    <div className="space-y-12">
        {/* Header */}
        <div className="relative mb-12 p-8 md:p-12 rounded-[2.5rem] bg-card border shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="relative z-10">
            {onBack && (
              <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground border bg-background hover:bg-accent rounded-full pl-3 pr-5 shadow-sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
              </Button>
            )}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide uppercase mb-5 shadow-sm">
              <PlayCircle className="w-4 h-4" /> Media Library
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight text-foreground mb-3">
              AI <span className="text-primary">Vision</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
              Curated cinematic experiences and essential guides tailored exclusively for <span className="capitalize font-semibold text-foreground">{userType.replace('-', ' ')}</span> students.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-background border rounded-2xl p-4 shadow-sm shrink-0">
             <div className="text-center px-4 border-r">
               <p className="text-3xl font-bold text-foreground">{videos.length}</p>
               <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Videos</p>
             </div>
             <div className="text-center px-4">
               <p className="text-3xl font-bold text-primary">{watchLater.length}</p>
               <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Saved</p>
             </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-10 flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border shadow-sm ${
                selectedCategory === cat
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-card border-input text-muted-foreground hover:bg-accent hover:text-foreground hover:border-accent-foreground/20'
              }`}
            >
              {cat === 'all' && '✨ '}
              {cat === 'campus-tour' ? '🏫 ' : cat === 'admission' ? '📝 ' : cat === 'hostel' ? '🛏️ ' : cat === 'academics' ? '📚 ' : cat === 'coding' ? '💻 ' : ''}
              {cat.replace('-', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        {/* Video Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              isWatchLater={watchLater.includes(video.id)}
              onToggleWatchLater={() => toggleWatchLater(video.id)}
            />
          ))}
        </div>

        {/* Watch Later Tray */}
        {watchLater.length > 0 && (
          <div className="mt-16 relative p-8 md:p-10 rounded-[2.5rem] border bg-card shadow-sm">
            <div className="relative z-10">
              <h2 className="font-display text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
                <Bookmark className="w-6 h-6 text-primary" /> Saved For Later ({watchLater.length})
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {videos
                  .filter((v) => watchLater.includes(v.id))
                  .map((video) => (
                    <div
                      key={video.id}
                      className="group flex items-center gap-4 p-4 rounded-2xl border bg-background hover:bg-accent transition-all cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <div className="relative w-24 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm border">
                        <img 
                          src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`} 
                          alt="Thumbnail"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-muted/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">{video.title}</p>
                        <p className="text-xs text-muted-foreground font-medium mt-1">{video.duration} min</p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); toggleWatchLater(video.id); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive text-muted-foreground h-9 w-9 rounded-full shrink-0 border bg-background"
                      >
                         ✕
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

function VideoCard({
  video,
  isWatchLater,
  onToggleWatchLater,
}: {
  video: Video;
  isWatchLater: boolean;
  onToggleWatchLater: () => void;
}) {
  return (
    <Card className="relative h-[22rem] group overflow-hidden border bg-background rounded-3xl cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Background Thumbnail */}
      <img
        src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
        alt={video.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
      
      {/* Play Button */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100 z-10">
        <div className="w-16 h-16 rounded-full bg-primary/90 text-primary-foreground backdrop-blur-md flex items-center justify-center shadow-lg">
          <Play className="w-7 h-7 ml-1" />
        </div>
      </div>

      {/* Duration Badge */}
      <div className="absolute top-4 right-4 z-20">
        <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-sm">
          {video.duration}m
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end translate-y-2 group-hover:translate-y-0 transition-transform duration-500 z-20">
        <div className="flex gap-2 mb-3">
          {video.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px] uppercase font-bold tracking-wider border-primary/50 text-white bg-primary/40 backdrop-blur-md">
              {tag}
            </Badge>
          ))}
        </div>
        
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {video.title}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-white/70 mt-3 font-medium opacity-70 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Eye className="w-4 h-4"/> {video.views.toLocaleString()}</span>
            <span className="flex items-center gap-1.5"><ThumbsUp className="w-4 h-4"/> {video.helpful}</span>
          </div>
          <Button 
            size="icon" 
            variant="ghost" 
            className={`h-9 w-9 rounded-full ${isWatchLater ? 'bg-primary text-primary-foreground border-transparent' : 'bg-white/10 text-white border-white/20'} hover:bg-white/20 border`}
            onClick={(e) => { e.stopPropagation(); onToggleWatchLater(); }}
          >
            <Bookmark className={isWatchLater ? 'fill-current' : ''} size={15} />
          </Button>
        </div>
      </div>
    </Card>
  );
}

