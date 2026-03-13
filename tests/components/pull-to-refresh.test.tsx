import { render, fireEvent, screen } from '@testing-library/react';
import { PullToRefresh } from '@/components/pull-to-refresh';

describe('PullToRefresh', () => {
  let originalScrollY: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalScrollY = Object.getOwnPropertyDescriptor(window, 'scrollY');
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
  });

  afterEach(() => {
    if (originalScrollY) {
      Object.defineProperty(window, 'scrollY', originalScrollY);
    }
  });

  it('Renders children', () => {
    render(
      <PullToRefresh onRefresh={() => {}}>
        <div>Test Content</div>
      </PullToRefresh>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('Triggers refresh when pull exceeds threshold', () => {
    const onRefresh = jest.fn();
    const { container } = render(
      <PullToRefresh onRefresh={onRefresh}>
        <div>Test Content</div>
      </PullToRefresh>
    );

    const element = container.firstChild as HTMLElement;

    // Simulate pull gesture exceeding 80px threshold
    fireEvent.touchStart(element, { touches: [{ clientY: 100 }] });
    fireEvent.touchMove(element, { touches: [{ clientY: 200 }] }); // 100px pull
    fireEvent.touchEnd(element);

    expect(onRefresh).toHaveBeenCalled();
  });

  it('Does not trigger refresh below threshold', () => {
    const onRefresh = jest.fn();
    const { container } = render(
      <PullToRefresh onRefresh={onRefresh}>
        <div>Test Content</div>
      </PullToRefresh>
    );

    const element = container.firstChild as HTMLElement;

    // Simulate small pull below 80px threshold
    fireEvent.touchStart(element, { touches: [{ clientY: 100 }] });
    fireEvent.touchMove(element, { touches: [{ clientY: 150 }] }); // 50px pull
    fireEvent.touchEnd(element);

    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('Does not trigger refresh when not at top of page', () => {
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true, configurable: true });

    const onRefresh = jest.fn();
    const { container } = render(
      <PullToRefresh onRefresh={onRefresh}>
        <div>Test Content</div>
      </PullToRefresh>
    );

    const element = container.firstChild as HTMLElement;

    // Simulate pull gesture
    fireEvent.touchStart(element, { touches: [{ clientY: 100 }] });
    fireEvent.touchMove(element, { touches: [{ clientY: 200 }] }); // 100px pull
    fireEvent.touchEnd(element);

    // Should not trigger when not at top
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('Shows visual feedback during pull', () => {
    const { container } = render(
      <PullToRefresh onRefresh={() => {}}>
        <div>Test Content</div>
      </PullToRefresh>
    );

    const element = container.firstChild as HTMLElement;

    // Start pull
    fireEvent.touchStart(element, { touches: [{ clientY: 100 }] });
    fireEvent.touchMove(element, { touches: [{ clientY: 150 }] }); // 50px pull

    // Check if transform is applied (visual feedback)
    const style = element.getAttribute('style');
    expect(style).toBeTruthy();
  });
});
