import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface PortalErrorBoundaryProps {
  children: React.ReactNode;
  onResetView?: () => void;
}

interface PortalErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class PortalErrorBoundary extends React.Component<
  PortalErrorBoundaryProps,
  PortalErrorBoundaryState
> {
  constructor(props: PortalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): PortalErrorBoundaryState {
    let readable = error.message || 'An unexpected error occurred.';
    if (readable.startsWith('{')) {
      try {
        const parsed = JSON.parse(readable) as { error?: string; path?: string };
        if (parsed.error) {
          readable = parsed.path
            ? `${parsed.error} (${parsed.path})`
            : parsed.error;
        }
      } catch {
        // Keep raw message
      }
    }
    return { hasError: true, message: readable };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="clay-card p-8 space-y-4">
            <div className="flex items-center gap-3 text-[#B83A2D]">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h2 className="text-lg font-semibold text-[#171A2F]">
                Unable to complete portal action
              </h2>
            </div>
            <p className="text-sm text-[#6F7487] leading-relaxed">{this.state.message}</p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, message: '' });
                  this.props.onResetView?.();
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F49A3C] text-white text-sm font-semibold hover:bg-[#E5882A] cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload View</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
