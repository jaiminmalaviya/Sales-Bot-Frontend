import { Badge } from "@/components/ui/badge";

interface ListCardProps {
  items: string[];
}

const ListTags: React.FC<ListCardProps> = ({ items }) => {
  return (
    <div className="p-4 sm:py-8 sm:px-6 lg:py-10 lg:px-8 dark:bg-gray-800 overflow-y-scroll max-h-[calc(100vh-140px)]">
      <div className="flex items-center justify-between mb-5">
        <h5 className="text-2xl font-bold leading-none text-gray-900 dark:text-white">Tags</h5>
      </div>
      <div className="flex flex-wrap gap-3">
        {items.map((item, index) => (
          <Badge className="truncate" variant="secondary" key={index}>
            {item}
          </Badge>
        ))}
        {items.length === 0 && <span className="text-sm text-gray-600">No tags found</span>}
      </div>
    </div>
  );
};

export default ListTags;
