export default function PageHeading({ title }: { title: string }) {
  return (
    <div
      className={'flex items-center p-3 h-16 w-full text-2xl font-bold border-b-2 border-gray-200'}
    >
      {title}
    </div>
  );
}
