import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getProfile } from "@/app/actions";
import ProfileForm from "@/components/profile-form";

export default async function ProjectsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }
  
  const profile = await getProfile(user.id);

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
