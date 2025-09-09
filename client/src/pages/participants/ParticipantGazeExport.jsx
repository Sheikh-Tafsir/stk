import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";

import { API } from "@/middleware/Api";
import { Button } from "@/components/ui/button";
import { isNull } from "@/utils/utils";
import { TOAST_TYPE } from "@/utils/enums";

const ParticipantGazeExport = ({ id, onDownloadResult }) => {
  const [isLoading, setIsLoading] = useState(false);

  const downloadCSV = async () => {
    if (isLoading) return; // 🔒 Prevent spam clicks during download

    setIsLoading(true);
    try {
      const response = await API.get(`/participants/${id}/gaze`);
      const data = response?.data?.data;

      if (isNull(data) || data.length === 0) {
        onDownloadResult("No data available", TOAST_TYPE.WARNING);
        return;
      }

      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(","),
        ...data.map(row =>
          headers.map(header => JSON.stringify(row[header] ?? "")).join(",")
        ),
      ];

      const csvString = csvRows.join("\n");
      const blob = new Blob([csvString], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${id}.csv`;
      link.click();

      URL.revokeObjectURL(url);
      onDownloadResult("Download successful", TOAST_TYPE.SUCCESS);
    } catch (error) {
      console.error("CSV download failed:", error);
      onDownloadResult("Failed to download", TOAST_TYPE.ERROR);
    } finally {
      // ✅ Always reset loading regardless of success/fail
      setIsLoading(false);
    }
  };

  return (
    <Button variant="outline" size="icon" onClick={downloadCSV} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  );
};

export default ParticipantGazeExport;