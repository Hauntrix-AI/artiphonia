import ProjectForm from "@/components/project-form";
import { IProject } from "@/utils/types";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';


export default async function NewProjectsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const emptyProj: IProject = {
    name: "",
    description: "",
    user_id: user.id,
    id: uuidv4()
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12 pt-24 max-w-3xl mx-auto">
        <ProjectForm project={emptyProj} />
    </div>
  );
}
