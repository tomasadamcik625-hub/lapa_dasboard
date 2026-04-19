import Link from "next/link";

export default function ServerFolderPage({ params }: { params: { folder: string } }) {
  return (
    <div className="px-4 lg:px-6 py-6 max-w-[90rem] mx-auto w-full">
      <div className="flex items-center gap-2 text-sm text-default-400 mb-6">
        <Link href="/server" className="hover:text-[#7DC8E8] transition-colors">
          Server
        </Link>
        <span>/</span>
        <span className="text-default-700 font-medium">{params.folder}</span>
      </div>

      <h1 className="text-3xl font-bold text-default-900 mb-8">{params.folder}</h1>

      <div className="flex flex-col items-center justify-center h-64 border border-dashed border-default-300 rounded-2xl text-default-400">
        <p className="text-sm">Priečinok je prázdny</p>
      </div>
    </div>
  );
}
