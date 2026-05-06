import React from 'react';
import { Button, Icons } from '@shared/ui';

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[AppErrorBoundary] Unhandled render error:', error, info);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleHome = () => {
    window.location.href = '/home';
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-6 text-[var(--text-primary)]">
        <div className="w-full max-w-[520px] rounded-[8px] border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-8 text-center shadow-none shadow-black/5">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[8px] border border-[var(--border-primary)] bg-[var(--bg-primary)]">
            <Icons.Boost size={30} weight="bold" className="text-[var(--text-primary)]" />
          </div>
          <h1 className="text-[28px] font-black tracking-tight">Something went sideways</h1>
          <p className="mt-3 text-[14px] font-medium leading-6 text-[var(--text-muted)]">
            Arteo hit an unexpected interface error. Your session is still intact, and a reload usually gets things moving again.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={this.handleReload}>Reload page</Button>
            <Button variant="secondary" onClick={this.handleHome}>Go home</Button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-6 max-h-40 overflow-auto rounded-[8px] border border-[var(--border-primary)] bg-[var(--bg-primary)] p-4 text-left text-[11px] text-[var(--text-muted)]">
              {this.state.error.message}
            </pre>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
