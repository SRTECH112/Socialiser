import PusherClient from "pusher-js";

let client: PusherClient | null = null;

export function getPusherClient() {
  if (typeof window === "undefined") {
    return null;
  }

  if (client) {
    return client;
  }

  const key = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu';

  if (!key || !cluster) {
    console.error("Pusher environment variables are not properly set");
    return null;
  }

  client = new PusherClient(key, {
    cluster,
    forceTLS: true,
    authEndpoint: '/api/pusher/auth',
    auth: {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  });

  // Debugging
  client.connection.bind('state_change', (states: any) => {
    console.log('Pusher connection state changed:', states);
  });

  client.connection.bind('error', (err: any) => {
    console.error('Pusher connection error:', err);
  });

  return client;
}
