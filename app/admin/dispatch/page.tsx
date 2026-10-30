import PortalPlaceholder from "@/components/PortalPlaceholder";
export const metadata = { title: "Dispatch | CleanPro" };
export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <PortalPlaceholder title="Dispatch" coming="Assigning cleaners to jobs is built in Phase 5." error={error} />;
}
