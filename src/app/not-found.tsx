import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center flex-col">
      <h1 className="text-4xl font-bold mb-4">404 - Not Found</h1>
      <p className="text-gray-600">
        Sorry, the page you&apos;re looking for doesn&apos;t exist.
      </p>

      <div className="mt-4 flex gap-3 text-center">
        <Link href="/accounts" className="text-blue-500 underline">
          Accounts
        </Link>
        <Link href="/case-studies" className="text-blue-500 underline">
          Case-studies
        </Link>
        <Link href="/users" className="text-blue-500 underline">
          Users
        </Link>
      </div>
    </div>
  );
}
