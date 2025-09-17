'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const teamMembers = [
  {
    name: 'Daniel Cromitch',
    email: 'dc@company.com',
    initials: 'DC',
    role: 'মালিক',
  },
  {
    name: 'Melissa Lee',
    email: 'ml@company.com',
    initials: 'ML',
    role: 'সদস্য',
  },
  {
    name: 'Jackson Khan',
    email: 'JK@company.com',
    initials: 'JK',
    role: 'সদস্য',
  },
  {
    name: 'Isa Lopez',
    email: 'il@company.com',
    initials: 'IL',
    role: 'অতিথি',
  },
];

export function DashboardTeamMembersCard() {
  return (
    <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
      <CardHeader className="p-0 space-y-0">
        <CardTitle className="flex justify-between gap-2 items-center pb-6 border-border border-b">
          <div className={'flex flex-col gap-2'}>
            <span className={'text-xl font-medium'}>দলের সদস্য</span>
            <span className={'text-base leading-4 text-secondary'}>সহযোগিতার জন্য আপনার দলের সদস্যদের আমন্ত্রণ জানান</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className={'p-0 pt-6 flex gap-6 flex-col'}>
        {teamMembers.map((teamMember) => (
          <div key={teamMember.email} className={'flex justify-between items-center gap-2'}>
            <div className={'flex gap-4'}>
              <div className={'flex items-center justify-center px-3 py-4'}>
                <span className={'text-white text-base w-5'}>{teamMember.initials}</span>
              </div>
              <div className={'flex flex-col gap-2'}>
                <span className={'text-base leading-4 font-medium'}>{teamMember.name}</span>
                <span className={'text-base leading-4 text-secondary'}>{teamMember.email}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
