declare module "africastalking" {
  interface SmsRecipientResult {
    cost?: string;
    messageId?: string;
    number: string;
    status: string;
    statusCode?: number;
  }

  interface SmsResponse {
    SMSMessageData?: {
      Message?: string;
      Recipients?: SmsRecipientResult[];
    };
  }

  interface SmsOptions {
    to: string | string[];
    message: string;
    senderId?: string;
    enqueue?: boolean;
  }

  interface Client {
    SMS: {
      send(options: SmsOptions): Promise<SmsResponse>;
    };
  }

  export default function AfricasTalking(credentials: {
    username: string;
    apiKey: string;
  }): Client;
}
