import PortalPlaceholder from "@/components/PortalPlaceholder";
export const metadata = { title: "Admin overview | CleanPro" };
export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <PortalPlaceholder title="Admin overview" coming="Revenue and job metrics are built in Phase 5." error={error} />;
}
