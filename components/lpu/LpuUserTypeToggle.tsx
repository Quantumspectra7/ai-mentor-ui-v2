'use client';

import { Button } from '@/components/ui/button';
import { UserType } from '@/lib/lpuData';
import { useLpuUserType } from '@/hooks/use-lpu-user';

const types: { id: UserType; label: string }[] = [
  { id: 'pre-admission', label: 'Planning' },
  { id: 'new-student', label: 'Admitted' },
  { id: 'fresher', label: 'Fresher' },
];

export function LpuUserTypeToggle() {
  const { userType, setUserType } = useLpuUserType('pre-admission');

  return (
    <div className="flex flex-wrap items-center gap-2">
      {types.map((type) => (
        <Button
          key={type.id}
          size="sm"
          variant={userType === type.id ? 'default' : 'outline'}
          onClick={() => setUserType(type.id)}
          aria-pressed={userType === type.id}
          className={
            userType === type.id
              ? 'bg-amber-500 text-black hover:bg-amber-400'
              : 'border-amber-500/40 text-amber-100 hover:border-amber-400'
          }
        >
          {type.label}
        </Button>
      ))}
    </div>
  );
}
