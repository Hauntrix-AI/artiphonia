"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profilesRowSchema } from "@/schemas";
import { SubmitButton } from "./submit-button";

interface IFormInput {
  first_name: string
  last_name: string
  bio: string
  avatar: FileList
  id: string
}

export default function ProfileForm(profile: string[] | any, user: any) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>({
     resolver: zodResolver(profilesRowSchema)
  })
  const onSubmit = (data: any) => { console.log(data) }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("first_name")} defaultValue={profile.first_name}/>
      <p>{errors.first_name?.message}</p>

      <input {...register("last_name")} defaultValue={profile.last_name} />
      <p>{errors.last_name?.message}</p>

      <input {...register("bio")} defaultValue={profile.bio} />
      <p>{errors.bio?.message}</p>

      <input type="file" {...register("avatar")} />
      <p>{errors.avatar?.message}</p>

      <input type="hidden" {...register("id")} defaultValue={user.id} />

      <SubmitButton>Submit</SubmitButton>
    </form>
  )

}