import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useLanguage } from '@/shared/contexts/LanguageContext';

export const LanguageSelector: React.FC = () => {
  const { changeLanguage, availableLanguages } = useLanguage();
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as string;

  const handleChange = (event: SelectChangeEvent<string>) => {
    const newLanguage = event.target.value as string;
    console.log('LanguageSelector: handleChange called with:', newLanguage);
    changeLanguage(newLanguage as any);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 80 }}>
      <Select
        value={currentLanguage}
        onChange={handleChange}
        sx={{
          '& .MuiSelect-select': {
            padding: '8px 12px',
            fontSize: '0.875rem',
            fontWeight: 500,
          },
        }}
      >
        {availableLanguages.map((language) => (
          <MenuItem key={language.code} value={language.code}>
            {language.nativeName}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
