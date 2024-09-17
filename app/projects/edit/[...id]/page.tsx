import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { IProject } from "@/utils/types";
import ProjectForm from "@/components/project-form";

export default async function EditProjectsPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const {data: project } = await supabase.from('projects').select().match({ user_id: user.id, id: params.id }).single<IProject>();

  return (
    <div className="flex-1 w-full flex flex-col gap-12 pt-24 max-w-3xl mx-auto">
      <div className="w-full">
        <ProjectForm project={project} />
      </div>
    </div>
  );
}
