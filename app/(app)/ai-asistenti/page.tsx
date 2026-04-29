export default function AiAsistentiPage() {
  return (
    <div className="px-4 lg:px-6 py-6 max-w-[90rem] mx-auto w-full h-full">
      <h1 className="text-3xl font-bold text-default-900 mb-6">AI asistenti</h1>
      <div className="border border-default-200 rounded-2xl overflow-hidden" style={{ height: "80vh" }}>
        <iframe
          src="https://lapaserv-my.sharepoint.com/personal/adamcik_lapaservice_com/_layouts/15/Doc.aspx?sourcedoc=%7B43E894A3-C79A-4985-9FC2-753823F1DEE4%7D&action=embedview"
          width="100%"
          height="100%"
          frameBorder="0"
          title="ZAKAZKY.xlsx"
        />
      </div>
    </div>
  );
}
