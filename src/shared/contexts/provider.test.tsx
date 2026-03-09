import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AudioProvider, useAudioState } from './provider';
import { useAudioActions, useAudioStateOnly } from './audioUtils';

const TestComponent = () => {
  const audioState = useAudioState();
  const audioActions = useAudioActions();
  
  return (
    <div>
      <div data-testid="audio-state">{JSON.stringify(audioState.state)}</div>
      <div data-testid="audio-actions">{typeof audioActions.play}</div>
    </div>
  );
};

const TestComponentStateOnly = () => {
  const audioState = useAudioStateOnly();
  
  return (
    <div data-testid="audio-state-only">{JSON.stringify(audioState)}</div>
  );
};

describe('AudioContext', () => {
  it('should provide initial state', () => {
    render(
      <AudioProvider>
        <TestComponent />
      </AudioProvider>
    );

    const audioStateElement = screen.getByTestId('audio-state');
    const state = JSON.parse(audioStateElement.textContent || '{}');
    
    expect(state).toEqual({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      error: '',
      inputValue: '',
    });
  });

  it('should provide actions', () => {
    render(
      <AudioProvider>
        <TestComponent />
      </AudioProvider>
    );

    const audioActionsElement = screen.getByTestId('audio-actions');
    
    expect(audioActionsElement.textContent).toBe('function');
  });

  it('should provide audio state only', () => {
    render(
      <AudioProvider>
        <TestComponentStateOnly />
      </AudioProvider>
    );

    const audioStateElement = screen.getByTestId('audio-state-only');
    const state = JSON.parse(audioStateElement.textContent || '{}');
    
    expect(state).toEqual({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      error: '',
      inputValue: '',
    });
  });

  it('should handle initial input value', () => {
    render(
      <AudioProvider initialInputValue="initial value">
        <TestComponentStateOnly />
      </AudioProvider>
    );

    const audioStateElement = screen.getByTestId('audio-state-only');
    const state = JSON.parse(audioStateElement.textContent || '{}');
    
    expect(state.inputValue).toBe('initial value');
  });

  it('should throw error when useAudioState is used outside provider', () => {
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAudioState must be used within AudioProvider');
  });

  it('should throw error when useAudioActions is used outside provider', () => {
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAudioState must be used within AudioProvider');
  });

  it('should throw error when useAudioStateOnly is used outside provider', () => {
    expect(() => {
      render(<TestComponentStateOnly />);
    }).toThrow('useAudioState must be used within AudioProvider');
  });
});
