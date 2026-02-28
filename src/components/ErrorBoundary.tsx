import { Component, type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (!this.state.hasError) return this.props.children;

        if (this.props.fallback) return this.props.fallback;

        return (
            <div className="error-boundary">
                <div className="error-boundary-card">
                    <div className="error-boundary-icon">⚠️</div>
                    <h2 className="error-boundary-title">Algo salió mal</h2>
                    <p className="error-boundary-message">
                        Ha ocurrido un error inesperado. Puedes intentar recargar la página.
                    </p>
                    {this.state.error && (
                        <details className="error-boundary-details">
                            <summary>Detalles técnicos</summary>
                            <pre>{this.state.error.message}</pre>
                        </details>
                    )}
                    <div className="error-boundary-actions">
                        <button onClick={this.handleReset} className="btn btn-primary">Reintentar</button>
                        <button onClick={() => window.location.reload()} className="btn btn-accent">Recargar Página</button>
                    </div>
                </div>
            </div>
        );
    }
}
