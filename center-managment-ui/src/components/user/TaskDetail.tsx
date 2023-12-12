export function TaskDetail({
  detail,
  title,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="w-64 h-28 m-5 shadow-2xl flex flex-col items-center justify-around">
      <h1 className="font-bold text-xl">{title}</h1>
      <h1>{detail}</h1>
    </div>
  );
}
