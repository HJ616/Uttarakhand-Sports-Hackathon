import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage, t } = useLanguage();

  const handleLanguageChange = (event) => {
    changeLanguage(event.target.value);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>{t('language')}</InputLabel>
      <Select
        value={currentLanguage}
        onChange={handleLanguageChange}
        label={t('language')}
      >
        <MenuItem value="en">{t('english')}</MenuItem>
        <MenuItem value="hi">{t('hindi')}</MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;