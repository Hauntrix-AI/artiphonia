'use server';

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/profile-form";
import { Profile } from "@/utils/types";

export default async function ProjectsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }
  
  const {data: profile } = await supabase.from('profiles').select().match({ id: user.id }).single<Profile>();

  return (
    <div className="flex-1 w-full flex flex-col gap-12 pt-24 max-w-3xl mx-auto">
      <div className="w-full">
        <ProfileForm profile={profile} /> { // eslint-disable-line
        }
      </div>
    </div>
  );
}
