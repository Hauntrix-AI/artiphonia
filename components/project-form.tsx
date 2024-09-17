"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectsRowSchema } from "@/schemas";
import { SubmitButton } from "./submit-button";
import { Project, IProject } from "@/utils/types";
import { createOrSaveProject } from "@/app/actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";


export default function ProjectForm(project: Project) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IProject>({
     resolver: zodResolver(projectsRowSchema)
  });

  const onSubmit = (data: any) => { 
    createOrSaveProject(data).then((result: any) => {
        if (result.message) {
        toast.error(result.message);
        } else {
        toast.success("Project updated successfully!");
        }
    });

    router.push('/dashboard');
  }

  const project_data = project.project;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-2">
      <div className="col-span-1 gap-2">
        <label htmlFor="name" className="flex">Project Name</label>
        <input {...register("name")} defaultValue={project_data?.name} className="flex w-full" />
      </div>

      <div className="col-span-1 gap-2">
        <label htmlFor="description" className="flex">Description</label>
        <input {...register("description")} defaultValue={project_data?.description} className="flex w-full" />
      </div>

      <input type="hidden" {...register("user_id")} value={project_data?.user_id} />
      <input type="hidden" {...register("id")} value={project_data?.id} />

      <SubmitButton>Submit</SubmitButton>
    </form>
  )

}