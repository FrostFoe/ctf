'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const regions = [
  { value: 'US', label: 'ঢাকা' },
  { value: 'GB', label: 'চট্টগ্রাম' },
  { value: 'DE', label: 'খুলনা' },
  { value: 'PT', label: 'রাজশাহী' },
  { value: 'IN', label: 'বরিশাল' },
  { value: 'BR', label: 'সিলেট' },
  { value: 'OTHERS', label: 'রংপুর' },
];

interface Props {
  country: string;
  onCountryChange: (value: string) => void;
}

export function CountryDropdown({ country, onCountryChange }: Props) {
  const selected = regions.find((region) => region.value === country) || regions[0];
  return (
    <Select defaultValue={'US'} onValueChange={(value) => onCountryChange(value)} value={selected.value}>
      <SelectTrigger className="w-[220px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {regions.map((region) => (
          <SelectItem key={region.value} value={region.value}>
            {region.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
