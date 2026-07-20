import { redirect } from "next/navigation";

export default function AdminUploadRedirectPage() {
  redirect("/admin/media");
}
