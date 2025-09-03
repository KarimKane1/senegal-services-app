// Event logging utility for admin dashboard analytics
import { trackEvent, trackClientEvent, trackServerEvent, EventType } from './trackEvent';

export interface EventData {
  event_type: string;
  user_id?: string;
  provider_id?: string;
  metadata?: Record<string, any>;
}

export class EventLogger {
  private static instance: EventLogger;
  private events: EventData[] = [];

  private constructor() {}

  public static getInstance(): EventLogger {
    if (!EventLogger.instance) {
      EventLogger.instance = new EventLogger();
    }
    return EventLogger.instance;
  }

  public async logEvent(eventData: EventData): Promise<void> {
    try {
      // Add timestamp
      const event = {
        ...eventData,
        timestamp: new Date().toISOString(),
      };

      // Store locally for batching
      this.events.push(event);

      // Use the new Supabase event tracking
      await trackEvent(
        eventData.event_type as EventType,
        eventData.user_id,
        {
          provider_id: eventData.provider_id,
          ...eventData.metadata,
        }
      );
    } catch (error) {
      console.error('Failed to log event:', error);
    }
  }

  private async sendToServer(event: EventData & { timestamp: string }): Promise<void> {
    try {
      await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to send event to server:', error);
    }
  }

  // Convenience methods for common events
  public async logProfileView(providerId: string, userId?: string): Promise<void> {
    await this.logEvent({
      event_type: 'profile_view',
      provider_id: providerId,
      user_id: userId,
    });
  }

  public async logContactClick(providerId: string, userId?: string, contactMethod?: string): Promise<void> {
    await this.logEvent({
      event_type: 'contact_click',
      provider_id: providerId,
      user_id: userId,
      metadata: { contact_method: contactMethod },
    });
  }

  public async logRecommendationAdd(providerId: string, userId: string): Promise<void> {
    await this.logEvent({
      event_type: 'recommendation_add',
      provider_id: providerId,
      user_id: userId,
    });
  }

  public async logUserLogin(userId: string): Promise<void> {
    await this.logEvent({
      event_type: 'user_login',
      user_id: userId,
    });
  }

  public async logUserSignup(userId: string): Promise<void> {
    await this.logEvent({
      event_type: 'user_signup',
      user_id: userId,
    });
  }
}

// Export singleton instance
export const eventLogger = EventLogger.getInstance();

// React hook for easy event logging
export function useEventLogger() {
  return {
    logProfileView: eventLogger.logProfileView.bind(eventLogger),
    logContactClick: eventLogger.logContactClick.bind(eventLogger),
    logRecommendationAdd: eventLogger.logRecommendationAdd.bind(eventLogger),
    logUserLogin: eventLogger.logUserLogin.bind(eventLogger),
    logUserSignup: eventLogger.logUserSignup.bind(eventLogger),
    logEvent: eventLogger.logEvent.bind(eventLogger),
  };
}
