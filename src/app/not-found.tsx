import { redirect } from 'next/navigation';

/**
 * This component runs when a user hits a route that does not exist.
 * It will execute AFTER checking next.config.js redirects.
 */
export default function NotFound(): null {
  redirect('/');
  
  return null;
}