export function TaskDetail({
  detail,
  title,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="w-96 break-all h-28 m-5 shadow-2xl flex flex-col items-center justify-around">
      <h1 className="font-bold text-xl">{title}</h1>
      <h1 className="break-words">{detail}</h1>
    </div>
  );
}
