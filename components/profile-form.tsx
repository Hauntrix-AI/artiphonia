"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profilesRowSchema } from "@/schemas";
import { SubmitButton } from "./submit-button";
import { Profile, IProfile } from "@/utils/types";
import { saveProfile } from "@/app/actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ProfileForm(profile: Profile) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IProfile>({
     resolver: zodResolver(profilesRowSchema)
  });
  
  const onSubmit = (data: any) => { 
    saveProfile(data).then((result: any) => {
      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success("Profile updated successfully!");
      }
    });

    router.push("/dashboard");
  }

  const profile_data = profile.profile;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-2">
      <div className="col-span-1 gap-2">
        <label htmlFor="first_name" className="flex">First Name</label>
        <input {...register("first_name")} defaultValue={profile_data?.first_name} className="flex w-full" />
      </div>

      <div className="col-span-1 gap-2">
        <label htmlFor="last_name" className="flex">Last Name</label>
        <input {...register("last_name")} defaultValue={profile_data?.last_name} className="flex w-full" />
      </div>

      <div className="col-span-2">
        <label htmlFor="bio" className="flex w-full">Bio</label>
        <input {...register("bio")} defaultValue={profile_data?.bio} className="flex w-full" />
      </div>

      <input type="hidden" {...register("id")} value={profile_data?.id} />

      <SubmitButton className="w-auto col-span-2">Submit</SubmitButton>
    </form>
  )

}