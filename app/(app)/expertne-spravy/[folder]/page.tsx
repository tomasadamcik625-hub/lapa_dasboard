import Link from "next/link";

const FOLDER_NAMES: Record<string, string> = {
  "priprava": "Príprava",
  "revizia": "Revízia",
  "konecne-citanie": "Konečné čítanie",
  "zaverecne-citanie": "Záverečné čítanie",
};

export default function FolderPage({ params }: { params: { folder: string } }) {
  const name = FOLDER_NAMES[params.folder] ?? params.folder;

  return (
    <div className="px-4 lg:px-6 py-6 max-w-[90rem] mx-auto w-full">
      <div className="flex items-center gap-2 text-sm text-default-400 mb-6">
        <Link href="/expertne-spravy" className="hover:text-[#7DC8E8] transition-colors">
          Expertné správy
        </Link>
        <span>/</span>
        <span className="text-default-700 font-medium">{name}</span>
      </div>

      <h1 className="text-3xl font-bold text-default-900 mb-8">{name}</h1>

      <div className="flex flex-col items-center justify-center h-64 border border-dashed border-default-300 rounded-2xl text-default-400">
        <p className="text-sm">Priečinok je prázdny</p>
      </div>
    </div>
  );
}
