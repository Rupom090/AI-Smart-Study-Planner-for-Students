import { useEffect } from 'react';
import axios from 'axios';

interface AnalyticsEvent {
  event_type: string;
  event_name: string;
  properties?: Record<string, any>;
  url?: string;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private queue: AnalyticsEvent[] = [];
  private isProcessing = false;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public async track(event: AnalyticsEvent) {
    this.queue.push(event);
    
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  private async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const event = this.queue.shift();

    try {
      await axios.post('/api/v1/analytics/event', event);
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }

    // Process next event
    setTimeout(() => this.processQueue(), 100);
  }

  public pageView(pageName: string, properties?: Record<string, any>) {
    this.track({
      event_type: 'page_view',
      event_name: pageName,
      properties,
      url: window.location.href,
    });
  }

  public buttonClick(buttonName: string, properties?: Record<string, any>) {
    this.track({
      event_type: 'click',
      event_name: buttonName,
      properties,
    });
  }

  public formSubmit(formName: string, properties?: Record<string, any>) {
    this.track({
      event_type: 'form_submit',
      event_name: formName,
      properties,
    });
  }

  public customEvent(eventName: string, eventType: string, properties?: Record<string, any>) {
    this.track({
      event_type: eventType,
      event_name: eventName,
      properties,
    });
  }
}

export function useAnalytics(pageName?: string) {
  const analytics = AnalyticsService.getInstance();

  useEffect(() => {
    if (pageName) {
      analytics.pageView(pageName);
    }
  }, [pageName]);

  return {
    trackPageView: analytics.pageView.bind(analytics),
    trackClick: analytics.buttonClick.bind(analytics),
    trackFormSubmit: analytics.formSubmit.bind(analytics),
    trackEvent: analytics.customEvent.bind(analytics),
  };
}

export default AnalyticsService;
