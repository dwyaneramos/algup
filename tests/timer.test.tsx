import TestRenderer, { act } from 'react-test-renderer';
import { useTimer } from '@/src/hooks/useTimer';

type TimerApi = ReturnType<typeof useTimer>;

function renderTimer() {
  const api = { current: null as unknown as TimerApi };
  function Probe() {
    api.current = useTimer();
    return null;
  }
  act(() => {
    TestRenderer.create(<Probe />);
  });
  return api;
}

describe('useTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('freezes the exact elapsed time on stop', () => {
    const api = renderTimer();

    act(() => api.current.start());
    act(() => {
      jest.advanceTimersByTime(1234);
    });
    act(() => api.current.stop());

    expect(api.current.time).toBe(1234);
    expect(api.current.formatted()).toBe('1.23');
  });

  it('does not keep counting after stop', () => {
    const api = renderTimer();

    act(() => api.current.start());
    act(() => {
      jest.advanceTimersByTime(500);
    });
    act(() => api.current.stop());
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(api.current.running).toBe(false);
    expect(api.current.time).toBe(500);
  });

  it('restarts from zero', () => {
    const api = renderTimer();

    act(() => api.current.start());
    act(() => {
      jest.advanceTimersByTime(800);
    });
    act(() => api.current.stop());
    act(() => api.current.start());

    expect(api.current.running).toBe(true);
    expect(api.current.time).toBe(0);
  });

  it('stops when the handler was captured before the timer started', () => {
    const api = renderTimer();
    const staleStop = api.current.stop;

    act(() => api.current.start());
    act(() => {
      jest.advanceTimersByTime(500);
    });
    act(() => staleStop());
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(api.current.running).toBe(false);
    expect(api.current.time).toBe(500);
  });

  it('does not restart when a stale start lands on a running timer', () => {
    const api = renderTimer();
    const staleStart = api.current.start;

    act(() => api.current.start());
    act(() => {
      jest.advanceTimersByTime(300);
    });
    act(() => staleStart());
    act(() => {
      jest.advanceTimersByTime(200);
    });
    act(() => api.current.stop());

    expect(api.current.time).toBe(500);
  });

  it('ignores stop when not running', () => {
    const api = renderTimer();

    act(() => api.current.stop());

    expect(api.current.running).toBe(false);
    expect(api.current.time).toBe(0);
  });
});
