import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function SimpleTable() {
  return (
    <Card className="mt-12">
      <CardHeader>
        <CardTitle>Simple Table</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Header 1</TableHead>
              <TableHead>Header 2</TableHead>
              <TableHead>Header 3</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Row 1, Cell 1</TableCell>
              <TableCell>Row 1, Cell 2</TableCell>
              <TableCell>Row 1, Cell 3</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Row 2, Cell 1</TableCell>
              <TableCell>Row 2, Cell 2</TableCell>
              <TableCell>Row 2, Cell 3</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Row 3, Cell 1</TableCell>
              <TableCell>Row 3, Cell 2</TableCell>
              <TableCell>Row 3, Cell 3</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Row 4, Cell 1</TableCell>
              <TableCell>Row 4, Cell 2</TableCell>
              <TableCell>Row 4, Cell 3</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
