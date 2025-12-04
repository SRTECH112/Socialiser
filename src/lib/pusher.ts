import Pusher from "pusher";

const { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER } = process.env;

// Log missing environment variables for debugging
const missingVars = [];
if (!PUSHER_APP_ID) missingVars.push('PUSHER_APP_ID');
if (!PUSHER_KEY) missingVars.push('PUSHER_KEY');
if (!PUSHER_SECRET) missingVars.push('PUSHER_SECRET');
if (!PUSHER_CLUSTER) missingVars.push('PUSHER_CLUSTER');

if (missingVars.length > 0) {
  console.error(`Missing required Pusher environment variables: ${missingVars.join(', ')}`);
}

export const pusherServer = (() => {
  try {
    if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET || !PUSHER_CLUSTER) {
      console.error('One or more Pusher environment variables are missing');
      return null;
    }

    const pusher = new Pusher({
      appId: PUSHER_APP_ID,
      key: PUSHER_KEY,
      secret: PUSHER_SECRET,
      cluster: PUSHER_CLUSTER,
      useTLS: true,
    });

    // Test the Pusher connection
    pusher.get({
      path: '/',
      params: {}
    }).then(() => {
      console.log('Pusher server connected successfully');
    }).catch((error) => {
      console.error('Pusher connection test failed:', error);
    });

    return pusher;
  } catch (error) {
    console.error('Failed to initialize Pusher:', error);
    return null;
  }
})();
