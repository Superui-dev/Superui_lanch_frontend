import React, { Component } from 'react';
import { classifyError, ERROR_SEVERITIES } from '../../utils/errorClassifier';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Bug, Terminal, ShieldAlert } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorDiagnostic: null,
      showTechnicalDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    const diagnostic = classifyError(error);
    return {
      hasError: true,
      errorDiagnostic: diagnostic
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log React component stack trace to console nicely
    console.error('🔴 React ErrorBoundary Caught Component Error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      errorDiagnostic: null,
      showTechnicalDetails: false
    });
  };

  toggleDetails = () => {
    this.setState(prev => ({ showTechnicalDetails: !prev.showTechnicalDetails }));
  };

  render() {
    if (this.state.hasError) {
      const diag = this.state.errorDiagnostic || {};
      const isCritical = diag.severity === ERROR_SEVERITIES.CRITICAL;

      return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 font-sans">
          <div className="max-w-2xl w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
            
            {/* Header / Severity Badge */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl ${isCritical ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Application Exception Intercepted</h1>
                  <p className="text-xs text-neutral-400">Error Classification ID: <span className="font-mono text-indigo-400">{diag.errorId}</span></p>
                </div>
              </div>
              
              <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
                isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {diag.severity || 'ERROR'}
              </span>
            </div>

            {/* User Friendly Message */}
            <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-xl p-4 space-y-2">
              <p className="text-sm text-neutral-200 font-medium leading-relaxed">
                {diag.userMessage || 'An unhandled user interface exception occurred.'}
              </p>
              <div className="flex items-center space-x-2 text-xs text-neutral-400">
                <Bug className="w-4 h-4 text-neutral-500" />
                <span>Layer: <strong className="text-neutral-300">{diag.layer}</strong> | Category: <strong className="text-neutral-300">{diag.category}</strong></span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-sm px-5 py-2.5 rounded-xl transition-all border border-neutral-700"
              >
                Try Recovering Component
              </button>

              <button
                type="button"
                onClick={this.toggleDetails}
                className="flex items-center space-x-1.5 text-xs text-neutral-400 hover:text-white transition-colors ml-auto py-2 px-3"
              >
                <Terminal className="w-4 h-4" />
                <span>{this.state.showTechnicalDetails ? 'Hide Diagnostics' : 'Developer Diagnostics'}</span>
                {this.state.showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Developer Diagnostic Breakdown */}
            {this.state.showTechnicalDetails && (
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-xs font-mono space-y-3 animate-fadeIn">
                <div className="grid grid-cols-2 gap-2 text-neutral-400 border-b border-neutral-800/60 pb-3">
                  <div><span className="text-neutral-500">Code:</span> {diag.code}</div>
                  <div><span className="text-neutral-500">Name:</span> {diag.name}</div>
                  <div><span className="text-neutral-500">HTTP Status:</span> {diag.httpStatus || 'N/A'}</div>
                  <div><span className="text-neutral-500">Timestamp:</span> {diag.timestamp}</div>
                </div>

                {/* Suggested Fix */}
                <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-lg p-3 text-indigo-300">
                  <div className="font-sans font-semibold text-indigo-400 mb-1 flex items-center space-x-1">
                    <span>Suggested Fix:</span>
                  </div>
                  <p className="font-mono text-[11px] leading-relaxed">{diag.suggestedFix}</p>
                </div>

                {/* Exception Message & Stack */}
                <div className="space-y-1">
                  <div className="text-neutral-400 font-sans font-medium">Exception Stack Trace:</div>
                  <div className="max-h-40 overflow-y-auto bg-black/60 p-3 rounded-lg text-red-400/90 whitespace-pre-wrap text-[11px] border border-neutral-800">
                    {diag.message}
                    {diag.stack && `\n\n${diag.stack}`}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
