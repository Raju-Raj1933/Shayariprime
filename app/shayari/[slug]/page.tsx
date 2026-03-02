import { redirect } from "next/navigation";

// The shayari detail page has been removed.
// All content is now shown inline on cards on the home page.
// Any old bookmarked/shared URL redirects to home.

export default function ShayariDetailPage() {
    redirect("/");
}
