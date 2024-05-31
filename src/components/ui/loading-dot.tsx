export default function LoadingDot({ isLoading = true }: { isLoading?: boolean }) {
  if (!isLoading) {
    return undefined;
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div
        className={`border-2 border-blue-500 border-t-2 border-t-white h-4 w-4 rounded-full animate-spin`}></div>
    </div>
  );
}
