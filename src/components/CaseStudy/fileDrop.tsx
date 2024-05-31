import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
import { DownloadIcon } from "@/assets/icons";
import { FileUploader } from "react-drag-drop-files";

interface DragAndDropProps {
  form: any;
}

const FileDrop: React.FC<DragAndDropProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="file"
      render={({ field }) => (
        <FormItem>
          <FormLabel>File (.md only)</FormLabel>
          <FormControl>
            <FileUploader
              handleChange={(file: File) => {
                field.onChange(file);
                form.trigger("file");
              }}
              maxSize={5}
              classes="flex items-center"
              dropMessageStyle={{
                color: "black",
                opacity: 0.85,
                fontWeight: 600,
              }}
            >
              <div
                className={`flex flex-1 flex-col items-center justify-center space-y-2 rounded-lg outline-2 outline-dashed outline-gray-400 outline-offset-[-5px] bg-gray-200 py-12 text-center cursor-pointer`}
              >
                <DownloadIcon className="text-gray-600 h-6 w-6" />
                <p className="text-gray-700 text-sm">
                  {form.watch("file") ? (
                    <span>
                      File Successfully uploaded:{" "}
                      <span className="underline">
                        {form.watch("file")?.name}
                      </span>
                    </span>
                  ) : (
                    "Drag & Drop or Click to Upload"
                  )}
                </p>
              </div>
            </FileUploader>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FileDrop;
