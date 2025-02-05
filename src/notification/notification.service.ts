import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const Pushover = require('pushover-notifications');

interface PushoverResponse {
  status: number;
  request: string;
  info?: string;
}

@Injectable()
export class NotificationService {
  private push: any;
  private readonly logger = new Logger(NotificationService.name);

  constructor(private configService: ConfigService) {
    const token = this.configService.get('PUSHOVER_TOKEN');
    const user = this.configService.get('PUSHOVER_USER');

    if (!token || !user) {
      this.logger.warn('Pushover credentials not configured properly');
      return;
    }

    this.push = new Pushover({
      token,
      user,
    });
  }

  async sendOrderNotification(
    orderId: number,
    customerId: number,
  ): Promise<void> {
    try {
      if (!this.push) {
        throw new Error('Pushover client not initialized');
      }

      let message = {
        message: `New order #${orderId} created by customer #${customerId}`,
        title: 'New Order Received',
        priority: 1,
        retry: 30,
        expire: 10800,
        sound: 'cosmic',
      };
      
      this.push.send(message, (err: Error | null, result: PushoverResponse) => {
        if (err) {
          this.logger.error(`Failed to send notification: ${err.message}`);
        }
        this.logger.log(`Pushover result: ${JSON.stringify(result)}`);
        
        this.logger.log(`Notification sent for order #${orderId}`);
      });
    } catch (error) {
      this.logger.error(
        `Failed to send notification for order #${orderId}: ${error.message}`,
        error.stack,
      );
    }
  }
}
