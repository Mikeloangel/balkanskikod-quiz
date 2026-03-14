import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { vi, beforeEach, expect, describe, it } from 'vitest';
import i18n from '@/shared/i18n';
import { LanguageProvider, useLanguage } from './LanguageContext';

// Test component to use the hook
const TestComponent: React.FC = () => {
  const { currentLanguage, availableLanguages } = useLanguage();
  
  return (
    <div>
      <div data-testid="current-language">{currentLanguage}</div>
      <div data-testid="available-languages">
        {availableLanguages.map(lang => lang.code).join(',')}
      </div>
    </div>
  );
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <LanguageProvider>
        {component}
      </LanguageProvider>
    </I18nextProvider>
  );
};

describe('LanguageContext', () => {
  beforeEach(() => {
    localStorage.clear();
    i18n.changeLanguage('ru');
  });

  it('should render with default language', () => {
    renderWithProviders(<TestComponent />);
    
    const currentLangEl = screen.getByTestId('current-language');
    const availableLangsEl = screen.getByTestId('available-languages');
    
    expect(currentLangEl.textContent).toBe('ru');
    expect(availableLangsEl.textContent).toBe('ru,en,sr,sr-cyrl');
  });

  it('should have correct available languages', () => {
    renderWithProviders(<TestComponent />);
    
    const availableLanguages = screen.getByTestId('available-languages').textContent;
    
    expect(availableLanguages).toBe('ru,en,sr,sr-cyrl');
  });

  it('should throw error when useLanguage is used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useLanguage must be used within a LanguageProvider');
    
    consoleError.mockRestore();
  });
});
