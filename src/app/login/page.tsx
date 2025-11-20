import { redirect } from "next/navigation";
import React from 'react';

export default function Page(): React.ReactElement | null {
  // Redirect legacy /login to the consolidated /auth page
  redirect('/auth');
  // Return null to satisfy the component contract after redirect
  return null;
}
