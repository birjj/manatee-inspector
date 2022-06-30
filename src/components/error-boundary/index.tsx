import React from "react";

type BoundaryState = {
  hasError: boolean;
};
class ErrorBoundary extends React.Component<{}, BoundaryState> {
  state: BoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(error: any): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: React.ErrorInfo) {
    console.error(
      "Uncaught error:",
      error,
      errorInfo?.componentStack,
      errorInfo
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <h1 style={{ color: "var(--c-error)" }}>
          Uh oh... Check console for error.
        </h1>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
