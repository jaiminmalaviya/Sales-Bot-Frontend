import {
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
  Table,
} from "@/components/ui/table";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => JSX.Element | string;
}

interface Props {
  columns: Column[];
  data: any[];
  editButton?: (row: any, idx: number) => JSX.Element;
  deleteButton?: (row: any, idx: number) => JSX.Element;
}

const DynamicTable: React.FC<Props> = ({ columns, data, editButton, deleteButton }) => {
  const pathname = usePathname();
  return (
    <div className="border shadow-sm rounded-lg">
      <Table className="text-xs">
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index} className="">
                {column.label}
              </TableHead>
            ))}
            {(editButton || deleteButton) && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={row._id.$oid} id={`table-row-${rowIndex}`}>
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex}>
                  {pathname === "/accounts" ? (
                    <Link href={`/accounts/${row._id.$oid}`}>
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </Link>
                  ) : (
                    <>{column.render ? column.render(row[column.key], row) : row[column.key]}</>
                  )}
                </TableCell>
              ))}
              {(editButton || deleteButton) && (
                <TableCell>
                  {editButton && editButton(row, rowIndex)}
                  {deleteButton && deleteButton(row, rowIndex)}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DynamicTable;
