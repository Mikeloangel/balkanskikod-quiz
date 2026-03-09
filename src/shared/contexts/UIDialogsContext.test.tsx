import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { UIDialogsProvider, useUIDialogs } from './UIDialogsContext';

describe('UIDialogsContext', () => {
  it('should provide initial dialog state', () => {
    const { result } = renderHook(() => useUIDialogs(), {
      wrapper: ({ children }) => (
        <UIDialogsProvider>
          {children}
        </UIDialogsProvider>
      ),
    });

    expect(result.current.state.isShareOpen).toBe(false);
    expect(result.current.state.isGiveUpOpen).toBe(false);
    expect(result.current.state.shareFeedback).toBeNull();
    expect(result.current.state.startedProgressSignature).toBeNull();
  });

  it('should provide dialog actions', () => {
    const { result } = renderHook(() => useUIDialogs(), {
      wrapper: ({ children }) => (
        <UIDialogsProvider>
          {children}
        </UIDialogsProvider>
      ),
    });

    expect(typeof result.current.actions.openShareDialog).toBe('function');
    expect(typeof result.current.actions.closeShareDialog).toBe('function');
    expect(typeof result.current.actions.openGiveUpDialog).toBe('function');
    expect(typeof result.current.actions.closeGiveUpDialog).toBe('function');
    expect(typeof result.current.actions.setShareFeedback).toBe('function');
    expect(typeof result.current.actions.setStartedProgressSignature).toBe('function');
    expect(typeof result.current.actions.resetDialogs).toBe('function');
  });

  it('should handle share dialog state changes', () => {
    const { result } = renderHook(() => useUIDialogs(), {
      wrapper: ({ children }) => (
        <UIDialogsProvider>
          {children}
        </UIDialogsProvider>
      ),
    });

    expect(result.current.state.isShareOpen).toBe(false);

    act(() => {
      result.current.actions.openShareDialog();
    });
    expect(result.current.state.isShareOpen).toBe(true);

    act(() => {
      result.current.actions.closeShareDialog();
    });
    expect(result.current.state.isShareOpen).toBe(false);
  });

  it('should handle give up dialog state changes', () => {
    const { result } = renderHook(() => useUIDialogs(), {
      wrapper: ({ children }) => (
        <UIDialogsProvider>
          {children}
        </UIDialogsProvider>
      ),
    });

    expect(result.current.state.isGiveUpOpen).toBe(false);

    act(() => {
      result.current.actions.openGiveUpDialog();
    });
    expect(result.current.state.isGiveUpOpen).toBe(true);

    act(() => {
      result.current.actions.closeGiveUpDialog();
    });
    expect(result.current.state.isGiveUpOpen).toBe(false);
  });

  it('should handle share feedback', () => {
    const { result } = renderHook(() => useUIDialogs(), {
      wrapper: ({ children }) => (
        <UIDialogsProvider>
          {children}
        </UIDialogsProvider>
      ),
    });

    expect(result.current.state.shareFeedback).toBeNull();

    act(() => {
      result.current.actions.setShareFeedback('Test feedback');
    });
    expect(result.current.state.shareFeedback).toBe('Test feedback');

    act(() => {
      result.current.actions.setShareFeedback(null);
    });
    expect(result.current.state.shareFeedback).toBeNull();
  });

  it('should handle started progress signature', () => {
    const { result } = renderHook(() => useUIDialogs(), {
      wrapper: ({ children }) => (
        <UIDialogsProvider>
          {children}
        </UIDialogsProvider>
      ),
    });

    expect(result.current.state.startedProgressSignature).toBeNull();

    act(() => {
      result.current.actions.setStartedProgressSignature('test-signature');
    });
    expect(result.current.state.startedProgressSignature).toBe('test-signature');

    act(() => {
      result.current.actions.setStartedProgressSignature(null);
    });
    expect(result.current.state.startedProgressSignature).toBeNull();
  });

  it('should reset all dialogs', () => {
    const { result } = renderHook(() => useUIDialogs(), {
      wrapper: ({ children }) => (
        <UIDialogsProvider>
          {children}
        </UIDialogsProvider>
      ),
    });

    // Open all dialogs and set feedback
    act(() => {
      result.current.actions.openShareDialog();
      result.current.actions.openGiveUpDialog();
      result.current.actions.setShareFeedback('Some feedback');
      result.current.actions.setStartedProgressSignature('signature');
    });

    expect(result.current.state.isShareOpen).toBe(true);
    expect(result.current.state.isGiveUpOpen).toBe(true);
    expect(result.current.state.shareFeedback).toBe('Some feedback');
    expect(result.current.state.startedProgressSignature).toBe('signature');

    // Reset
    act(() => {
      result.current.actions.resetDialogs();
    });
    expect(result.current.state.isShareOpen).toBe(false);
    expect(result.current.state.isGiveUpOpen).toBe(false);
    expect(result.current.state.shareFeedback).toBeNull();
    expect(result.current.state.startedProgressSignature).toBeNull();
  });
});
