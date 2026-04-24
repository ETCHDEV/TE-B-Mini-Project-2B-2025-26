import { toast } from '@/hooks/use-toast';

export interface ErrorContext {
  operation: string;
  userId?: string;
  userEmail?: string;
  studentId?: string;
  additionalInfo?: Record<string, unknown>;
}

interface SupabaseError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  
  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public handleError(error: Error, context: ErrorContext): void {
    // Log to console with detailed information
    console.group(`🚨 Error in ${context.operation}`);
    console.error('Error:', error);
    console.error('Context:', context);
    console.groupEnd();

    // Show user-friendly toast notification
    this.showUserFriendlyError(error, context);

    // In production, you might want to send this to an error reporting service
    if (typeof window !== 'undefined' && (window as any).process?.env?.NODE_ENV === 'production') {
      this.logToService(error, context);
    }
  }

  private showUserFriendlyError(error: Error, context: ErrorContext): void {
    let title = 'Something went wrong';
    let description = 'An unexpected error occurred. Please try again.';

    // Handle specific error types
    if (error.message.includes('JWT') || error.message.includes('Unauthorized')) {
      title = 'Authentication Error';
      description = 'Your session has expired. Please log in again.';
    } else if (error.message.includes('Forbidden') || error.message.includes('permission')) {
      title = 'Access Denied';
      description = 'You do not have permission to perform this action.';
    } else if (error.message.includes('Network') || error.message.includes('fetch')) {
      title = 'Network Error';
      description = 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.message.includes('validation') || error.message.includes('required')) {
      title = 'Validation Error';
      description = 'Please check your input and try again.';
    } else if (context.operation.includes('Supabase')) {
      title = 'Database Error';
      description = 'Unable to save your changes. Please try again later.';
    }

    toast({
      title,
      description,
      variant: 'destructive',
    });
  }

  private logToService(error: Error, context: ErrorContext): void {
    // In a real application, you would send this to an error reporting service
    // like Sentry, LogRocket, or your own backend
    console.log('Would send to error reporting service:', {
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
    });
  }

  public handleSupabaseError(error: SupabaseError, operation: string, context?: Partial<ErrorContext>): void {
    const errorContext: ErrorContext = {
      operation,
      ...context,
    };

    if (error?.code === 'PGRST116') {
      this.handleError(new Error('Resource not found'), errorContext);
    } else if (error?.code === 'PGRST301') {
      this.handleError(new Error('Access denied'), errorContext);
    } else if (error?.code === '23505') {
      this.handleError(new Error('Duplicate entry'), errorContext);
    } else if (error?.code === '23503') {
      this.handleError(new Error('Referenced data not found'), errorContext);
    } else {
      this.handleError(new Error(error?.message || 'Unknown error'), errorContext);
    }
  }
}

export const errorHandler = ErrorHandler.getInstance();
