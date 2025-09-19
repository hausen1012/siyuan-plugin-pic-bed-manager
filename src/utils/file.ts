export function resolveFiles(input: FileList | DataTransferItemList | File[] | undefined): File[] {
  const files: File[] = [];

  if (!input) return files;

  // FileList
  if (input instanceof FileList) {
      return Array.from(input);
  } 
  // DataTransferItemList
  else if (input instanceof DataTransferItemList) {
      for (let i = 0; i < input.length; i++) {
          const item = input[i];
          if (item.kind === "file") {
              const file = item.getAsFile();
              if (file) files.push(file);
          }
      }
  } 
  // Array of Files
  else if (Array.isArray(input)) {
      return input;
  }

  return files;
}


export function isImageFile(filename: string): boolean {
  const imageExts = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"];
  const name = filename.toLowerCase();
  return imageExts.some(ext => name.endsWith(ext));
}
