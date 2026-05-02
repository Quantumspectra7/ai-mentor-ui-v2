'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StudyResource, studyResources } from '@/lib/lpuData';
import { ExternalLink, Filter } from 'lucide-react';

const resourceTypes: StudyResource['type'][] = ['playlist', 'course', 'doc', 'pdf', 'tool'];

export function StudyResources({ onBack }: { onBack?: () => void }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [level, setLevel] = useState<string>('all');
  const [type, setType] = useState<string>('all');

  const categories = useMemo(
    () => ['all', ...new Set(studyResources.map((item) => item.category))],
    []
  );

  const filtered = useMemo(() => {
    return studyResources.filter((item) => {
      const matchesQuery =
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));
      const matchesCategory = category === 'all' || item.category === category;
      const matchesLevel = level === 'all' || item.level === level;
      const matchesType = type === 'all' || item.type === type;

      return matchesQuery && matchesCategory && matchesLevel && matchesType;
    });
  }, [query, category, level, type]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          {onBack && (
            <Button variant="outline" className="mb-4" onClick={onBack}>
              ← Back
            </Button>
          )}
          <p className="eyebrow text-xs text-amber-600 dark:text-amber-300">Study Resources</p>
          <h1 className="font-display hero-title text-4xl text-foreground md:text-5xl">
            Curated Materials That Actually Help
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
            Handpicked playlists, notes, tools, and short courses from trusted seniors
            and official sources. Save time, study smart, and stay consistent.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-foreground/70">
          <Filter className="h-4 w-4" />
          {filtered.length} resources
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="luxe-card rounded-3xl p-6">
          <label className="text-xs uppercase tracking-[0.3em] text-foreground/70">
            Search
          </label>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by topic, subject, or tag"
            className="mt-3 border-amber-500/30 bg-muted/40 text-foreground placeholder:text-foreground/40"
          />
        </div>
        <div className="luxe-card rounded-3xl p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/70">Category</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((item) => (
                  <Button
                    key={item}
                    size="sm"
                    variant={category === item ? 'default' : 'outline'}
                    onClick={() => setCategory(item)}
                    className={
                      category === item
                        ? 'bg-amber-500 text-black hover:bg-amber-400'
                        : 'border-amber-500/30 text-foreground'
                    }
                  >
                    {item.replace('-', ' ')}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/70">Level</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['all', 'beginner', 'intermediate', 'advanced'].map((item) => (
                  <Button
                    key={item}
                    size="sm"
                    variant={level === item ? 'default' : 'outline'}
                    onClick={() => setLevel(item)}
                    className={
                      level === item
                        ? 'bg-amber-500 text-black hover:bg-amber-400'
                        : 'border-amber-500/30 text-foreground'
                    }
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/70">Type</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['all', ...resourceTypes].map((item) => (
                  <Button
                    key={item}
                    size="sm"
                    variant={type === item ? 'default' : 'outline'}
                    onClick={() => setType(item)}
                    className={
                      type === item
                        ? 'bg-amber-500 text-black hover:bg-amber-400'
                        : 'border-amber-500/30 text-foreground'
                    }
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((item) => (
          <Card key={item.id} className="luxe-card rounded-3xl border-amber-500/20">
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="eyebrow text-[10px] text-foreground/70">{item.category}</p>
                  <CardTitle className="font-display text-2xl text-foreground">
                    {item.title}
                  </CardTitle>
                </div>
                <Badge className="luxe-chip rounded-full px-3 py-1 text-xs">
                  {item.level}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline" className="border-amber-500/40 text-foreground">
                  {item.type}
                </Badge>
                <Badge variant="outline" className="border-amber-500/40 text-foreground">
                  {item.duration}
                </Badge>
                <Badge variant="outline" className="border-amber-500/40 text-foreground">
                  {item.source}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-amber-500/20 text-foreground/70">
                    #{tag}
                  </Badge>
                ))}
              </div>
              <Button
                asChild
                className="w-full bg-amber-500 text-black hover:bg-amber-400"
              >
                <a href={item.url} target="_blank" rel="noreferrer">
                  Open Resource <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="luxe-card rounded-3xl border-amber-500/20">
          <CardContent className="py-10 text-center text-muted-foreground">
            No resources match these filters yet. Try a different category or search term.
          </CardContent>
        </Card>
      )}
    </div>
  );
}


