import { useState } from 'react';
import { useToast } from '../hooks/use-toast';
import { toast } from '../hooks/use-toast';

const TPOPlacementPanelSimple = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, file.type, file.size);

    if (!file.name.endsWith('.xlsx')) {
      toast({
        title: "Invalid File",
        description: "Please upload an Excel file (.xlsx)",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      console.log('Starting file processing...');
      
      // Show a simple toast to indicate processing started
      toast({
        title: "Processing File",
        description: `Reading ${file.name}...`,
      });

      const data = await file.arrayBuffer();
      console.log('File read as array buffer, size:', data.byteLength);
      
      // Dynamic import of XLSX to avoid bundling issues
      const XLSX = await import('xlsx');
      console.log('XLSX imported successfully:', XLSX);
      
      const workbook = XLSX.read(data, { type: 'buffer' });
      console.log('Workbook read, sheets:', workbook.SheetNames);
      
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new Error('No sheets found in Excel file');
      }
      
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
      console.log('Excel data parsed:', jsonData.length, 'rows');

      if (jsonData.length === 0) {
        throw new Error('No data found in Excel file');
      }

      // Simple success message
      toast({
        title: "File Processed",
        description: `Successfully processed ${jsonData.length} rows from ${file.name}`,
      });

      console.log('File processing completed successfully');

    } catch (error: unknown) {
      console.error('Error processing file:', error);
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : 'Failed to process file',
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-center">Excel Upload Test</h1>
        
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <div className="mb-4">
            <label htmlFor="excel-upload" className="cursor-pointer">
              <div className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Choose Excel File (.xlsx)
              </div>
              <input
                type="file"
                accept=".xlsx"
                onChange={handleFileUpload}
                className="hidden"
                id="excel-upload"
                disabled={isUploading}
              />
            </label>
          </div>
          
          {isUploading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Processing file...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TPOPlacementPanelSimple;
