import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";
import { IProfile } from "@/utils/types";

export default async function AuthButton() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const {data: profile } = await supabase.from('profiles').select().match({ id: user?.id }).single<IProfile>();

  return user ? (
    <div className="flex items-center gap-4">
      {
        profile?.first_name ? (
          <span>Hey, <Link className="inline" href="/profile">{profile.first_name}!</Link></span>
        ) : (
          <span>Hey, <Link className="inline" href="/profile">{user.email}!</Link></span>
        )
      }
      <form action={signOutAction}>
        <Button type="submit" variant={"outline"}>
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
