import { format } from "@fast-csv/format";
import { Response } from "express";


export function exportToCSV(
  res: Response,
  filename: string,
  rows: Record<string, any>[]
) {
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );

  res.setHeader("Content-Type", "text/csv");

  const csvStream = format({
    headers: true,
  });

  csvStream.pipe(res);

  rows.forEach((row) => csvStream.write(row));

  csvStream.end();
}

