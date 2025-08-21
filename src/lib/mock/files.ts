// Mock data for file operations

export const mockUploadFile = (data: FormData): Promise<void> => {
  console.log('Mocking file upload:', data.get('file')?.name);
  return Promise.resolve();
};

export const mockDownloadFile = (fileId: string): Promise<Blob> => {
  console.log('Mocking file download for fileId:', fileId);
  const content = `This is a mock file for ID ${fileId}`;
  const blob = new Blob([content], { type: 'text/plain' });
  return Promise.resolve(blob);
};

export const mockConsolidateFiles = (data: {
  fileIds: string[];
  newFileName: string;
}): Promise<void> => {
  console.log('Mocking file consolidation:', data);
  return Promise.resolve();
};