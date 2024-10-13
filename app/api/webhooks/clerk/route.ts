import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { sql } from '@vercel/postgres'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, username, created_at } = evt.data;

    // Convert the Unix timestamp to an ISO 8601 string
    const createdAtDate = new Date(created_at).toISOString();

    try {
      // Upsert the user data into the user_profiles table
      await sql`
        INSERT INTO user_profiles (clerk_user_id, username, created_at)
        VALUES (${id}, ${username}, ${createdAtDate})
        ON CONFLICT (clerk_user_id)
        DO UPDATE SET
          username = EXCLUDED.username,
          created_at = EXCLUDED.created_at
      `;

      console.log(`User ${id} ${eventType === 'user.created' ? 'created' : 'updated'} successfully`);
    } catch (error) {
      console.error('Error upserting user data:', error);
      return new Response('Error occurred while updating database', {
        status: 500
      });
    }
  }

  return new Response('Webhook processed successfully', { status: 200 });
}