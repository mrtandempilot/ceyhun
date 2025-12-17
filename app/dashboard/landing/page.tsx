import { redirect } from 'next/navigation';

export default function LandingRedirect() {
  redirect('/dashboard/telegram');
}
