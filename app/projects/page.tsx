import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProjectsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const {data: projects } = await supabase.from('projects').select().match({ user_id: user.id });

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <Link href="/projects/new">Create New Project</Link>

      <div className="w-full grid-cols-3 grid gap-6">
            {
              projects?.map((project) => {
                return (
                  <a
                    href={`/projects/edit/${project.id}`}
                    key={project.id}
                    className="relative flex overflow-hidden rounded-lg border border-gray-100 p-4 sm:p-6 lg:p-8 flex-col col-span-1"
                  >
                    <span
                      className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-green-300 via-blue-500 to-purple-600"
                    ></span>

                    <div className="sm:flex sm:justify-between sm:gap-4">
                      <h3 className="text-lg font-bold text-gray-900 sm:text-xl">
                        { project.name }
                      </h3>
                    </div>

                    <div className="mt-4 w-full">
                      <p className="text-pretty text-sm text-gray-500">
                        { project.description }
                      </p>
                    </div>
                  </a>
                )
              })
            }
      </div>
    </div>
  );
}
