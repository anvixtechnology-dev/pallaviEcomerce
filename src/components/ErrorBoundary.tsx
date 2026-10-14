import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || "An unexpected error occurred.",
    };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // Kept silent: raw errors are never shown to customers.
  }

  handleReset = (): void => {
    this.setState({ hasError: false, message: "" });
    window.location.href = "/";
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-steel-50 px-4">
        <div className="max-w-md rounded-xl border border-steel-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <h1 className="font-display text-2xl font-bold text-steel-900">Something went wrong</h1>
          <p className="mt-2 text-sm leading-relaxed text-steel-600">
            We could not load this page right now. Please refresh the page or try again in a moment.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-navy-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Back to home
          </button>
        </div>
      </div>
    );
  }
}
